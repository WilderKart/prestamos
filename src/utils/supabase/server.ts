import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // No hacer nada en Server Components
          }
        },
      },
    }
  );
}

/**
 * Cliente administrativo para operaciones privilegiadas (Service Role)
 * SOLO debe usarse en Server Actions o API Routes.
 */
export async function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("CRÍTICO: SUPABASE_SERVICE_ROLE_KEY no está configurada.");
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      cookies: {
        getAll() { return []; },
        setAll() { /* El cliente admin no necesita gestionar cookies de sesión */ },
      },
    }
  );
}

export interface UserSession {
  user: import("@supabase/supabase-js").User;
  role: string | null;
  isActive: boolean;
  status: string; // Estado real (ACTIVO, VACACIONES, etc)
  empresa_id: string | null;
  config_notificaciones: any | null;
  debeCambiarPassword: boolean;
}

export interface AuthSession extends UserSession {
  supabase: import("@supabase/supabase-js").SupabaseClient;
  userData: UserSession; // Alias para compatibilidad con código existente
}

export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const supabase = await createClient();
    
    // ========== ZERO TRUST: Validar sesión explícitamente ==========
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return null;
    }

    // ========== Obtener datos de usuario (Rol, Empresa, Estado) ==========
    const { data: userData, error: fetchError } = await supabase
      .from("usuarios")
      .select("rol, estado, empresa_id, debe_cambiar_password, config_notificaciones")
      .eq("id", user.id)
      .single();

    if (fetchError || !userData) {
      console.error("Error obteniendo datos de perfil:", fetchError);
      return null;
    }

    return {
      user,
      role: userData.rol ? userData.rol.toUpperCase() : null,
      isActive: userData.estado === "ACTIVO",
      status: userData.estado || "ACTIVO",
      empresa_id: userData.empresa_id,
      config_notificaciones: userData.config_notificaciones,
      debeCambiarPassword: !!userData.debe_cambiar_password
    };
  } catch (error) {
    console.error("Error crítico en getCurrentUser:", error);
    return null;
  }
}

export async function requireAuth(requiredRole?: "ADMIN" | "CAPITAN" | "CLIENTE" | "COBRADOR"): Promise<AuthSession> {
  const session = await getCurrentUser();
  const supabase = await createClient();

  if (!session) {
    redirect("/login");
  }

  // REQUISITO: Forzar cambio de contraseña en el primer login
  if (session.debeCambiarPassword) {
    redirect("/setup-password");
  }

  if (requiredRole && session.role !== requiredRole) {
    // Redirigir según el rol del usuario si existe
    if (session.role === "ADMIN") {
      redirect("/admin");
    } else if (session.role === "CAPITAN") {
      redirect("/capitan");
    } else {
      redirect("/cliente");
    }
  }

  // Bloqueo total Zero Trust
  if (session.status === "BLOQUEADO") {
    await supabase.auth.signOut();
    redirect("/login");
  }

  return { 
    ...session, 
    supabase,
    userData: session // Para compatibilidad
  };
}

export async function requireRole(allowedRoles: Array<"ADMIN" | "CAPITAN" | "CLIENTE" | "COBRADOR">): Promise<AuthSession> {
  const session = await getCurrentUser();
  const supabase = await createClient();

  if (!session) {
    redirect("/login");
  }

  if (!allowedRoles.includes(session.role as any)) {
    // Redirigir según el rol que tenga
    if (session.role === "ADMIN") {
      redirect("/admin");
    } else if (session.role === "CAPITAN") {
      redirect("/capitan");
    } else {
      redirect("/cliente");
    }
  }

  // Bloqueo total Zero Trust
  if (session.status === "BLOQUEADO") {
    await supabase.auth.signOut();
    redirect("/login");
  }

  return { 
    ...session, 
    supabase,
    userData: session // Para compatibilidad
  };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

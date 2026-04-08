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
            // En Server Actions se puede escribir cookies (login, logout, etc.)
            // En Server Components fallará silenciosamente — el middleware lo maneja
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // No hacer nada en Server Components (solo el middleware puede escribir aquí)
          }
        },
      },
    }
  );
}

export interface UserSession {
  user: import("@supabase/supabase-js").User;
  role: string | null;
  isActive: boolean;
}

export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const supabase = await createClient();
    
    // ========== ZERO TRUST: Validar sesión explícitamente ==========
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return null;
    }

    // ========== Obtener rol con manejo seguro ==========
    const { data: roleData, error: roleError } = await supabase.rpc("get_user_role");
    
    if (roleError) {
      console.error("Error RPC get_user_role:", roleError);
      return null;
    }

    const role = typeof roleData === "string" ? roleData : roleData?.[0]?.get_user_role;

    if (!role) {
      return null;
    }

    // ========== Verificar estado activo ==========
    const { data: activoData, error: activoError } = await supabase.rpc("usuario_activo");
    
    if (activoError) {
      console.error("Error RPC usuario_activo:", activoError);
      return null;
    }

    const isActive = activoData === true;

    return {
      user,
      role: role.toUpperCase(),
      isActive,
    };
  } catch (error) {
    console.error("Error crítico en getCurrentUser:", error);
    return null;
  }
}

export async function requireAuth(requiredRole?: "ADMIN" | "CAPITAN" | "CLIENTE"): Promise<UserSession> {
  const session = await getCurrentUser();

  if (!session) {
    redirect("/login");
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

  if (!session.isActive) {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return session;
}

export async function requireRole(allowedRoles: Array<"ADMIN" | "CAPITAN" | "CLIENTE">): Promise<UserSession> {
  const session = await getCurrentUser();

  if (!session) {
    redirect("/login");
  }

  if (!allowedRoles.includes(session.role as "ADMIN" | "CAPITAN" | "CLIENTE")) {
    // Redirigir según el rol que tenga
    if (session.role === "ADMIN") {
      redirect("/admin");
    } else if (session.role === "CAPITAN") {
      redirect("/capitan");
    } else {
      redirect("/cliente");
    }
  }

  return session;
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

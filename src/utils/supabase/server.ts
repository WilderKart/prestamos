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
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // Ignorar errores de cookies en Server Components
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
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return null;
    }

    const { data: roleData, error: roleError } = await supabase.rpc("get_user_role");
    
    if (roleError) {
      console.error("Error obteniendo rol:", roleError);
      return null;
    }

    const role = typeof roleData === "string" ? roleData : roleData?.[0]?.get_user_role;

    if (!role) {
      return null;
    }

    const { data: activoData, error: activoError } = await supabase.rpc("usuario_activo");
    
    const isActive = !activoError && activoData === true;

    return {
      user,
      role: role.toUpperCase(),
      isActive,
    };
  } catch (error) {
    console.error("Error en getCurrentUser:", error);
    return null;
  }
}

export async function requireAuth(requiredRole?: "ADMIN" | "CAPITAN" | "CLIENTE"): Promise<UserSession> {
  const session = await getCurrentUser();

  if (!session) {
    redirect("/login");
  }

  if (requiredRole && session.role !== requiredRole) {
    redirect("/login");
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
    redirect("/login");
  }

  return session;
}

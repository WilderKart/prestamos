"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function bloquearUsuario(userId: string, motivo: string) {
  const supabase = await createClient();

  const { error } = await supabase.rpc("bloquear_usuario", { 
    p_user_id: userId, 
    p_motivo: motivo 
  });

  if (error) {
    console.error("Error bloquear_usuario:", error);
    throw new Error(error.message || "Error al bloquear usuario");
  }

  revalidatePath("/admin/usuarios");
  revalidatePath("/admin/logs");
}

export async function desbloquearUsuario(userId: string) {
  const supabase = await createClient();

  const { error } = await supabase.rpc("desbloquear_usuario", { 
    p_user_id: userId 
  });

  if (error) {
    console.error("Error desbloquear_usuario:", error);
    throw new Error(error.message || "Error al desbloquear usuario");
  }

  revalidatePath("/admin/usuarios");
  revalidatePath("/admin/logs");
}

export async function cambiarRolUsuario(userId: string, nuevoRol: 'CLIENTE' | 'CAPITAN' | 'ADMIN') {
  const supabase = await createClient();

  const { error } = await supabase.rpc("cambiar_rol_usuario", { 
    p_user_id: userId,
    p_rol: nuevoRol
  });

  if (error) {
    console.error("Error cambiar_rol_usuario:", error);
    throw new Error(error.message || "Error al cambiar rol");
  }

  revalidatePath("/admin/usuarios");
  revalidatePath("/admin/logs");
}

export async function crearCapitan(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!nombre || !email || !password) {
    throw new Error("Todos los campos son obligatorios");
  }

  const { createClient: createAdminClient } = await import("@supabase/supabase-js");
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  // Crear en auth.users PASANDO el rol en user_metadata
  // El trigger handle_new_user leerá estos datos y creará la fila en public.usuarios con rol=CAPITAN
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      nombre,
      rol: 'CAPITAN'
    }
  });

  if (authError || !authData.user) {
    throw new Error(authError?.message || "Error al registrar en Auth.");
  }

  // Validar que el trigger lo creó correctamente con rol CAPITAN
  // Si no existe (raza condition), hacer upsert de seguridad
  const { data: checkUser } = await supabaseAdmin
    .from("usuarios")
    .select("id, rol")
    .eq("id", authData.user.id)
    .single();

  if (!checkUser) {
    // Fallback: insertar manualmente si el trigger no corrió
    const { error: dbError } = await supabaseAdmin
      .from("usuarios")
      .insert({
        id: authData.user.id,
        nombre,
        email,
        rol: 'CAPITAN',
        estado: 'ACTIVO'
      });

    if (dbError) {
      throw new Error(dbError.message || "Error al crear registro de usuario");
    }
  } else if (checkUser.rol !== 'CAPITAN') {
    // Si el trigger asignó rol incorrecto, corregir vía cambiar_rol_usuario RPC
    const { error: rolError } = await supabaseAdmin.rpc("cambiar_rol_usuario", {
      p_user_id: authData.user.id,
      p_rol: 'CAPITAN'
    });

    if (rolError) {
      throw new Error("Usuario creado pero no se pudo aplicar rol CAPITAN: " + rolError.message);
    }
  }

  revalidatePath("/admin/usuarios");
  revalidatePath("/admin/capitanes");
}

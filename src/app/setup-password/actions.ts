"use server";

import { createClient, getCurrentUser } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function actualizarPassword(prevState: any, formData: FormData) {
  try {
    const supabase = await createClient();
    const session = await getCurrentUser();

    if (!session) {
      return { error: "No autorizado. Por favor, inicia sesión de nuevo." };
    }

    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!password || password.length < 8) {
      return { error: "La contraseña debe tener al menos 8 caracteres." };
    }

    if (password !== confirmPassword) {
      return { error: "Las contraseñas no coinciden." };
    }

    // 1. Actualizar contraseña en Supabase Auth
    const { error: authError } = await supabase.auth.updateUser({
      password: password
    });

    if (authError) {
      throw new Error(`Error actualizando contraseña: ${authError.message}`);
    }

    // 2. Limpiar el flag de cambio mandatorio en public.usuarios
    const { error: profileError } = await supabase
      .from("usuarios")
      .update({ debe_cambiar_password: false })
      .eq("id", session.user.id);

    if (profileError) {
      throw new Error(`Error actualizando perfil: ${profileError.message}`);
    }

    revalidatePath("/", "layout");
    // No redirigimos aquí para que el useActionState pueda manejar el éxito si es necesario,
    // o redirigimos directamente.
    
    return { success: true };

  } catch (error: any) {
    console.error("Error en actualizarPassword:", error);
    return { error: error.message || "Error interno del servidor." };
  }
}

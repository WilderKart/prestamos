"use server";

import { createClient } from "@/utils/supabase/server";

export async function registrarCliente(prevState: any, formData: FormData) {
  try {
    const supabase = await createClient();
    const email = (formData.get("email") as string)?.toLowerCase().trim();
    const password = formData.get("password") as string;
    const nombre = formData.get("nombre") as string;

    if (!email || !password || !nombre) {
      return { error: "Todos los campos son obligatorios." };
    }

    // FLUJO ESTÁNDAR (Autoregistro): Sin Service Role
    // Esto disparará la confirmación por email (Magic Link) según la config de Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre: nombre,
          rol: "CLIENTE" // El disparador DB se encargará de crear el perfil si existe
        }
      }
    });

    if (error) {
      throw new Error(`Error en registro: ${error.message}`);
    }

    // El flujo estándar requiere verificar el email
    return { 
      success: true, 
      message: "Registro exitoso. Por favor revisa tu correo electrónico para confirmar tu cuenta (Magic Link)." 
    };

  } catch (error: any) {
    console.error("Error en registrarCliente:", error);
    return { error: error.message || "Error interno del servidor." };
  }
}

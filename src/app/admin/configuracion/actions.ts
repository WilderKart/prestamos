"use server";

import { requireAuth } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateConfig(clave: string, valor: string) {
  try {
    const { supabase, userData } = await requireAuth();

    // Verificación de ROL (Zero Trust: Solo administradores modifican el sistema)
    if (userData.rol !== "ADMIN") {
      throw new Error("Acceso denegado: Se requiere rol de Administrador");
    }

    const { error } = await supabase
      .from("configuracion_sistema")
      .update({ valor })
      .eq("clave", clave);
      
    if (error) {
      throw new Error(error.message);
    }
    
    revalidatePath("/admin/configuracion");
    return { success: true };

  } catch (error: any) {
    console.error("ZeroTrust Security Breach/Error [config]:", error);
    throw new Error(error.message || "Error interno de seguridad");
  }
}

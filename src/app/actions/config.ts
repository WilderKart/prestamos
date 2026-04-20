"use server";

import { requireAuth } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Obtiene la configuración de la empresa del usuario actual (Zero Trust)
 */
export async function getCompanyConfigAction() {
  try {
    const { supabase, userData: session } = await requireAuth("CAPITAN");

    const { data, error } = await supabase
      .from("configuracion_empresa")
      .select("*")
      .eq("empresa_id", session.empresa_id)
      .single();

    if (error) throw error;
    return { success: true, config: data };
  } catch (error: any) {
    console.error("GET_CONFIG_ERROR:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Actualiza la configuración de la empresa (Solo Capitanes)
 */
export async function updateCompanyConfigAction(formData: {
  monto_minimo_comprobante: number;
  requiere_comprobante: boolean;
}) {
  try {
    const { supabase, userData: session } = await requireAuth("CAPITAN");

    const { error } = await supabase
      .from("configuracion_empresa")
      .update({
        monto_minimo_comprobante: formData.monto_minimo_comprobante,
        requiere_comprobante: formData.requiere_comprobante
      })
      .eq("empresa_id", session.empresa_id);

    if (error) throw error;

    revalidatePath("/capitan/configuracion/empresa");
    return { success: true };
  } catch (error: any) {
    console.error("UPDATE_CONFIG_ERROR:", error);
    return { success: false, error: error.message };
  }
}

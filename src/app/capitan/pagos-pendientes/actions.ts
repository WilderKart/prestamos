"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function processarPago(pagoId: string, accion: "APROBAR" | "RECHAZAR") {
  const supabase = await createClient();

  if (accion === "APROBAR") {
    // LLamamos a la función RPC que se encargará del Bulk processing transaccional
    const { error } = await supabase.rpc("aprobar_pago", { p_pago_id: pagoId });
    if (error) {
      console.error("Error aprobando pago:", error);
      return { error: `No se pudo aprobar: ${error.message}` };
    }
  } else {
    // Si se rechaza, es solo un UPDATE al estado
    const { error } = await supabase
      .from("pagos")
      .update({ estado: "RECHAZADO" })
      .eq("id", pagoId)
      .eq("estado", "PENDIENTE_VALIDACION"); // Seguridad extra

    if (error) {
      console.error("Error rechazando pago:", error);
      return { error: `No se pudo rechazar: ${error.message}` };
    }
  }

  revalidatePath("/capitan/pagos-pendientes");
  return { success: true };
}

"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function marcarComoLeida(notificacionId: string) {
  const supabase = await createClient();

  const { error } = await supabase.rpc("marcar_notificacion_leida", { p_id: notificacionId });

  if (error) {
    console.error("Error al marcar como leída:", error);
    return { error: error.message };
  }

  revalidatePath("/cliente/notificaciones");
  revalidatePath("/cliente"); 
  return { success: true };
}

export async function marcarTodasComoLeidas() {
  const supabase = await createClient();

  const { error } = await supabase.rpc("marcar_notificaciones_leidas");

  if (error) {
    console.error("Error al marcar todas como leídas:", error);
    return { error: error.message };
  }

  revalidatePath("/cliente/notificaciones");
  revalidatePath("/cliente");
  return { success: true };
}

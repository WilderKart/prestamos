"use server";

import { requireAuth, createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Marca una notificación como leída (Zero Trust)
 */
export async function markNotificationReadAction(notificationId: string) {
  try {
    const { supabase, userData: session } = await requireAuth();

    // 🔐 ZERO TRUST: Validar que la notificación pertenece al usuario
    const { error } = await supabase
      .from("notificaciones")
      .update({ leida: true })
      .eq("id", notificationId)
      .eq("user_id", session.user.id);

    if (error) throw error;

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("MARK_READ_ERROR:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Marca todas las notificaciones del usuario como leídas
 */
export async function markAllNotificationsReadAction() {
  try {
    const { supabase, userData: session } = await requireAuth();

    const { error } = await supabase
      .from("notificaciones")
      .update({ leida: true })
      .eq("user_id", session.user.id);

    if (error) throw error;

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("MARK_ALL_READ_ERROR:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Helper interno para crear una notificación (No expuesto directamente como Action)
 * Se usa desde otras Server Actions privilegiadas.
 */
export async function createNotificationInternal(supabase: any, {
  empresa_id,
  user_id,
  tipo,
  titulo,
  descripcion
}: {
  empresa_id: string;
  user_id: string;
  tipo: string;
  titulo: string;
  descripcion: string;
}) {
  const { error } = await supabase.from("notificaciones").insert({
    empresa_id,
    user_id,
    tipo,
    titulo,
    descripcion
  });

  if (error) {
    console.error("ERROR_CREATING_NOTIFICATION:", error);
  }
}

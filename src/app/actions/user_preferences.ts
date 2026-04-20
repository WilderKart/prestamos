"use server";

import { requireAuth } from "@/utils/supabase/server";
import { createClient } from "@/utils/supabase/server";

export interface NotificationPrefs {
  in_app: boolean;
  email: boolean;
  push: boolean;
}

const PREFS_SCHEMA: Record<keyof NotificationPrefs, string> = {
  in_app: "boolean",
  email: "boolean",
  push: "boolean",
};

/**
 * updateNotificationPrefsAction: Persistencia blindada de preferencias.
 * Incluye validación de sesión inmutable y esquema estricto.
 */
export async function updateNotificationPrefsAction(prefs: NotificationPrefs) {
  // 🛡️ Validación de Sesión Estandarizada
  const { userData: user } = await requireAuth();
  
  if (!user?.user?.id || !user?.empresa_id) {
    throw new Error("Sesión inválida o expirada");
  }

  const supabase = await createClient();

  // 🛡️ Validación Estricta de Esquema JSONB
  Object.keys(PREFS_SCHEMA).forEach((key) => {
    const k = key as keyof NotificationPrefs;
    if (typeof prefs[k] !== PREFS_SCHEMA[k]) {
      throw new Error(`Esquema inválido: ${k}`);
    }
  });

  const { error } = await supabase
    .from("usuarios")
    .update({ config_notificaciones: prefs })
    .eq("id", user.user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

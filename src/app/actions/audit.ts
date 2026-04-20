"use server";

import { requireAuth } from "@/utils/supabase/server";
import { createClient } from "@/utils/supabase/server";

export type AuditAction = 
  | 'PAGO_REGISTRADO' 
  | 'RUTA_ASIGNADA' 
  | 'CLIENTE_CREADO' 
  | 'SOLICITUD_PROCESADA' 
  | 'LOGIN_CAPITAN';

/**
 * logActivity: Registro de auditoría blindado (Nivel Producción Real).
 * Utiliza un RPC con SECURITY DEFINER para inyectar empresa_id desde el motor.
 */
export async function logActivity(accion: AuditAction, detalles: any) {
  try {
    // 🛡️ Estandarización Inmutable: Extraer {id, empresa_id, rol}
    const { userData: user } = await requireAuth();
    
    // Fallback de seguridad Zero Trust
    if (!user?.user?.id || !user?.empresa_id) {
      throw new Error("Acceso denegado: Sesión inválida o incompleta.");
    }

    const supabase = await createClient();

    // 🛡️ Validación de tamaño (Nivel Élite: < 2000 chars)
    const payloadString = JSON.stringify(detalles);
    if (payloadString.length > 2000) {
      throw new Error("Detalles demasiado grandes");
    }

    // ⚡ Ejecución vía RPC Seguro (No confía en el cliente)
    const { error } = await supabase.rpc("insert_log_secure", {
      p_accion: accion,
      p_detalles: detalles
    });

    if (error) {
      console.error(`[AUDIT_ERROR] ${accion}:`, error);
    }
  } catch (err) {
    console.error(`[AUDIT_CRITICAL]`, err);
  }
}

/**
 * getAuditLogsAction: Recupera el historial filtrado por empresa.
 * Consume la VISTA OPTIMIZADA v_logs_actividad.
 */
export async function getAuditLogsAction() {
  const { userData: user } = await requireAuth("CAPITAN");
  
  if (!user?.empresa_id) throw new Error("Invalid session");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("v_logs_actividad")
    .select("*")
    .eq("empresa_id", user.empresa_id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`Error al recuperar auditoría: ${error.message}`);
  }

  return data;
}

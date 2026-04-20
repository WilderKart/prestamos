"use server";

import { requireAuth } from "@/utils/supabase/server";

/**
 * Server Action: Obtener Datos del Calendario de Auditoría
 * Consume el RPC táctico para obtener el ciclo financiero completo por día.
 */
export async function getCalendarDataAction(monthISO: string) {
  try {
    const { supabase, userData: sessionUser } = await requireAuth("CAPITAN");
    const empresa_id = sessionUser.empresa_id;

    if (!empresa_id) throw new Error("INVALID_SESSION_CONTEXT");

    // Calcular rango del mes para el RPC
    const startOfMonth = new Date(monthISO);
    startOfMonth.setDate(1);
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);

    const { data, error } = await supabase.rpc('rpc_get_calendar_tactical_data', {
      p_start_date: startOfMonth.toISOString().split('T')[0],
      p_end_date: endOfMonth.toISOString().split('T')[0]
    });

    if (error) throw error;

    // Convertir array del RPC a mapa por fecha para la UI
    const statsByDate: Record<string, any> = {};
    
    (data as any[]).forEach(row => {
      statsByDate[row.fecha] = {
        moraCount: row.mora_count,
        totalEsperado: row.total_esperado,
        totalRecaudado: row.total_recaudado,
        diferencia: row.diferencia,
        isClosed: row.is_closed,
        hasDiscrepancy: row.has_discrepancy,
        isFestivo: row.is_festivo,
        isDomingo: row.is_domingo
      };
    });

    return { 
      success: true, 
      data: statsByDate 
    };

  } catch (error: any) {
    console.error("CALENDAR_TACTICAL_DATA_ERROR:", error);
    return { success: false, error: error.message };
  }
}

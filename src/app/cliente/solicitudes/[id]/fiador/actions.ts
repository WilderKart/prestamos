"use server";

import { createClient, requireAuth } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function clienteAgregarFiador(
  solicitudId: string,
  fiadorData: {
    cedula: string;
    nombre: string;
    telefono: string;
    direccion: string;
    actividad_economica: string;
    ingresos_mensuales: number;
  }
) {
  try {
    const { supabase, user } = await requireAuth();

    // VALIDACIÓN CRÍTICA: La solicitud debe pertenecer al cliente logueado
    const { data: cliente } = await supabase
      .from("clientes")
      .select("id")
      .eq("usuario_id", user.id)
      .single();

    if (!cliente) {
      return { error: "No se encontró perfil de cliente asociado" };
    }

    // Validamos que la solicitud sea del cliente
    const { data: solicitud, error: solicError } = await supabase
      .from("solicitudes_prestamo")
      .select("id, cliente_id")
      .eq("id", solicitudId)
      .eq("cliente_id", cliente.id)
      .single();

    if (solicError || !solicitud) {
      return { error: "Solicitud no encontrada o no autorizada" };
    }

    // Gestión de Fiador
    const { data: fiadorExistente } = await supabase
      .from("fiadores")
      .select("id")
      .eq("cedula", fiadorData.cedula)
      .single();

    let fiadorId: string;

    if (fiadorExistente) {
      fiadorId = fiadorExistente.id;
    } else {
      const { data: nuevoFiador, error: fiadorError } = await supabase
        .from("fiadores")
        .insert({
          cedula: fiadorData.cedula,
          nombre: fiadorData.nombre,
          telefono: fiadorData.telefono,
          direccion: fiadorData.direccion,
          actividad_economica: fiadorData.actividad_economica,
          ingresos_mensuales: fiadorData.ingresos_mensuales,
        })
        .select("id")
        .single();

      if (fiadorError) throw new Error(`Error creando fiador: ${fiadorError.message}`);
      fiadorId = nuevoFiador.id;
    }

    // Vinculación
    const { error: updateError } = await supabase
      .from("solicitudes_prestamo")
      .update({ fiador_id: fiadorId })
      .eq("id", solicitudId);

    if (updateError) throw new Error(`Error vinculando fiador: ${updateError.message}`);

    revalidatePath("/cliente/solicitudes");
    return { success: true };

  } catch (error: any) {
    console.error("ZeroTrust Security Breach/Error [fiador]:", error);
    return { error: error.message || "Error interno de seguridad" };
  }
}

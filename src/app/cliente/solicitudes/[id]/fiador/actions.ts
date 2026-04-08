"use server";

import { createClient } from "@/utils/supabase/server";
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
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

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

    if (fiadorError) {
      console.error("Error creando fiador:", fiadorError);
      return { error: `No se pudo crear el fiador: ${fiadorError.message}` };
    }

    fiadorId = nuevoFiador.id;
  }

  const { error: updateError } = await supabase
    .from("solicitudes_prestamo")
    .update({ fiador_id: fiadorId })
    .eq("id", solicitudId);

  if (updateError) {
    console.error("Error vinculando fiador:", updateError);
    return { error: `No se pudo vincular el fiador: ${updateError.message}` };
  }

  revalidatePath("/cliente/solicitudes");
  return { success: true };
}

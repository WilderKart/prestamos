"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function crearSolicitudPrestamo(monto: number) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  const { data: cliente } = await supabase
    .from("clientes")
    .select("id, capitan_id")
    .eq("usuario_id", user.id)
    .single();

  if (!cliente) {
    return { error: "No se encontró perfil de cliente" };
  }

  const { data: solicitud, error } = await supabase
    .from("solicitudes_prestamo")
    .insert({
      cliente_id: cliente.id,
      capitan_id: cliente.capitan_id,
      monto_solicitado: monto,
      estado: "PENDIENTE",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error creando solicitud:", error);
    return { error: `No se pudo crear la solicitud: ${error.message}` };
  }

  await supabase.from("notificaciones").insert({
    usuario_id: cliente.capitan_id,
    tipo: "SOLICITUD_CREDITO",
    mensaje: `Nueva solicitud de crédito por ${new Intl.NumberFormat("es", { style: "currency", currency: "USD" }).format(monto)}`,
    leida: false,
    entidad_id: solicitud.id,
  });

  revalidatePath("/cliente/solicitudes");
  return { success: true };
}

export async function solicitarFiador(solicitudId: string, motivo?: string) {
  const supabase = await createClient();

  const { data: solicitud } = await supabase
    .from("solicitudes_prestamo")
    .select("cliente_id, capitan_id")
    .eq("id", solicitudId)
    .single();

  if (!solicitud) {
    return { error: "Solicitud no encontrada" };
  }

  const { error } = await supabase.rpc("solicitar_fiador", {
    p_solicitud_id: solicitudId,
    p_motivo: motivo || null,
  });

  if (error) {
    console.error("Error solicitando fiador:", error);
    return { error: `No se pudo solicitar fiador: ${error.message}` };
  }

  await supabase.from("notificaciones").insert({
    usuario_id: solicitud.cliente_id,
    tipo: "FIADOR_REQUERIDO",
    mensaje: motivo || "Tu capitán ha solicitado un fiador para esta solicitud",
    leida: false,
    entidad_id: solicitudId,
  });

  revalidatePath("/capitan/solicitudes");
  return { success: true };
}

export async function aprobarSolicitud(solicitudId: string) {
  const supabase = await createClient();

  const { data: solicitud } = await supabase
    .from("solicitudes_prestamo")
    .select("cliente_id, capitan_id, monto_solicitado, cliente_nombre")
    .eq("id", solicitudId)
    .single();

  if (!solicitud) {
    return { error: "Solicitud no encontrada" };
  }

  const { data: prestamoId, error } = await supabase.rpc("aprobar_solicitud", {
    p_solicitud_id: solicitudId,
  });

  if (error) {
    console.error("Error aprobando solicitud:", error);
    return { error: `No se pudo aprobar: ${error.message}` };
  }

  await supabase.from("notificaciones").insert({
    usuario_id: solicitud.cliente_id,
    tipo: "SOLICITUD_APROBADA",
    mensaje: "Tu solicitud de crédito ha sido aprobada",
    leida: false,
    entidad_id: solicitudId,
  });

  revalidatePath("/capitan/solicitudes");
  return { 
    success: true, 
    prestamoId: prestamoId as string,
    monto: solicitud.monto_solicitado,
    clienteNombre: solicitud.cliente_nombre || "Cliente"
  };
}

export async function rechazarSolicitud(solicitudId: string, motivo?: string) {
  const supabase = await createClient();

  const { data: solicitud } = await supabase
    .from("solicitudes_prestamo")
    .select("cliente_id, capitan_id")
    .eq("id", solicitudId)
    .single();

  if (!solicitud) {
    return { error: "Solicitud no encontrada" };
  }

  const { error } = await supabase.rpc("rechazar_solicitud", {
    p_solicitud_id: solicitudId,
    p_motivo: motivo || null,
  });

  if (error) {
    console.error("Error rechazando solicitud:", error);
    return { error: `No se pudo rechazar: ${error.message}` };
  }

  await supabase.from("notificaciones").insert({
    usuario_id: solicitud.cliente_id,
    tipo: "SOLICITUD_RECHAZADA",
    mensaje: motivo || "Tu solicitud de crédito ha sido rechazada",
    leida: false,
    entidad_id: solicitudId,
  });

  revalidatePath("/capitan/solicitudes");
  return { success: true };
}

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

  const { data: solicitud } = await supabase
    .from("solicitudes_prestamo")
    .select("cliente_id, capitan_id")
    .eq("id", solicitudId)
    .single();

  if (!solicitud) {
    return { error: "Solicitud no encontrada" };
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

  await supabase.from("notificaciones").insert({
    usuario_id: solicitud.capitan_id,
    tipo: "FIADOR_AGREGADO",
    mensaje: `El cliente ha agregado un fiador: ${fiadorData.nombre}`,
    leida: false,
    entidad_id: solicitudId,
  });

  revalidatePath("/cliente/solicitudes");
  return { success: true };
}

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

  const { error } = await supabase.from("solicitudes_prestamo").insert({
    cliente_id: cliente.id,
    capitan_id: cliente.capitan_id,
    monto_solicitado: monto,
    estado: "PENDIENTE",
  });

  if (error) {
    console.error("Error creando solicitud:", error);
    return { error: `No se pudo crear la solicitud: ${error.message}` };
  }

  revalidatePath("/cliente/solicitudes");
  return { success: true };
}

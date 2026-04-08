"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function solicitarRetanqueo(prevState: any, formData: FormData) {
  const prestamo_id = formData.get("prestamo_id") as string;
  const montoStr = formData.get("monto_solicitado") as string;
  const motivo = formData.get("motivo") as string;

  if (!prestamo_id || !montoStr || !motivo) {
    return { error: "Todos los campos son obligatorios." };
  }

  const monto_solicitado = parseFloat(montoStr);
  if (isNaN(monto_solicitado) || monto_solicitado <= 0) {
    return { error: "El monto solicitado debe ser mayor a 0." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autorizado." };
  }

  // Obtenemos el cliente_id asociado al user
  const { data: cliente } = await supabase
    .from("clientes")
    .select("id")
    .eq("usuario_id", user.id)
    .single();

  if (!cliente) {
    return { error: "No se encontró un perfil de cliente asociado." };
  }

  const { error: insertError } = await supabase
    .from("solicitudes_retanqueo")
    .insert({
      cliente_id: cliente.id,
      prestamo_id,
      monto_solicitado,
      motivo,
      estado: "PENDIENTE"
    });

  if (insertError) {
    console.error("Error al registrar solicitud de retanqueo:", insertError);
    return { error: "Hubo un error al procesar tu solicitud: " + insertError.message };
  }

  revalidatePath("/cliente/retanqueo");

  return { success: true };
}

"use server";

import { requireAuth } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function solicitarRetanqueo(prevState: any, formData: FormData) {
  try {
    const { supabase, user } = await requireAuth();

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

    // VALIDACIÓN CRÍTICA: El préstamo debe pertenecer al cliente logueado
    // Obtenemos el perfil del cliente
    const { data: cliente } = await supabase
      .from("clientes")
      .select("id")
      .eq("usuario_id", user.id)
      .single();

    if (!cliente) {
      return { error: "No se encontró un perfil de cliente asociado." };
    }

    // Validamos que el préstamo sea del cliente
    const { data: prestamoValido, error: checkError } = await supabase
      .from("prestamos")
      .select("id")
      .eq("id", prestamo_id)
      .eq("cliente_id", cliente.id)
      .single();

    if (checkError || !prestamoValido) {
      return { error: "Préstamo base no encontrado o no autorizado." };
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

    if (insertError) throw new Error(`Error al registrar retanqueo: ${insertError.message}`);

    revalidatePath("/cliente/retanqueo");
    return { success: true };

  } catch (error: any) {
    console.error("ZeroTrust Security Breach/Error [retanqueo]:", error);
    return { error: error.message || "Error interno de seguridad" };
  }
}

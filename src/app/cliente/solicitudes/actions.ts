"use server";

import { requireAuth } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function crearSolicitudPrestamo(monto: number) {
  try {
    const { supabase, user } = await requireAuth();

    // Obtenemos el perfil del cliente (Zero Trust: Solo el servidor identifica al cliente)
    const { data: cliente, error: cliError } = await supabase
      .from("clientes")
      .select("id, capitan_id")
      .eq("usuario_id", user.id)
      .single();

    if (cliError || !cliente) {
      return { error: "No se encontró perfil de cliente asociado" };
    }

    const { error: insError } = await supabase
      .from("solicitudes_prestamo")
      .insert({
        cliente_id: cliente.id,
        capitan_id: cliente.capitan_id,
        monto_solicitado: monto,
        estado: "PENDIENTE",
      });

    if (insError) throw new Error(`Error creando solicitud: ${insError.message}`);

    revalidatePath("/cliente/solicitudes");
    return { success: true };

  } catch (error: any) {
    console.error("ZeroTrust Security Breach/Error [nueva-solicitud]:", error);
    return { error: error.message || "Error interno de seguridad" };
  }
}

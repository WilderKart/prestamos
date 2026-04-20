"use server";

import { createClient, requireAuth } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

function getFields(formData: FormData) {
  const fields: Record<string, any> = {};
  formData.forEach((value, key) => {
    if (typeof value === "string") {
      fields[key] = value;
    }
  });
  return fields;
}

export async function reportarPago(prevState: any, formData: FormData) {
  const fields = getFields(formData);

  try {
    const session = await requireAuth("CLIENTE");
    const supabase = await createClient();

    const prestamo_id = formData.get("prestamo_id") as string;
    const valorStr = formData.get("valor") as string;
    const metodo = formData.get("metodo") as string;
    const comprobante = formData.get("comprobante") as File;

    if (!prestamo_id || !valorStr || !metodo) {
      return { error: "Todos los campos obligatorios deben ser llenados.", fields };
    }

    const valor = parseFloat(valorStr);
    if (isNaN(valor) || valor <= 0) {
      return { error: "El valor del pago debe ser mayor a 0.", fields };
    }

    // Zero Trust: Validar que el préstamo pertenezca al usuario (aunque RLS debería hacerlo, validamos aquí también)
    const { data: prestamo } = await supabase
      .from("prestamos")
      .select("id")
      .eq("id", prestamo_id)
      .eq("usuario_id", session.user.id)
      .maybeSingle();

    if (!prestamo && session.role !== 'ADMIN') {
      return { error: "No tienes permiso para reportar pagos sobre este préstamo.", fields };
    }

    let comprobanteUrl = null;

    if (comprobante && comprobante.size > 0) {
      const timestamp = Date.now();
      const ext = comprobante.name.split('.').pop();
      const fileName = `${session.user.id}/${timestamp}.${ext}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("comprobantes")
        .upload(fileName, comprobante, {
          upsert: false
        });

      if (uploadError) {
        console.error("Error al subir archivo:", uploadError);
        return { error: "Hubo un error al subir el comprobante. Inténtalo de nuevo.", fields };
      }

      comprobanteUrl = uploadData.path;
    }

    const { error: insertError } = await supabase
      .from("pagos")
      .insert({
        prestamo_id,
        valor,
        metodo,
        comprobante_url: comprobanteUrl,
        estado: "PENDIENTE_VALIDACION",
        tipo_aplicacion: "CUOTA"
      });

    if (insertError) {
      console.error("Error insertando pago:", insertError);
      return { error: "Error registrando el pago: " + insertError.message, fields };
    }

    revalidatePath("/cliente/pago");
    revalidatePath("/cliente");

    return { success: true };
  } catch (error: any) {
    console.error("Error crítico en reportarPago:", error);
    return { error: "No autorizado o error interno del servidor.", fields };
  }
}

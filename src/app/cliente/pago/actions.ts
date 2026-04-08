"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function reportarPago(prevState: any, formData: FormData) {
  const prestamo_id = formData.get("prestamo_id") as string;
  const valorStr = formData.get("valor") as string;
  const metodo = formData.get("metodo") as string;
  const comprobante = formData.get("comprobante") as File;

  if (!prestamo_id || !valorStr || !metodo) {
    return { error: "Todos los campos obligatorios deben ser llenados." };
  }

  const valor = parseFloat(valorStr);
  if (isNaN(valor) || valor <= 0) {
    return { error: "El valor del pago debe ser mayor a 0." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autorizado." };
  }

  let comprobanteUrl = null;

  // Upload file if provided
  if (comprobante && comprobante.size > 0) {
    // Generate unique name
    const timestamp = Date.now();
    const ext = comprobante.name.split('.').pop();
    const fileName = `${user.id}/${timestamp}.${ext}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("comprobantes")
      .upload(fileName, comprobante, {
        upsert: false
      });

    if (uploadError) {
      console.error("Error al subir archivo:", uploadError);
      return { error: "Hubo un error al subir el comprobante. Inténtalo de nuevo." };
    }

    // Obtenemos la URL publica, suponiendo que el bucket es publico.
    // O si es privado firmamos. Guardamos el path relativo por simplicidad:
    comprobanteUrl = uploadData.path;
  }

  // Insert payment to trigger 'PENDIENTE_VALIDACION'
  const { error: insertError } = await supabase
    .from("pagos")
    .insert({
      prestamo_id,
      valor,
      metodo,
      comprobante_url: comprobanteUrl,
      estado: "PENDIENTE_VALIDACION", // El backend ya debe tenerlo default pero asegurar
      tipo_aplicacion: "CUOTA" // Default asumido si no especifica
    });

  if (insertError) {
    console.error("Error insertando pago:", insertError);
    return { error: "Error registrando el pago: " + insertError.message };
  }

  revalidatePath("/cliente/pago");
  revalidatePath("/cliente");

  return { success: true };
}

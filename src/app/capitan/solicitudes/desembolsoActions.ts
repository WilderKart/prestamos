"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function registrarDesembolso(prevState: any, formData: FormData) {
  const prestamoId = formData.get("prestamoId") as string;
  const montoStr = formData.get("monto") as string;
  const metodo = formData.get("metodo") as string;
  const comprobanteFile = formData.get("comprobante") as File | null;

  if (!prestamoId || !montoStr || !metodo) {
    return { error: "Prestamo, monto y método son obligatorios." };
  }

  const monto = parseFloat(montoStr);
  if (isNaN(monto) || monto <= 0) {
    return { error: "El monto debe ser un número válido mayor a 0." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado." };

  // Verify the loan belongs to this capitan
  const { data: prestamo } = await supabase
    .from("prestamos")
    .select("id, capitan_id, cliente_id, monto")
    .eq("id", prestamoId)
    .single();

  if (!prestamo) {
    return { error: "Préstamo no encontrado." };
  }

  if (prestamo.capitan_id !== user.id) {
    return { error: "Este préstamo no te pertenece." };
  }

  // Check if disbursement already exists
  const { data: existingDesembolso } = await supabase
    .from("desembolsos")
    .select("id")
    .eq("prestamo_id", prestamoId)
    .maybeSingle();

  if (existingDesembolso) {
    return { error: "Ya existe un desembolso registrado para este préstamo." };
  }

  // Upload comprobante if provided
  let comprobanteUrl: string | null = null;
  if (comprobanteFile && comprobanteFile.size > 0) {
    if (comprobanteFile.size > 5 * 1024 * 1024) {
      return { error: "El comprobante excede el límite de 5MB." };
    }

    const ext = comprobanteFile.name.split(".").pop();
    const path = `desembolsos/${user.id}/${prestamoId}_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("comprobantes")
      .upload(path, comprobanteFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return { error: `Error al subir comprobante: ${uploadError.message}` };
    }

    const { data: urlData } = supabase.storage
      .from("comprobantes")
      .getPublicUrl(path);

    comprobanteUrl = urlData.publicUrl;
  }

  // Insert disbursement
  const { error: desembolsoError } = await supabase
    .from("desembolsos")
    .insert({
      prestamo_id: prestamoId,
      monto,
      metodo_desembolso: metodo.toUpperCase(),
      comprobante_url: comprobanteUrl,
      fecha_desembolso: new Date().toISOString().split("T")[0],
      capitan_id: user.id,
    });

  if (desembolsoError) {
    console.error("Error registrando desembolso:", desembolsoError);
    return { error: `Error al registrar desembolso: ${desembolsoError.message}` };
  }

  // Audit log
  await supabase.from("auditoria").insert({
    usuario_id: user.id,
    accion: "REGISTRAR_DESEMBOLSO",
    entidad: "desembolsos",
    entidad_id: prestamoId,
    datos_nuevos: { monto, metodo_desembolso: metodo, comprobante_url: comprobanteUrl },
  });

  revalidatePath("/capitan/solicitudes");
  revalidatePath(`/capitan/clientes/${prestamo.cliente_id}`);
  revalidatePath("/cliente");

  return { success: true };
}

export async function getDesembolsoByPrestamo(prestamoId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("desembolsos")
    .select("*")
    .eq("prestamo_id", prestamoId)
    .maybeSingle();

  return { desembolso: data };
}

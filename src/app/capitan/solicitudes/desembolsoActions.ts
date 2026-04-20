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

export async function registrarDesembolso(prevState: any, formData: FormData) {
  const fields = getFields(formData);

  try {
    const session = await requireAuth("CAPITAN");
    const supabase = await createClient();

    const prestamoId = formData.get("prestamoId") as string;
    const montoStr = formData.get("monto") as string;
    const metodo = formData.get("metodo") as string;
    const comprobanteFile = formData.get("comprobante") as File | null;

    if (!prestamoId || !montoStr || !metodo) {
      return { error: "Prestamo, monto y método son obligatorios.", fields };
    }

    const monto = parseFloat(montoStr);
    if (isNaN(monto) || monto <= 0) {
      return { error: "El monto debe ser un número válido mayor a 0.", fields };
    }

    // Verify the loan belongs to this capitan and get company context
    const { data: userData } = await supabase
      .from("usuarios")
      .select("empresa_id")
      .eq("id", session.user.id)
      .single();

    if (!userData?.empresa_id) {
      return { error: "Perfil de empresa no configurado. Contacte a soporte.", fields };
    }
    const empresaId = userData.empresa_id;

    const { data: prestamo } = await supabase
      .from("prestamos")
      .select("id, capitan_id, cliente_id, monto")
      .eq("id", prestamoId)
      .single();

    if (!prestamo) {
      return { error: "Préstamo no encontrado.", fields };
    }

    if (prestamo.capitan_id !== session.user.id) {
      return { error: "Acceso denegado: Este préstamo no pertenece a su cartera.", fields };
    }

    // Check if disbursement already exists
    const { data: existingDesembolso } = await supabase
      .from("desembolsos")
      .select("id")
      .eq("prestamo_id", prestamoId)
      .maybeSingle();

    if (existingDesembolso) {
      return { error: "Ya existe un desembolso registrado para este préstamo.", fields };
    }

    // Upload comprobante if provided
    let comprobanteUrl: string | null = null;
    if (comprobanteFile && comprobanteFile.size > 0) {
      if (comprobanteFile.size > 5 * 1024 * 1024) {
        return { error: "El comprobante excede el límite de 5MB.", fields };
      }

      const ext = comprobanteFile.name.split(".").pop();
      const path = `desembolsos/${empresaId}/${prestamoId}_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("comprobantes")
        .upload(path, comprobanteFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        return { error: `Error al subir comprobante: ${uploadError.message}`, fields };
      }

      comprobanteUrl = path;
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
        capitan_id: session.user.id,
      });

    if (desembolsoError) {
      console.error("Error registrando desembolso:", desembolsoError);
      return { error: `Error al registrar desembolso: ${desembolsoError.message}`, fields };
    }

    // Audit log
    await supabase.from("auditoria").insert({
      usuario_id: session.user.id,
      accion: "REGISTRAR_DESEMBOLSO",
      entidad: "desembolsos",
      entidad_id: prestamoId,
      datos_nuevos: { monto, metodo_desembolso: metodo, comprobante_url: comprobanteUrl },
    });

    revalidatePath("/capitan/solicitudes");
    revalidatePath(`/capitan/clientes/${prestamo.cliente_id}`);
    revalidatePath("/cliente");

    return { success: true };
  } catch (error: any) {
    console.error("Error crítico en registrarDesembolso:", error);
    return { error: "No autorizado o error interno del servidor.", fields };
  }
}

export async function getDesembolsoByPrestamo(prestamoId: string) {
  try {
    await requireAuth(); 
    const supabase = await createClient();

    const { data } = await supabase
      .from("desembolsos")
      .select("*")
      .eq("prestamo_id", prestamoId)
      .maybeSingle();

    return { desembolso: data };
  } catch {
    return { desembolso: null };
  }
}

export async function getSignedComprobanteUrl(path: string) {
  try {
    const session = await requireAuth();
    const supabase = await createClient();

    // Zero Trust Validation
    const { data: userData } = await supabase
      .from("usuarios")
      .select("empresa_id")
      .eq("id", session.user.id)
      .single();

    if (!userData?.empresa_id) {
       return { error: "No tienes permiso para acceder a este recurso." };
    }

    let storagePath = path;
    
    // Legacy support: extract path if it's a full URL
    if (path.startsWith("http")) {
      const searchStr = "/comprobantes/";
      const index = path.indexOf(searchStr);
      if (index !== -1) {
        storagePath = path.substring(index + searchStr.length);
      }
    }

    // Validate path structure: desembolsos/{empresa_id}/...
    const parts = storagePath.split("/");
    if (parts[0] === "desembolsos" && parts[1] !== userData.empresa_id) {
       return { error: "Acceso denegado: El archivo pertenece a otra organización." };
    }

    const { data, error } = await supabase.storage
      .from("comprobantes")
      .createSignedUrl(storagePath, 60);

    if (error) throw error;

    return { signedUrl: data.signedUrl };
  } catch (error: any) {
    console.error("Error al generar URL firmada:", error);
    return { error: "No se pudo generar el acceso seguro al comprobante." };
  }
}

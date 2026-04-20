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

export async function crearPrestamo(prevState: any, formData: FormData) {
  const fields = getFields(formData);

  try {
    const session = await requireAuth("CAPITAN");
    const supabase = await createClient();

    const clienteId = formData.get("clienteId") as string;
    const montoStr = formData.get("monto") as string;
    const interesStr = formData.get("interes") as string;
    const numeroCuotasStr = formData.get("numeroCuotas") as string;
    const frecuencia = formData.get("frecuencia") as string;
    
    if (!clienteId || !montoStr || !interesStr || !numeroCuotasStr || !frecuencia) {
      return { error: "Todos los campos son obligatorios.", fields };
    }

    const p_monto = parseFloat(montoStr);
    const p_interes = parseFloat(interesStr);
    const p_numero_cuotas = parseInt(numeroCuotasStr, 10);
    const p_interes_mora = p_interes + 2; 
    
    const fechaInicioStr = formData.get("fechaInicio") as string;
    const p_fecha_inicio = fechaInicioStr || new Date().toISOString().split('T')[0];

    // RPC crear_prestamo debe manejar las validaciones internas de negocio y RLS
    const { data, error } = await supabase.rpc("crear_prestamo", {
      p_cliente_id: clienteId,
      p_monto,
      p_interes,
      p_interes_mora,
      p_frecuencia: frecuencia,
      p_numero_cuotas,
      p_fecha_inicio,
    });

    if (error) {
      console.error("Error en RPC crear_prestamo:", error);
      // Extraer mensaje amigable si viene de RAISE EXCEPTION
      const errorMessage = error.message || "No se pudo procesar la solicitud.";
      return { error: errorMessage, fields };
    }

    revalidatePath(`/capitan/clientes/${clienteId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error crítico en crearPrestamo:", error);
    return { error: "Error de comunicación con el servidor.", fields };
  }
}

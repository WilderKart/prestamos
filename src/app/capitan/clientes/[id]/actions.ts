"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function crearPrestamo(prevState: any, formData: FormData) {
  const clienteId = formData.get("clienteId") as string;
  const montoStr = formData.get("monto") as string;
  const interesStr = formData.get("interes") as string;
  const numeroCuotasStr = formData.get("numeroCuotas") as string;
  const frecuencia = formData.get("frecuencia") as string;
  
  if (!clienteId || !montoStr || !interesStr || !numeroCuotasStr || !frecuencia) {
    return { error: "Todos los campos son obligatorios." };
  }

  const p_monto = parseFloat(montoStr);
  const p_interes = parseFloat(interesStr);
  const p_numero_cuotas = parseInt(numeroCuotasStr, 10);
  const p_interes_mora = p_interes + 2; // Por defecto o puede ser param
  
  // Parseo fecha de inicio (hoy) o del form
  const fechaInicioStr = formData.get("fechaInicio") as string;
  const p_fecha_inicio = fechaInicioStr || new Date().toISOString().split('T')[0];

  const supabase = await createClient();

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
    return { error: `No se pudo crear: ${error.message}` };
  }

  revalidatePath(`/capitan/clientes/${clienteId}`);
  return { success: true };
}

"use server";

import { createClient, requireAuth } from "@/utils/supabase/server";
import { simulateLoan, FrecuenciaPago } from "@/utils/loans/simulator";
import { revalidatePath } from "next/cache";

/**
 * Server Action: Simular Crédito
 * No requiere persistencia, es una operación pura de cálculo.
 */
export async function simulateLoanAction(
  monto: number,
  interes: number,
  cuotas: number,
  frecuencia: FrecuenciaPago
) {
  try {
    // Validar sesión básica
    await requireAuth();
    
    const result = simulateLoan(monto, interes, cuotas, frecuencia);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Server Action: Aprobar Crédito (Atómico)
 * Llama a la función RPC approve_loan_full que maneja la transacción en DB.
 */
export async function approveLoanAction(formData: {
  clienteId: string;
  monto: number;
  interes: number;
  cuotas: number;
  frecuencia: string;
  fechaInicio: string;
}) {
  try {
    // ZERO TRUST: Solo CAPITÁN puede aprobar (Admin es solo soporte)
    const session = await requireAuth();
    if (session.role !== "CAPITAN") {
      throw new Error("Solo los Capitanes pueden aprobar créditos de negocio.");
    }

    const supabase = await createClient();

    // Obtener empresa_id del usuario actual
    const { data: userData, error: userError } = await supabase
      .from("usuarios")
      .select("empresa_id")
      .eq("id", session.user.id)
      .single();

    if (userError || !userData?.empresa_id) {
      throw new Error("No se encontró la empresa asociada al usuario.");
    }

    // Llamada atómica al RPC
    const { data, error } = await supabase.rpc("approve_loan_full", {
      p_cliente_id: formData.clienteId,
      p_monto: formData.monto,
      p_interes: formData.interes,
      p_numero_cuotas: formData.cuotas,
      p_frecuencia: formData.frecuencia,
      p_fecha_inicio: formData.fechaInicio,
      p_empresa_id: userData.empresa_id,
      p_capitan_id: session.user.id
    });

    if (error) throw error;

    revalidatePath("/admin/prestamos");
    revalidatePath("/capitan/prestamos");

    return { success: true, loanId: data };
  } catch (error: any) {
    console.error("Error en approveLoanAction:", error);
    return { success: false, error: error.message };
  }
}

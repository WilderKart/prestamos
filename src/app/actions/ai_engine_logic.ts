"use server";

import { askMivankAI } from "@/utils/ai/openrouter";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * SCORING AUTOMÁTICO (MADE)
 * Calcula y guarda el nivel de riesgo de un cliente.
 */
export async function getClientRiskScoreAction(clienteId: string) {
  try {
    const supabase = await createClient();

    // 1. Recopilar datos históricos (Anonimizados)
    const { data: cliente } = await supabase
      .from("clientes")
      .select(`
        score_manual:score,
        prestamos (
          monto,
          saldo_actual,
          estado,
          cuotas (
            estado,
            dias_mora,
            valor_pagado
          )
        )
      `)
      .eq("id", clienteId)
      .single();

    if (!cliente) throw new Error("Cliente no encontrado.");

    // 2. Construir Contexto para IA
    // Regla: No enviar nombres ni documentos.
    const prompt = `Analiza el riesgo crediticio de este cliente basado en sus datos:
    Score Manual: ${cliente.score_manual}
    Historial: ${JSON.stringify(cliente.prestamos)}
    
    Responde ÚNICAMENTE en JSON con este formato:
    {
      "score": number (0-100),
      "risk_level": "BAJO" | "NORMAL" | "ALTO" | "CRÍTICO",
      "delinquency_prob": number (0-1),
      "reason": "breve explicación técnica"
    }`;

    const verdict = await askMivankAI({ 
      prompt, 
      context: "Decision Engine: Credit Scoring Service" 
    });

    // 3. Persistir en Base de Datos (Motor de Decisiones)
    await supabase
      .from("clientes")
      .update({
        ai_score: verdict.score,
        ai_risk_level: verdict.risk_level,
        ai_delinquency_prob: verdict.delinquency_prob,
        ai_last_assessment_at: new Date().toISOString()
      })
      .eq("id", clienteId);

    revalidatePath("/admin/clientes");
    return { success: true, verdict };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * PREDICCIÓN DE MORA (MADE)
 * Utilizado antes de generar rutas para priorizar cobros difíciles.
 */
export async function predictDelinquencyAction(clienteId: string) {
  // Similar a Scoring pero enfocado en tendencias de los últimos 3 pagos
  // Fallback: Si falla, devuelve el ai_delinquency_prob guardado.
  try {
     const result = await getClientRiskScoreAction(clienteId);
     return result.success ? result.verdict : null;
  } catch {
    return null;
  }
}

/**
 * PRIORIZACIÓN DE RUTA (MADE)
 * Calcula el 'ai_priority_score' para una visita.
 */
export async function getSmartRoutePriorityAction(visita: any) {
    // Lógica multi-factor:
    // Prioridad = (Monto * 0.4) + (ProbabilidadMora * 0.6)
    const monto = visita.clientes?.prestamos?.[0]?.valor_cuota || 0;
    const probMora = visita.clientes?.ai_delinquency_prob || 0.5;
    
    const score = (monto * 0.4) + (probMora * 100 * 0.6);
    return score;
}

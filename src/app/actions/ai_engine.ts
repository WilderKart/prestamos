"use server";

import { callAI } from "@/lib/ai/router";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { createHash } from "crypto";

/**
 * FASE 5: MOTOR HÍBRIDO (IA + REGLAS)
 * Ponderación: 70% Reglas Tradicionales, 30% Inteligencia Artificial
 */
async function calculateFinalScore(ruleScore: number, aiScore: number): Promise<number> {
  return (0.7 * ruleScore) + (0.3 * aiScore);
}

/**
 * CACHE IA (FASE 10 PREVIEW)
 */
async function getCachedAIResponse(prompt: string) {
  const supabase = await createClient();
  const hash = createHash("sha256").update(prompt).digest("hex");
  
  const { data } = await supabase
    .from("ai_cache")
    .select("response")
    .eq("prompt_hash", hash)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
    
  return data?.response;
}

async function saveCachedAIResponse(prompt: string, response: any, ttlDays: number = 7) {
  const supabase = await createClient();
  const hash = createHash("sha256").update(prompt).digest("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + ttlDays);

  await supabase.from("ai_cache").upsert({
    prompt_hash: hash,
    response: response,
    expires_at: expiresAt.toISOString(),
  });
}

/**
 * FASE 4: MADE (AI ENGINE) - SCORING DE RIESGO
 */
export async function getClientRiskScoreAction(input: {
  clienteId: string;
  historial: any[];
  mora: number;
  monto: number;
  ruleScore: number;
}) {
  try {
    const supabase = await createClient();

    const prompt = `
      Analiza este cliente para determinar riesgo crediticio:
      Historial pagos (anonimizado): ${JSON.stringify(input.historial)}
      Total días mora histórico: ${input.mora}
      Monto solicitado: ${input.monto}

      IMPORTANTE: Devuelve ÚNICAMENTE un objeto JSON válido con este formato:
      {
        "score": number (0-100),
        "risk_level": "BAJO" | "MEDIO" | "ALTO" | "CRÍTICO",
        "delinquency_prob": number (0-1),
        "reason": "Explicación técnica breve"
      }
    `;

    // 1. Verificar Cache
    let aiResponse = await getCachedAIResponse(prompt);

    if (!aiResponse) {
      // 2. Llamada a IA (Fase 2 Router)
      const rawResponse = await callAI("risk", prompt);
      try {
        aiResponse = JSON.parse(rawResponse);
        // 3. Guardar en Cache si la respuesta es válida
        await saveCachedAIResponse(prompt, aiResponse, 7);
      } catch (e) {
        console.error("Error parseando respuesta de IA:", rawResponse);
        throw new Error("Invalid AI format");
      }
    }

    // 4. Calcular Score Final (Fase 5 Híbrido)
    const finalScore = await calculateFinalScore(input.ruleScore, aiResponse.score);

    // 5. Fase 6: Persistencia
    const { error: updateError } = await supabase
      .from("clientes")
      .update({
        ai_score: finalScore,
        ai_risk_level: aiResponse.risk_level,
        ai_delinquency_prob: aiResponse.delinquency_prob,
        ai_last_assessment_at: new Date().toISOString()
      })
      .eq("id", input.clienteId);

    if (updateError) throw updateError;

    revalidatePath("/admin/clientes");
    return { success: true, verdict: { ...aiResponse, finalScore } };

  } catch (error: any) {
    console.error("MADE Engine Error:", error);
    return { 
      success: false, 
      error: error.message,
      fallback: true 
    };
  }
}

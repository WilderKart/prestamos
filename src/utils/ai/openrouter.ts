import { OpenRouter } from "@openrouter/sdk";
import { createHash } from "crypto";
import { createClient } from "@/utils/supabase/server";

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || "",
});

const DEFAULT_MODEL = "qwen/qwen3-next-80b-a3b-instruct:free";

/**
 * Función central de IA con sistema de caché persistente
 */
export async function askMivankAI(params: {
  prompt: string;
  context?: string;
  ttlSeconds?: number;
}) {
  const { prompt, context = "", ttlSeconds = 3600 * 24 } = params; // Default 24h
  
  const fullPrompt = `${context}\n\nUser: ${prompt}`;
  const promptHash = createHash("sha256").update(fullPrompt).digest("hex");
  
  const supabase = await createClient();

  // 1. Intentar obtener de caché
  const { data: cached } = await supabase
    .from("ai_cache")
    .select("*")
    .eq("prompt_hash", promptHash)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (cached) {
    return cached.response_json;
  }

  // 2. Fallback: Llamada a OpenRouter
  try {
    const response = await openrouter.chat.send({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content: "Eres Mivank MADE (Decision Engine), un motor de inteligencia financiera experto en micro-créditos y cobranzas. Tus respuestas deben ser técnicas, precisas y enfocadas en la rentabilidad y el riesgo. Solo devuelves JSON puro cuando se te solicita."
        },
        {
          role: "user",
          content: fullPrompt
        }
      ],
      stream: false,
    });

    const aiResponse = response.choices[0]?.message?.content;
    
    if (!aiResponse) throw new Error("Respuesta vacía de la IA.");

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch {
      parsedResponse = { text: aiResponse };
    }

    // 3. Guardar en caché
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    await supabase.from("ai_cache").upsert({
      prompt_hash: promptHash,
      response_json: parsedResponse,
      model_used: DEFAULT_MODEL,
      expires_at: expiresAt.toISOString(),
    });

    return parsedResponse;
  } catch (error) {
    console.error("Mivank AI Error:", error);
    // FALLBACK: Motor Heurístico Manual (No implementado aquí, pero se lanzaría el error)
    throw error;
  }
}

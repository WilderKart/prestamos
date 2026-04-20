import { callModel } from "./openrouter";
import { fallbackEngine } from "./fallback";

/**
 * SELECCIÓN DE MODELO SEGÚN LA TAREA
 */
export function selectModel(task: string) {
  // Qwen para tareas que requieren razonamiento complejo (Scoring/Riesgo)
  if (task === "risk") return "qwen/qwen3-next-80b-a3b-instruct:free";
  
  // Mistral para tareas rápidas y concisas (Tips de cobrador)
  if (task === "routing") return "minimax/minimax-m2.5:free";
  
  return "mistralai/mistral-7b-instruct:free";
}

/**
 * ORQUESTADOR CON TIMEOUT Y FALLBACK
 */
export async function callAI(task: string, prompt: string) {
  const model = selectModel(task);

  try {
    // Race entre la llamada real y un timeout de 4 segundos (estándar UX)
    return await Promise.race([
      callModel(model, prompt),
      new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 4000)
      ),
    ]);
  } catch (error) {
    console.warn(`AI Fallback activado para la tarea [${task}]:`, error);
    return fallbackEngine(task, prompt);
  }
}

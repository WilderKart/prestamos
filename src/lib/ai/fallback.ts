/**
 * MOTOR DE FALLBACK HEURÍSTICO (FASE 3)
 * Garantiza que el sistema siga funcionando incluso sin conexión a OpenRouter.
 */
export function fallbackEngine(task: string, data: any) {
  if (task === "risk") {
    return JSON.stringify({
      score: 50,
      risk_level: "NORMAL",
      delinquency_prob: 0.5,
      reason: "Análisis Heurístico (Modo Fallback por indisponibilidad de IA)"
    });
  }

  if (task === "tips") {
    return JSON.stringify({
      message: "Proceder con el protocolo estándar de cobranza. Sea amable y firme."
    });
  }

  return JSON.stringify({
    message: "Sistema operando en modo de reglas tradicionales."
  });
}

/**
 * UTILIDAD DE PREVISUALIZACIÓN FINANCIERA (IA MADE)
 * Compara los términos originales vs los sugeridos por la IA y calcula el impacto en rentabilidad.
 */

export interface LoanTerms {
  monto: number;
  interes: number;
  cuotas: number;
}

export interface ComparisonResult {
  totalOriginal: number;
  totalSugerido: number;
  diferenciaAbsoluta: number;
  impactoRentabilidad: number; // Porcentaje
}

export function calculateProfitImpact(
  original: LoanTerms,
  sugerido: LoanTerms
): ComparisonResult {
  // Cálculo simplificado de interés simple (SaaS Fintech Standard)
  const totalOriginal = original.monto + (original.monto * (original.interes / 100));
  const totalSugerido = sugerido.monto + (sugerido.monto * (sugerido.interes / 100));

  const diferenciaAbsoluta = totalSugerido - totalOriginal;
  
  // El impacto se basa en la rentabilidad (interés generado)
  const gananciaOriginal = totalOriginal - original.monto;
  const gananciaSugerida = totalSugerido - sugerido.monto;
  
  const impactoRentabilidad = gananciaOriginal > 0 
    ? ((gananciaSugerida - gananciaOriginal) / gananciaOriginal) * 100 
    : 0;

  return {
    totalOriginal,
    totalSugerido,
    diferenciaAbsoluta,
    impactoRentabilidad
  };
}

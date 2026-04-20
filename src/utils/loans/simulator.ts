/**
 * Mivank Financial Logic: Loan Simulator
 * Calculates installments, dates, and amortization schedule.
 */

export interface SimulationInstallment {
  numero: number;
  fecha: string;
  valor: number;
  saldo_pendiente: number;
}

export interface SimulationResult {
  monto: number;
  interes: number;
  total_a_pagar: number;
  numero_cuotas: number;
  valor_cuota: number;
  fecha_inicio: string;
  fecha_fin: string;
  calendario: SimulationInstallment[];
}

export type FrecuenciaPago = 'DIARIO' | 'SEMANAL' | 'QUINCENAL' | 'MENSUAL';

export function simulateLoan(
  monto: number,
  interesPorcentaje: number,
  numeroCuotas: number,
  frecuencia: FrecuenciaPago,
  fechaInicio: string = new Date().toISOString()
): SimulationResult {
  const interesDecimal = interesPorcentaje / 100;
  const totalInteres = monto * interesDecimal;
  const totalAPagar = monto + totalInteres;
  const valorCuota = Math.round(totalAPagar / numeroCuotas);

  const calendario: SimulationInstallment[] = [];
  let currentFecha = new Date(fechaInicio);
  let saldoPendiente = totalAPagar;

  for (let i = 1; i <= numeroCuotas; i++) {
    // Calcular siguiente fecha según frecuencia
    if (i > 1) {
      switch (frecuencia) {
        case 'DIARIO':
          currentFecha.setDate(currentFecha.getDate() + 1);
          break;
        case 'SEMANAL':
          currentFecha.setDate(currentFecha.getDate() + 7);
          break;
        case 'QUINCENAL':
          currentFecha.setDate(currentFecha.getDate() + 15);
          break;
        case 'MENSUAL':
          currentFecha.setMonth(currentFecha.getMonth() + 1);
          break;
      }
    }

    // Saltar domingos para frecuencia DIARIA si es política común (opcional, aquí lo dejamos corrido)
    // Pero la regla dice "Calendario Real". Por ahora, calendario civil.

    saldoPendiente -= valorCuota;
    if (saldoPendiente < 0) saldoPendiente = 0;

    calendario.push({
      numero: i,
      fecha: currentFecha.toISOString().split('T')[0],
      valor: i === numeroCuotas ? valorCuota + (totalAPagar - (valorCuota * numeroCuotas)) : valorCuota,
      saldo_pendiente: Math.round(saldoPendiente)
    });
  }

  return {
    monto,
    interes: totalInteres,
    total_a_pagar: totalAPagar,
    numero_cuotas: numeroCuotas,
    valor_cuota: valorCuota,
    fecha_inicio: fechaInicio.split('T')[0],
    fecha_fin: calendario[calendario.length - 1].fecha,
    calendario
  };
}

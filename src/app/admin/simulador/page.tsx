"use client";

import { useState } from "react";
import { 
  Calculator, 
  Calendar, 
  CurrencyDollar, 
  Question, 
  Table as TableIcon,
  ArrowRight,
  Info,
  Brain,
  Sparkle,
  ChartLineUp,
  WarningCircle,
  Clock,
  CheckCircle,
  CaretRight,
  ShieldCheck,
  Lightning,
  Hash
} from "@phosphor-icons/react";
import { simulateLoan, SimulationResult, FrecuenciaPago } from "@/utils/loans/simulator";
import { formatCurrency } from "@/utils/format";
import { getClientRiskScoreAction } from "@/app/actions/ai_engine";
import { calculateProfitImpact, ComparisonResult } from "@/utils/loans/ai_preview";
import { motion, AnimatePresence } from "framer-motion";

export default function SimuladorPage() {
  const [monto, setMonto] = useState<number>(1000000);
  const [interes, setInteres] = useState<number>(20);
  const [cuotas, setCuotas] = useState<number>(24);
  const [frecuencia, setFrecuencia] = useState<FrecuenciaPago>('DIARIO');
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [aiVerdict, setAiVerdict] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);

  const handleSimulate = async () => {
    const simulation = simulateLoan(monto, interes, cuotas, frecuencia);
    setResult(simulation);
    setShowPreview(false);
    
    setIsAnalyzing(true);
    const aiResult = await getClientRiskScoreAction({
      clienteId: "simulacion_anonima",
      historial: [], 
      mora: 0,
      monto: monto,
      ruleScore: 50
    });
    
    if (aiResult.success) {
      setAiVerdict(aiResult.verdict);
      const suggestions = {
        monto: monto,
        interes: aiResult.verdict.risk_level === 'ALTO' ? interes + 5 : interes,
        cuotas: cuotas
      };
      setComparison(calculateProfitImpact(
        { monto, interes, cuotas },
        suggestions
      ));
    } else {
      setAiVerdict({ error: true });
    }
    setIsAnalyzing(false);
  };

  const applyAIRecommendation = () => {
    if (aiVerdict && aiVerdict.risk_level === 'ALTO') {
       setInteres(interes + 5);
    }
    setShowPreview(false);
  };

  return (
    <div className="space-y-12 animate-fade-up">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-ios-yellow text-black rounded-3xl flex items-center justify-center shadow-2xl shadow-ios-yellow/20 transform -rotate-3 border-2 border-white">
            <Calculator weight="fill" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-[1000] text-black tracking-tighter leading-none">
              Simulador <span className="text-ios-blue">Financiero</span>
            </h1>
            <p className="text-[11px] font-black text-black/20 uppercase tracking-[0.4em] mt-1">
              Motor de Proyección Mivank
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Configuration Panel (Left) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="ios-glass p-8 rounded-[44px] border-none shadow-2xl shadow-black/5 space-y-8 relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-ios-blue/5 rounded-full blur-3xl opacity-50" />
            
            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em] ml-2">Monto del Capital</label>
                <div className="relative">
                  <CurrencyDollar weight="fill" size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-black/10" />
                  <input 
                    type="number" 
                    value={monto}
                    onChange={(e) => setMonto(Number(e.target.value))}
                    className="w-full bg-black/[0.03] rounded-3xl py-6 pl-14 pr-6 text-xl font-[1000] text-black outline-none focus:ring-4 focus:ring-ios-blue/5 transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em] ml-2">Tasa de Interés (%)</label>
                <input 
                  type="number" 
                  value={interes}
                  onChange={(e) => setInteres(Number(e.target.value))}
                  className="w-full bg-black/[0.03] rounded-3xl py-6 px-8 text-xl font-[1000] text-black outline-none focus:ring-4 focus:ring-ios-blue/5 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em] ml-2">Ciclos</label>
                  <input 
                    type="number" 
                    value={cuotas}
                    onChange={(e) => setCuotas(Number(e.target.value))}
                    className="w-full bg-black/[0.03] rounded-3xl py-6 px-8 text-xl font-[1000] text-black outline-none focus:ring-4 focus:ring-ios-blue/5 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em] ml-2">Frecuencia</label>
                  <select 
                    value={frecuencia}
                    onChange={(e) => setFrecuencia(e.target.value as FrecuenciaPago)}
                    className="w-full bg-black/[0.03] rounded-3xl py-6 px-6 text-[15px] font-black text-black outline-none focus:ring-4 focus:ring-ios-blue/5 transition-all appearance-none"
                  >
                    <option value="DIARIO">Diario</option>
                    <option value="SEMANAL">Semanal</option>
                    <option value="QUINCENAL">Quincenal</option>
                    <option value="MENSUAL">Mensual</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={handleSimulate}
                disabled={isAnalyzing}
                className="w-full h-20 bg-black text-white rounded-[28px] font-black text-[13px] uppercase tracking-[0.3em] shadow-2xl shadow-black/20 active:scale-[0.98] transition-all flex items-center justify-center gap-4 group disabled:opacity-50"
              >
                {isAnalyzing ? (
                   <CircleNotch className="animate-spin" size={28} weight="bold" />
                ) : (
                  <>
                    Calcular Nodo
                    <ArrowRight weight="bold" className="group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI MADE Integration (Premium Card) */}
          <AnimatePresence>
            {aiVerdict && !aiVerdict.error && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="ios-glass-alt p-8 rounded-[44px] border-none shadow-2xl shadow-ios-blue/5 bg-gradient-to-br from-ios-blue/[0.02] to-ios-purple/[0.02] space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-ios-blue text-white rounded-xl flex items-center justify-center shadow-lg shadow-ios-blue/20">
                      <Brain weight="fill" size={20} />
                    </div>
                    <span className="text-[11px] font-[1000] text-ios-blue uppercase tracking-widest leading-none">MADE Intel Engine</span>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[9px] font-[1000] uppercase tracking-widest border border-white shadow-sm ${
                    aiVerdict.risk_level === 'BAJO' ? 'bg-ios-green/10 text-ios-green' :
                    aiVerdict.risk_level === 'NORMAL' ? 'bg-ios-blue/10 text-ios-blue' :
                    aiVerdict.risk_level === 'ALTO' ? 'bg-ios-pink/10 text-ios-pink' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    Riesgo {aiVerdict.risk_level}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white p-5 rounded-3xl shadow-sm border border-black/[0.02]">
                      <p className="text-[10px] font-black text-black/20 uppercase tracking-widest mb-1">IA Score</p>
                      <p className="text-2xl font-[1000] text-black tracking-tighter">{aiVerdict.score}/100</p>
                   </div>
                   <div className="bg-white p-5 rounded-3xl shadow-sm border border-black/[0.02]">
                      <p className="text-[10px] font-black text-black/20 uppercase tracking-widest mb-1">Prob. Default</p>
                      <p className="text-2xl font-[1000] text-ios-pink tracking-tighter">{(aiVerdict.delinquency_prob * 100).toFixed(0)}%</p>
                   </div>
                </div>

                <div className="ios-glass p-5 rounded-3xl border-none">
                   <p className="text-[13px] font-bold text-black/60 leading-snug italic">
                     "{aiVerdict.reason}"
                   </p>
                </div>

                {aiVerdict.risk_level === 'ALTO' && !showPreview && (
                  <button 
                    onClick={() => setShowPreview(true)}
                    className="w-full py-5 bg-ios-blue text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-ios-blue/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkle weight="fill" size={16} />
                    Auto-Optimizar Tasa
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results (Right) */}
        <div className="lg:col-span-8 space-y-8">
          {!result ? (
            <div className="ios-glass h-[600px] flex flex-col items-center justify-center text-center p-12 space-y-8 rounded-[60px] border-dashed border-2 border-black/5">
              <div className="w-24 h-24 bg-black/[0.03] rounded-[40px] flex items-center justify-center text-black/10">
                <ChartLineUp weight="fill" size={48} />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-[1000] text-black tracking-tight">Análisis Desactivado</h3>
                <p className="text-[15px] font-bold text-black/30 max-w-sm mx-auto">
                  Configure los parámetros dinámicos de capital para iniciar la simulación del nodo financiero.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-10 animate-fade-up">
              {/* Comparison Preview (AI SUGGESTIONS) */}
              <AnimatePresence>
                {showPreview && comparison && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="ios-glass p-8 border-none rounded-[44px] shadow-2xl shadow-ios-blue/10 bg-gradient-to-br from-ios-blue/[0.05] to-transparent relative overflow-hidden"
                  >
                    <div className="absolute top-[-10%] left-[-10%] opacity-5 rotate-12">
                       <Sparkle weight="fill" size={200} />
                    </div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
                       <div className="space-y-1">
                          <h3 className="text-[17px] font-[1000] text-ios-blue tracking-tighter leading-none mb-1 flex items-center gap-2">
                             <Sparkle weight="fill" /> Optimización IA Activa
                          </h3>
                          <p className="text-[11px] font-black text-black/30 uppercase tracking-[0.2em]">Compensación de Riesgo Aplicada</p>
                       </div>
                       <button 
                         onClick={() => setShowPreview(false)}
                         className="px-4 py-2 bg-black text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl"
                       >
                         Descartar ×
                       </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 relative z-10">
                       <div className="bg-white/40 p-6 rounded-[32px] border border-white">
                          <p className="text-[10px] font-black text-black/20 uppercase tracking-widest mb-1">Tasa Base</p>
                          <p className="text-2xl font-[1000] text-black/20 line-through tracking-tighter">{interes}%</p>
                       </div>
                       <div className="bg-ios-blue p-8 rounded-[36px] shadow-2xl shadow-ios-blue/30 transform -rotate-1 border-2 border-white/20">
                          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 text-center">Tasa IA</p>
                          <p className="text-4xl font-[1000] text-white tracking-tighter text-center">{interes + 5}%</p>
                       </div>
                       <div className="bg-white p-6 rounded-[32px] border border-ios-green/20 flex flex-col justify-center">
                          <p className="text-[10px] font-black text-ios-green uppercase tracking-widest mb-1 flex items-center gap-1">
                             <TrendingUp weight="bold" size={14} /> Impacto Profit
                          </p>
                          <p className="text-3xl font-[1000] text-ios-green tracking-tighter">+{comparison.impactoRentabilidad.toFixed(1)}%</p>
                       </div>
                    </div>

                    <div className="relative z-10 p-4 bg-white/60 rounded-[32px] border border-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                       <div className="flex gap-8">
                          <div className="space-y-1">
                             <p className="text-[9px] font-black text-black/20 uppercase tracking-widest">Retorno Original</p>
                             <p className="text-sm font-black text-black/20 line-through">{formatCurrency(comparison.totalOriginal)}</p>
                          </div>
                          <div className="w-[1px] h-10 bg-black/5 hidden md:block" />
                          <div className="space-y-1">
                             <p className="text-[9px] font-black text-ios-blue uppercase tracking-widest">Retorno Optimizado</p>
                             <p className="text-sm font-[1000] text-ios-blue">{formatCurrency(comparison.totalSugerido)}</p>
                          </div>
                       </div>
                       <button 
                         onClick={applyAIRecommendation}
                         className="w-full md:w-auto px-8 py-5 bg-black text-white rounded-[24px] font-[1000] text-[11px] uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                       >
                         Actualizar Simulación
                       </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="ios-glass p-8 rounded-[44px] border-none shadow-2xl shadow-black/5 relative group overflow-hidden">
                  <CurrencyDollar weight="fill" size={120} className="absolute -bottom-10 -right-10 text-ios-yellow/5 group-hover:scale-110 transition-transform" />
                  <p className="text-[11px] font-black text-black/20 uppercase tracking-[0.3em] mb-2">Total Recaudo Proyectado</p>
                  <h3 className="text-5xl font-[1000] text-black tracking-tighter mb-4">{formatCurrency(result.total_a_pagar)}</h3>
                  <div className="flex items-center gap-4 text-[13px] font-[800]">
                    <span className="text-black/40">Capital: {formatCurrency(result.monto)}</span>
                    <div className="w-1 h-1 rounded-full bg-black/10" />
                    <span className="text-ios-blue">Ganancia: {formatCurrency(result.interes)}</span>
                  </div>
                </div>

                <div className="ios-glass p-8 rounded-[44px] border-none shadow-2xl shadow-black/5 relative group overflow-hidden">
                  <div className="absolute top-4 right-8 text-[11px] font-black text-black/10 uppercase tracking-[0.4em]">Cuota Fija</div>
                  <Calendar weight="fill" size={120} className="absolute -bottom-10 -right-10 text-black/5 group-hover:scale-110 transition-transform" />
                  <p className="text-[11px] font-black text-black/20 uppercase tracking-[0.3em] mb-2">Valor por Cuota</p>
                  <h3 className="text-5xl font-[1000] text-ios-blue tracking-tighter mb-4">{formatCurrency(result.valor_cuota)}</h3>
                  <div className="flex items-center gap-4 text-[13px] font-[800]">
                    <span className="text-black/40">Inicio: {result.fecha_inicio}</span>
                    <div className="w-1 h-1 rounded-full bg-black/10" />
                    <span className="text-black">Fin: {result.fecha_fin}</span>
                  </div>
                </div>
              </div>

              {/* Amortization Table */}
              <div className="ios-glass border-none rounded-[44px] shadow-2xl shadow-black/[0.03] overflow-hidden">
                <div className="px-10 py-8 bg-black/[0.01] border-b border-black/[0.03] flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-ios-yellow text-black rounded-xl flex items-center justify-center">
                         <TableIcon weight="fill" size={24} />
                      </div>
                      <div>
                        <h3 className="text-[17px] font-[1000] text-black tracking-tight leading-none uppercase">Calendario de Amortización</h3>
                        <p className="text-[10px] font-black text-black/20 tracking-widest uppercase mt-1">Nodos de Cobro Secuencial</p>
                      </div>
                   </div>
                   <div className="px-6 py-2 bg-white rounded-2xl shadow-sm text-[11px] font-black uppercase tracking-widest text-black/40 border border-black/[0.02]">
                      {result.calendario.length} Cuotas {frecuencia}
                   </div>
                </div>
                <div className="max-h-[500px] overflow-y-auto">
                   <table className="w-full text-left">
                     <thead className="sticky top-0 bg-white/80 backdrop-blur-3xl z-30 shadow-sm">
                       <tr className="border-b border-black/[0.03]">
                         <th className="px-10 py-5 text-[10px] font-black text-black/20 uppercase tracking-[0.3em]">Nodo</th>
                         <th className="px-10 py-5 text-[10px] font-black text-black/20 uppercase tracking-[0.3em]">Fecha</th>
                         <th className="px-10 py-5 text-[10px] font-black text-black/20 uppercase tracking-[0.3em]">Cuota</th>
                         <th className="px-10 py-5 text-[10px] font-black text-black/20 uppercase tracking-[0.3em]">Balance Final</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-black/[0.02]">
                       {result.calendario.map((cuota, i) => (
                         <tr key={cuota.numero} className="group hover:bg-black/[0.01] transition-colors">
                           <td className="px-10 py-5 text-[15px] font-[1000] text-black/30 group-hover:text-black">
                             {cuota.numero.toString().padStart(2, '0')}
                           </td>
                           <td className="px-10 py-5">
                             <div className="flex items-center gap-3">
                               <Clock weight="fill" size={14} className="text-black/5" />
                               <span className="text-[14px] font-[800] text-black/60 uppercase">{cuota.fecha}</span>
                             </div>
                           </td>
                           <td className="px-10 py-5">
                             <p className="text-[17px] font-[1000] text-black tracking-tighter">{formatCurrency(cuota.valor)}</p>
                           </td>
                           <td className="px-10 py-5">
                             <p className="text-[14px] font-bold text-black/30 group-hover:text-ios-blue transition-colors">{formatCurrency(cuota.saldo_pendiente)}</p>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>
              </div>
              
              <div className="ios-glass-alt p-8 rounded-[44px] border-none flex items-start gap-6 shadow-2xl shadow-black/5">
                <div className="w-14 h-14 bg-white rounded-3xl flex items-center justify-center text-ios-yellow shadow-xl border border-black/[0.02] shrink-0">
                  <Info weight="fill" size={28} />
                </div>
                <div className="space-y-1 pt-1">
                  <p className="text-[14px] font-black text-black/30 uppercase tracking-[0.1em]">Cláusula de Transparencia</p>
                  <p className="text-[13px] font-bold text-black/60 leading-relaxed italic">
                    "Esta proyección es un gemelo digital financiero y puede variar según la fecha real de inyección de capital. No incluye recargos por ruptura de contrato o mora operativa."
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { 
  RocketLaunch, 
  MapTrifold, 
  CheckCircle, 
  Clock, 
  Warning, 
  CaretRight,
  CircleNotch,
  Robot
} from "@phosphor-icons/react";
import { generateDailyRoutesAction, assignRouteToCollectorAction } from "@/app/actions/routes";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface RutasClientProps {
  initialRutas: any[];
  empresaId: string;
}

export default function RutasClient({ initialRutas, empresaId }: RutasClientProps) {
  const [loading, setLoading] = useState(false);
  const [rutas, setRutas] = useState<any[]>(initialRutas);
  const [status, setStatus] = useState<"idle" | "generating" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (loading || rutas.length > 0) return; 

    setLoading(true);
    setStatus("generating");
    setError(null);

    try {
      const result = await generateDailyRoutesAction();

      if (result.success) {
        setStatus("success");
        window.location.reload(); 
      } else {
        setStatus("error");
        setError(result.error || "ERROR_SISTEMA_LOGISTICA");
      }
    } catch (e: any) {
      setStatus("error");
      const errorMsg = e.message || "";
      if (errorMsg.includes("NON_WORKING_DAY")) {
         setError("DÍA NO OPERATIVO: Los cobros están bloqueados en domingos/festivos.");
      } else if (errorMsg.includes("ROUTES_ALREADY_EXIST")) {
         setError("DUPLICIDAD: Las rutas de hoy ya fueron desplegadas.");
      } else {
         setError("TIEMPO_AGOTADO_O_ERROR_CONCURRENCIA");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="px-6 py-8 space-y-8">
      {/* Card de Despliegue IA */}
      <section>
        <div className="ios-glass p-8 rounded-[40px] border-none shadow-2xl relative overflow-hidden group">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-ios-blue rounded-2xl flex items-center justify-center shadow-lg shadow-ios-blue/20">
                <Robot weight="fill" size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-[1000] text-black tracking-tight italic">Mivank Logistics Engine (Enterprise)</h3>
                <p className="text-[10px] font-bold text-ios-gray/40 uppercase tracking-widest">IA Optimización & Scoring Multi-Tenant</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold text-ios-gray/60 leading-relaxed">
                Genera las rutas óptimas del día sincronizando geolocalización y prioridad de mora agregada. 
                <span className="block mt-2 text-[10px] text-ios-blue/60 uppercase font-black tracking-widest">Blindaje MD5 & Advisory Lock Activo</span>
              </p>

              <button
                onClick={handleGenerate}
                disabled={loading || rutas.length > 0}
                className={`w-full py-6 rounded-[28px] flex items-center justify-center gap-4 text-[13px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-2xl ${
                  rutas.length > 0 ? "bg-ios-green/10 text-ios-green opacity-50 cursor-not-allowed border border-ios-green/20" :
                  status === "error" ? "bg-ios-pink text-white" :
                  "bg-black text-white hover:bg-ios-blue shadow-ios-blue/20"
                }`}
              >
                {loading ? (
                  <CircleNotch className="animate-spin" size={24} weight="bold" />
                ) : status === "success" ? (
                  <CheckCircle weight="fill" size={24} />
                ) : rutas.length > 0 ? (
                  <CheckCircle weight="fill" size={24} />
                ) : (
                  <RocketLaunch weight="fill" size={24} />
                )}
                
                {rutas.length > 0 ? "Sincronización Completada" : 
                 loading ? "Calculando Vectores..." :
                 status === "error" ? "Reintentar Despliegue" : 
                 "Lanzar Rutas Enterprise"}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-ios-pink/5 rounded-2xl border border-ios-pink/10 text-ios-pink text-xs font-bold animate-shake">
                <Warning weight="fill" size={16} />
                {error}
              </div>
            )}
          </div>

          <div className="absolute -top-24 -right-24 w-64 h-64 bg-ios-blue/5 rounded-full blur-3xl group-hover:bg-ios-blue/10 transition-colors" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-ios-purple/5 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Listado de Rutas Activas */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xs font-black text-ios-gray/30 uppercase tracking-[0.3em]">
            Monitor de Campo ({rutas.length})
          </h2>
          <div className="text-[10px] font-bold text-ios-gray/40 flex items-center gap-2">
            <Clock size={12} />
            {format(new Date(), "HH:mm 'hs'", { locale: es })}
          </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {rutas.map((ruta, idx) => {
              const completadas = (ruta.visitas || []).filter((v: any) => v.estado === 'completado').length;
              const total = ruta.visitas?.length || 0;
              const progreso = total > 0 ? (completadas / total) * 100 : 0;

              return (
                <motion.div
                  key={ruta.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link href={`/capitan/rutas/${ruta.id}`}>
                    <div className="ios-glass p-6 rounded-[32px] border-none shadow-xl hover:shadow-2xl transition-all active:scale-[0.98]">
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-ios-blue uppercase tracking-widest">
                            Cobrador Asignado
                          </p>
                          <h4 className="text-xl font-[1000] text-black tracking-tight leading-none italic">
                            {ruta.usuarios?.nombre || "Sin Asignar"}
                          </h4>
                        </div>
                        <div className="px-3 py-1 bg-white rounded-full border border-black/5 shadow-sm text-[10px] font-black text-black">
                          {completadas}/{total} COBROS
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-ios-blue"
                            initial={{ width: 0 }}
                            animate={{ width: `${progreso}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                          <span className={progreso === 100 ? "text-ios-green" : "text-ios-gray/40"}>
                            {progreso === 100 ? "Finalizado" : "En Progreso"}
                          </span>
                          <span className="text-ios-blue">{Math.round(progreso)}%</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-black/5 flex justify-between items-center">
                         <div className="flex -space-x-2">
                            {[1,2,3].map(i => (
                              <div key={i} className="w-6 h-6 rounded-full bg-white border border-black/5 flex items-center justify-center">
                                 <div className="w-4 h-4 rounded-full bg-ios-gray/5" />
                              </div>
                            ))}
                            {total > 3 && (
                              <div className="text-[10px] font-black text-ios-gray/30 pl-4">+{total - 3}</div>
                            )}
                         </div>
                         <CaretRight weight="bold" className="text-ios-gray/20" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {rutas.length === 0 && (
            <div className="py-20 text-center space-y-4 opacity-30">
              <MapTrifold size={64} className="mx-auto" weight="duotone" />
              <p className="text-xs font-black uppercase tracking-widest">
                Sin Rutas Desplegadas
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

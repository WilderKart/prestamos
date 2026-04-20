"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { 
  MapPin, 
  Phone, 
  User, 
  CurrencyDollar, 
  Clock, 
  Camera, 
  CheckCircle, 
  XCircle,
  ShieldWarning,
  CircleNotch,
  Brain,
  Sparkle,
  NavigationArrow,
  IdentificationCard,
  CreditCard,
  CaretRight,
  ArrowRight,
  HandPointing
} from "@phosphor-icons/react";
import MissionMap from "./MissionMap";
import { recordPaymentAction, toggleMissionStatusAction } from "@/app/actions/routes";
import Beacon from "@/components/telemetry/Beacon";
import MissionProgressBar from "@/components/ui/MissionProgressBar";
import { formatCurrency } from "@/utils/format";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const LogisticsMap = dynamic(() => import("@/components/ui/LogisticsMap"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-black/5 animate-pulse rounded-[32px]" />
});

interface MissionClientProps {
  visita: any;
  allVisitas: any[];
  empresaId: string;
  estadoMision: string;
}

export default function MissionClient({ visita, allVisitas, empresaId, estadoMision }: MissionClientProps) {
  const [currentPos, setCurrentPos] = useState<[number, number] | null>(null);
  const [monto, setMonto] = useState<number>(visita.clientes?.prestamos?.[0]?.valor_cuota || 0);
  const [isPaying, setIsPaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorGps, setErrorGps] = useState<string | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);

  // Monitorizar GPS
  useEffect(() => {
    if (!navigator.geolocation) {
      setErrorGps("El GPS no es compatible.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCurrentPos([pos.coords.latitude, pos.coords.longitude]);
        setAccuracy(pos.coords.accuracy);
        setErrorGps(null);
      },
      (err) => {
        setErrorGps("Por favor active el GPS para continuar.");
      },
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const handlePayment = async () => {
    if (!currentPos || !accuracy || accuracy > 60) {
      toast.error(accuracy && accuracy > 60 
        ? `Señal débil (${Math.round(accuracy)}m). Ubíquese en campo abierto.` 
        : "GPS requerido para validación Zero Trust."
      );
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Validando coordenadas y procesando recaudo...");
    try {
      const result = await recordPaymentAction({
        visitaId: visita.id,
        lat: currentPos[0],
        lng: currentPos[1],
        accuracy,
        evidenciaUrl: "https://placeholder.com/evidence.jpg", 
        monto,
        metodo: 'EFECTIVO'
      });

      if (result.success) {
        toast.success("Pago registrado y verificado exitosamente.", { id: toastId });
        setIsPaying(false);
      } else {
        toast.error(result.error || "Fallo en la validación de servidor.", { id: toastId });
      }
    } catch (error) {
      toast.error("Error crítico de comunicación.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleStartMission = async () => {
    setLoading(true);
    const result = await toggleMissionStatusAction('EN_MISION');
    if (result.success) {
      toast.success("Jornada iniciada. Telemetría activa.");
    } else {
      toast.error("Error al iniciar jornada.");
    }
    setLoading(false);
  };

  const handleEndMission = async () => {
    setLoading(true);
    const result = await toggleMissionStatusAction('INACTIVO');
    if (result.success) {
      toast.success("Jornada finalizada.");
    }
    setLoading(false);
  };

  if (estadoMision === 'INACTIVO') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-8">
        <div className="w-24 h-24 bg-ios-blue/10 rounded-[44px] flex items-center justify-center text-ios-blue animate-bounce">
          <Play weight="fill" size={48} />
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-[1000] text-black tracking-tighter uppercase">Esperando Inicio</h2>
          <p className="text-[13px] font-bold text-black/40 uppercase tracking-widest max-w-xs mx-auto">
            "Para comenzar el rastreo y visualizar sus objetivos, debe iniciar la jornada oficial."
          </p>
        </div>
        <button
          onClick={handleStartMission}
          disabled={loading}
          className="w-full h-20 bg-ios-blue text-white rounded-[32px] font-black text-[15px] uppercase tracking-[0.3em] shadow-2xl shadow-ios-blue/20 active:scale-95 transition-all flex items-center justify-center gap-4"
        >
          {loading ? <CircleNotch className="animate-spin" size={24} weight="bold" /> : <><NavigationArrow weight="fill" size={24} /> INICIAR JORNADA</>}
        </button>
      </div>
    );
  }

  if (!visita) return null;

  const cliente = visita.clientes;
  const usuario = cliente?.usuarios;
  const prestamo = cliente?.prestamos?.[0];
  const destPos: [number, number] = [cliente?.lat || 0, cliente?.lng || 0];

  // Preparar pasos para la barra de progreso
  const progressSteps = allVisitas.map(v => ({
    id: v.id,
    estado: v.estado === 'completado' ? 'completado' : (v.id === visita.id ? 'activo' : 'pendiente')
  })) as any[];

  return (
    <div className="space-y-8 pb-32">
      <Beacon empresaId={empresaId} isActive={estadoMision === 'EN_MISION'} />
      
      <MissionProgressBar steps={progressSteps} />
      {/* Map Section - Refined for iOS Premium */}
      <section className="px-4 animate-fade-up">
        <div className="relative h-[320px] rounded-[44px] overflow-hidden shadow-2xl shadow-black/10 border-4 border-white">
          <MissionMap 
            currentPos={currentPos} 
            destPos={destPos} 
            clientName={usuario?.nombre || "Cliente"} 
          />
          
          {/* Status Overlay */}
          <div className="absolute top-6 right-6 z-10">
             <AnimatePresence>
              {accuracy && accuracy <= 50 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/90 backdrop-blur-xl border border-white px-4 py-2 rounded-full flex items-center gap-3 shadow-lg"
                >
                  <div className="w-2.5 h-2.5 bg-ios-green rounded-full animate-pulse shadow-[0_0_8px_rgba(52,199,89,1)]" />
                  <span className="text-[10px] font-black uppercase text-black tracking-[0.1em]">Zero Trust GPS: {Math.round(accuracy)}m</span>
                </motion.div>
              ) : errorGps && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="bg-ios-pink/90 backdrop-blur-xl border border-white px-4 py-2 rounded-full flex items-center gap-3 shadow-lg"
                 >
                   <ShieldWarning weight="fill" className="text-white" size={16} />
                   <span className="text-[10px] font-black uppercase text-white tracking-[0.1em]">Error Localización</span>
                 </motion.div>
              )}
             </AnimatePresence>
          </div>

          <div className="absolute bottom-6 left-6 z-10 flex gap-2">
             <a 
               href={`https://www.google.com/maps/dir/?api=1&destination=${cliente?.lat},${cliente?.lng}`}
               target="_blank"
               className="h-10 px-4 bg-black text-white rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl"
             >
                <NavigationArrow weight="fill" size={16} /> Navegar (Maps)
             </a>
             <a 
               href={`waze://?ll=${cliente?.lat},${cliente?.lng}&navigate=yes`}
               className="h-10 px-4 bg-white text-black rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl"
             >
                Waze
             </a>
          </div>
        </div>
      </section>

      <div className="px-4 space-y-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        {/* Client Core Card */}
        <div className="ios-glass border-none p-8 rounded-[44px] shadow-2xl shadow-black/5 space-y-8">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
               <div className="flex items-center gap-2 text-[10px] font-black text-black/20 uppercase tracking-[0.2em]">
                  <IdentificationCard weight="fill" size={14} /> 
                  Expediente #{cliente?.cedula}
               </div>
               <h2 className="text-3xl font-[1000] text-black tracking-tighter leading-none">
                 {usuario?.nombre}
               </h2>
               <p className="text-[14px] font-bold text-ios-blue flex items-center gap-1">
                  <MapPin weight="fill" /> 
                  Ubicación Verificada en Terreno
               </p>
            </div>
            <a 
              href={`tel:${usuario?.telefono}`}
              className="w-16 h-16 bg-ios-blue text-white rounded-3xl flex items-center justify-center shadow-xl shadow-ios-blue/30 active:scale-90 transition-all"
            >
              <Phone weight="fill" size={28} />
            </a>
          </div>

          {/* Financial Snapshot */}
          <div className="grid grid-cols-2 gap-4">
             <div className="ios-glass-alt p-6 rounded-[32px] border-none shadow-inner">
                <div className="flex items-center gap-2 text-ios-green mb-2">
                   <CurrencyDollar weight="fill" size={16} />
                   <span className="text-[10px] font-black uppercase tracking-widest text-black/30">Cuota Base</span>
                </div>
                <p className="text-2xl font-[1000] text-black tracking-tight">{formatCurrency(prestamo?.valor_cuota || 0)}</p>
             </div>
             <div className="ios-glass-alt p-6 rounded-[32px] border-none shadow-inner bg-black/[0.02]">
                <div className="flex items-center gap-2 text-ios-purple mb-2">
                   <CreditCard weight="fill" size={16} />
                   <span className="text-[10px] font-black uppercase tracking-widest text-black/30">Saldo Global</span>
                </div>
                <p className="text-2xl font-[1000] text-black tracking-tight">{formatCurrency(prestamo?.saldo_actual || 0)}</p>
             </div>
          </div>

          {/* Map Preview (Tactical View) */}
          <div className="h-64 ios-glass rounded-[44px] overflow-hidden border-none shadow-xl relative group">
             <LogisticsMap 
                points={[{ 
                    lat: visita.clientes?.lat, 
                    lng: visita.clientes?.lng, 
                    label: "Destino Actual" 
                }]} 
                showPath={false} 
             />
             <div className="absolute top-4 left-4 z-[1000] px-3 py-1 bg-white/80 backdrop-blur rounded-full text-[9px] font-black uppercase tracking-widest text-ios-blue shadow-sm">
                Vista Táctica
             </div>
             <a 
               href={`https://www.google.com/maps/dir/?api=1&destination=${visita.clientes?.lat},${visita.clientes?.lng}`}
               target="_blank"
               className="absolute bottom-4 right-4 z-[1000] w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-2xl active:scale-95 transition-all"
             >
                <NavigationArrow weight="fill" size={20} />
             </a>
          </div>

          {/* AI Strategy Layer */}
          {(visita.ai_collector_tips || visita.ai_payment_probability) && (
            <div className="bg-gradient-to-br from-ios-blue/5 to-ios-purple/5 p-6 rounded-[32px] border border-white relative overflow-hidden">
               <div className="flex items-center justify-between mb-3 relative z-10">
                  <div className="flex items-center gap-2 text-ios-blue">
                     <Brain weight="fill" size={20} />
                     <span className="text-[11px] font-black uppercase tracking-widest">IA Strategic Insight</span>
                  </div>
                  {visita.ai_payment_probability && (
                    <div className="px-3 py-1 bg-white rounded-full text-[10px] font-black text-black shadow-sm">
                       {Math.round(visita.ai_payment_probability * 100)}% PROB.
                    </div>
                  )}
               </div>
               <p className="text-[14px] font-semibold text-black/60 leading-relaxed italic relative z-10">
                  "{visita.ai_collector_tips}"
               </p>
               <Sparkle weight="fill" className="absolute -bottom-4 -right-4 text-ios-blue/5 rotate-12" size={80} />
            </div>
          )}

          {/* Mission Controls */}
          <AnimatePresence mode="wait">
            {!isPaying ? (
              <motion.div 
                key="actions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid grid-cols-1 gap-4 pt-4"
              >
                <button 
                  onClick={() => setIsPaying(true)}
                  className="h-20 bg-ios-green text-white rounded-[28px] font-black text-[15px] uppercase tracking-[0.2em] shadow-2xl shadow-ios-green/30 flex items-center justify-center gap-4 active:scale-[0.98] transition-all hover:brightness-105"
                >
                  <HandPointing weight="fill" size={28} />
                  Iniciar Recaudo Presencial
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <button className="h-16 bg-black/[0.03] text-black/40 rounded-[24px] font-[900] text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-ios-pink/5 hover:text-ios-pink transition-all border border-transparent hover:border-ios-pink/10 group">
                    <XCircle weight="fill" size={20} className="opacity-20 group-hover:opacity-100" /> Ausente / No Pago
                  </button>
                  <button className="h-16 bg-black/[0.03] text-black/40 rounded-[24px] font-[900] text-[11px] uppercase tracking-widest flex items-center justify-center gap-3">
                    <Clock weight="fill" size={20} className="opacity-20" /> Pendiente
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="form"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                className="space-y-6 pt-4"
              >
                <div className="ios-glass-alt p-8 rounded-[44px] space-y-8 border border-white shadow-2xl">
                  <div className="text-center space-y-2">
                     <h3 className="text-xl font-[1000] text-black tracking-tight">Confirmación de Recaudo</h3>
                     <p className="text-[12px] font-bold text-black/30 uppercase tracking-widest">Protocolo de ingreso de capital</p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-black/20 uppercase tracking-[0.3em] block ml-2">Monto Transaccional</label>
                    <div className="relative">
                       <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-black/10">$</span>
                       <input 
                        type="number"
                        value={monto}
                        onChange={(e) => setMonto(Number(e.target.value))}
                        className="w-full bg-black/[0.03] rounded-[28px] py-10 px-12 text-black text-5xl font-[1000] tracking-tighter border-none focus:ring-4 focus:ring-ios-green/10 transition-all outline-none text-center"
                        autoFocus
                      />
                    </div>
                  </div>
                  
                  <button className="w-full py-6 bg-ios-blue/10 text-ios-blue rounded-[24px] flex items-center justify-center gap-3 text-[12px] font-black uppercase tracking-widest active:scale-95 transition-all group overflow-hidden relative">
                    <div className="absolute inset-0 bg-ios-blue/5 translate-y-full group-hover:translate-y-0 transition-transform" />
                    <Camera weight="fill" size={24} className="relative z-10" />
                    <span className="relative z-10">Validación Fotográfica Obligatoria</span>
                  </button>
                  
                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={handlePayment}
                      disabled={loading}
                      className="flex-[3] h-20 bg-ios-green text-white rounded-[28px] font-black text-[13px] uppercase tracking-[0.2em] shadow-2xl shadow-ios-green/30 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 transition-all"
                    >
                      {loading ? (
                        <CircleNotch className="animate-spin" size={28} weight="bold" />
                      ) : (
                        <>
                           <CheckCircle weight="fill" size={24} /> 
                           Sincronizar Pago
                        </>
                      )}
                    </button>
                    <button 
                      onClick={() => setIsPaying(false)}
                      className="flex-1 h-20 bg-black/5 text-black/20 rounded-[28px] flex items-center justify-center transition-all hover:bg-black/10 active:scale-95"
                    >
                      <XCircle weight="fill" size={32} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* End Mission Control */}
          <div className="pt-8 border-t border-black/5">
             <button 
               onClick={handleEndMission}
               className="w-full h-14 bg-black/[0.03] text-black/20 rounded-[24px] font-black text-[11px] uppercase tracking-[0.3em] transition-all hover:bg-ios-pink/5 hover:text-ios-pink"
             >
                Pausar / Finalizar Jornada
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

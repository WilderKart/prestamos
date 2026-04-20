"use client";

import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  UserPlus,
  CurrencyDollar,
  Warning,
  CaretRight,
  ShieldCheck,
  Calendar,
  Lightning,
  DotsThreeCircle,
  Hash
} from "@phosphor-icons/react";
import { formatCurrency } from "@/utils/format";
import { motion, AnimatePresence } from "framer-motion";

interface Solicitud {
  id: string;
  monto_solicitado: number;
  estado: string;
  created_at: string;
  motivo_rechazo?: string;
  fiadores?: any;
}

export default function SolicitudesList({ solicitudes }: { solicitudes: Solicitud[] }) {
  const getEstadoDetails = (estado: string) => {
    switch (estado) {
      case "PENDIENTE":
        return { color: "text-ios-yellow", bg: "bg-ios-yellow/10", icon: Clock, label: "Pendiente" };
      case "APROBADO":
        return { color: "text-ios-green", bg: "bg-ios-green/10", icon: CheckCircle, label: "Aprobado" };
      case "RECHAZADO":
        return { color: "text-ios-pink", bg: "bg-ios-pink/10", icon: XCircle, label: "Rechazado" };
      case "FIADOR_REQUERIDO":
        return { color: "text-ios-purple", bg: "bg-ios-purple/10", icon: UserPlus, label: "Fiador" };
      default:
        return { color: "text-black/30", bg: "bg-black/5", icon: DotsThreeCircle, label: "Procesando" };
    }
  };

  if (!solicitudes || solicitudes.length === 0) {
    return (
      <div className="ios-glass border-dashed border-2 border-black/5 p-16 text-center rounded-[44px]">
        <div className="w-16 h-16 bg-black/5 rounded-[24px] flex items-center justify-center mx-auto mb-4 text-black/10">
          <Calendar weight="fill" size={32} />
        </div>
        <h3 className="text-xl font-[1000] text-black tracking-tight mb-2">Historial Vacío</h3>
        <p className="text-[14px] font-bold text-black/30 max-w-xs mx-auto">No se registran trámites de inyección de capital en su expediente actual.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
         <h3 className="text-[10px] font-black text-black/20 uppercase tracking-[0.4em]">Audit Trail de Aplicaciones</h3>
         <div className="w-8 h-8 rounded-full bg-black/[0.03] flex items-center justify-center text-black/20">
            <Hash weight="bold" size={14} />
         </div>
      </div>

      <AnimatePresence mode="popLayout">
        <div className="space-y-4">
          {solicitudes.map((solicitud, i) => {
            const details = getEstadoDetails(solicitud.estado);
            const Icon = details.icon;

            return (
              <motion.div
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                key={solicitud.id}
                className="ios-glass border-none p-6 rounded-[36px] shadow-2xl shadow-black/[0.02] group relative overflow-hidden"
              >
                {/* Background ID accent */}
                <span className="absolute -top-4 -right-4 text-[60px] font-[1000] text-black/[0.02] select-none pointer-events-none">
                   #{solicitud.id.slice(0, 3)}
                </span>

                <div className="flex items-start justify-between relative z-10 mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl ${details.bg} ${details.color} flex items-center justify-center border-2 border-white shadow-xl`}>
                      <Icon weight="fill" size={28} />
                    </div>
                    <div>
                      <h4 className="text-[16px] font-[900] text-black tracking-tight leading-none mb-1">
                         Solicitud {details.label}
                      </h4>
                      <p className="text-[11px] font-black text-black/20 uppercase tracking-widest">
                         Inyectado: {new Date(solicitud.created_at).toLocaleDateString('es', { day: 'numeric', month: 'short' }).toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[9px] font-[1000] uppercase tracking-widest shadow-sm border border-white ${details.bg} ${details.color}`}>
                     {details.label}
                  </div>
                </div>

                <div className="flex items-end justify-between relative z-10">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em] mb-1">Volumen Solicitado</p>
                     <p className="text-2xl font-[1000] text-black tracking-tighter">
                        {formatCurrency(solicitud.monto_solicitado)}
                     </p>
                  </div>
                  
                  {solicitud.estado === "FIADOR_REQUERIDO" && (
                    <motion.a 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      href={`/cliente/solicitudes/${solicitud.id}/fiador`}
                      className="bg-ios-purple text-white px-6 py-3 rounded-2xl text-[11px] font-[1000] uppercase tracking-widest shadow-xl shadow-ios-purple/20 flex items-center gap-2"
                    >
                      Vincular Fiador <CaretRight weight="bold" />
                    </motion.a>
                  )}
                </div>

                <AnimatePresence>
                  {solicitud.estado === "RECHAZADO" && solicitud.motivo_rechazo && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-6 p-4 bg-ios-pink/5 rounded-2xl border border-ios-pink/10 flex items-start gap-4"
                    >
                       <Warning weight="fill" size={18} className="text-ios-pink shrink-0 mt-0.5" />
                       <div className="space-y-0.5">
                          <p className="text-[10px] font-[1000] text-ios-pink uppercase tracking-widest leading-none">Causa de Denegación</p>
                          <p className="text-[13px] font-bold text-black/60 italic leading-snug">
                             "{solicitud.motivo_rechazo}"
                          </p>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Audit Key */}
                <div className="mt-6 pt-4 border-t border-black/[0.03] flex items-center justify-between opacity-20">
                   <div className="flex items-center gap-2">
                       <ShieldCheck weight="fill" size={14} />
                       <span className="text-[8px] font-black uppercase tracking-widest">Signed by Mivank Auditor</span>
                   </div>
                   <span className="text-[8px] font-black uppercase tracking-tighter">NODE-{solicitud.id.slice(-6).toUpperCase()}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>
    </div>
  );
}

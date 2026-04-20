"use client";

import { marcarTodasComoLeidas, marcarComoLeida } from "./actions";
import { 
  Check, 
  CheckCircle, 
  Bell, 
  Info, 
  CaretRight,
  DotsThree,
  Eye,
  Trash,
  X,
  CircleNotch,
  HandsClapping
} from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function ClientNotificacionesList({ notificaciones }: { notificaciones: any[] }) {
  const [isPending, setIsPending] = useState(false);
  const [notifs, setNotifs] = useState(notificaciones);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase.channel('notifs_list_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notificaciones' }, (payload) => {
        setNotifs((prev) => {
          if (prev.some((n) => n.id === payload.new.id)) return prev;
          return [payload.new, ...prev];
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notificaciones' }, (payload) => {
        setNotifs((prev) => prev.map((n) => n.id === payload.new.id ? payload.new : n));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleMarcarTodas = async () => {
    setIsPending(true);
    setNotifs((prev) => prev.map(n => ({...n, leida: true})));
    await marcarTodasComoLeidas();
    setIsPending(false);
  };

  const handleMarcarUna = async (id: string, leida: boolean) => {
    if (leida) return;
    setNotifs((prev) => prev.map(n => n.id === id ? {...n, leida: true} : n));
    await marcarComoLeida(id);
  };

  const hasUnread = notifs.some(n => !n.leida);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-[11px] font-[1000] text-black/20 uppercase tracking-[0.4em]">
          Historial Cronológico
        </h2>
        {hasUnread && (
          <button
            onClick={handleMarcarTodas}
            disabled={isPending}
            className="px-6 py-2.5 bg-black/[0.03] text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-black hover:text-white transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 shadow-sm border border-black/[0.02]"
          >
            {isPending ? <CircleNotch className="animate-spin" size={14} weight="bold" /> : <CheckCircle weight="bold" size={14} />}
            Marcar reporte como leido
          </button>
        )}
      </div>

      {notifs.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="ios-glass p-20 text-center border-none rounded-[60px] shadow-2xl shadow-black/[0.03]"
        >
          <div className="w-24 h-24 bg-black/[0.03] rounded-[44px] flex items-center justify-center text-black/5 mx-auto mb-8">
             <Bell weight="fill" size={48} />
          </div>
          <h3 className="text-2xl font-[1000] text-black/20 tracking-tighter uppercase mb-2">Cero Alertas</h3>
          <p className="text-[14px] font-[800] text-black/10 max-w-xs mx-auto uppercase">
            Su nodo de usuario se encuentra sincronizado con la matriz.
          </p>
        </motion.div>
      ) : (
        <div className="ios-glass border-none rounded-[44px] shadow-2xl shadow-black/[0.03] overflow-hidden divide-y divide-black/[0.02]">
          <AnimatePresence>
            {notifs.map((notif, idx) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handleMarcarUna(notif.id, notif.leida)}
                className={cn(
                  "p-8 sm:p-10 transition-all relative flex gap-8 cursor-pointer group",
                  notif.leida ? "bg-white/40 hover:bg-white/60" : "bg-ios-blue/[0.03] hover:bg-ios-blue/[0.05]"
                )}
              >
                {!notif.leida && (
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-ios-blue rounded-r-2xl" />
                )}
                
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all shadow-inner",
                  notif.leida ? "bg-black/[0.03] text-black/10" : "bg-ios-blue text-white shadow-lg shadow-ios-blue/20"
                )}>
                  <Info weight="fill" size={28} />
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                     <h3 className={cn(
                       "text-[17px] font-[1000] tracking-tight uppercase leading-none",
                       notif.leida ? "text-black/40" : "text-black"
                     )}>
                       {notif.titulo}
                     </h3>
                     {!notif.leida && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-ios-blue/10 text-ios-blue rounded-full">
                           <div className="w-1.5 h-1.5 bg-ios-blue rounded-full animate-pulse" />
                           <span className="text-[9px] font-[1000] uppercase tracking-widest">Live</span>
                        </div>
                     )}
                  </div>
                  <p className={cn(
                    "text-[15px] font-[800] leading-snug max-w-2xl",
                    notif.leida ? "text-black/30" : "text-black/60"
                  )}>
                    {notif.mensaje}
                  </p>
                  <div className="pt-2 flex items-center gap-6">
                    <div className="flex items-center gap-2 text-[11px] font-black text-black/10 uppercase tracking-widest">
                       <CaretRight weight="bold" size={12} />
                       {new Date(notif.created_at).toLocaleString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                  <div className="w-12 h-12 bg-black text-white rounded-[18px] flex items-center justify-center shadow-xl active:scale-90 transition-transform">
                    <Eye weight="fill" size={20} />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

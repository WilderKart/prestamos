"use client";

import { marcarTodasComoLeidas, marcarComoLeida } from "./actions";
import { Check, CheckCircle2, Bell, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient } from "@/utils/supabase/client";

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
    // Optimistic Update
    setNotifs((prev) => prev.map(n => ({...n, leida: true})));
    await marcarTodasComoLeidas();
    setIsPending(false);
  };

  const handleMarcarUna = async (id: string, leida: boolean) => {
    if (leida) return;
    // Optimistic Update
    setNotifs((prev) => prev.map(n => n.id === id ? {...n, leida: true} : n));
    await marcarComoLeida(id);
  };

  const hasUnread = notifs.some(n => !n.leida);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
          Tus alertas
        </h2>
        {hasUnread && (
          <button
            onClick={handleMarcarTodas}
            disabled={isPending}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            Marcar todas como leídas
          </button>
        )}
      </div>

      {notifs.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <Bell className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-900 font-medium">Cero notificaciones</p>
          <p className="text-gray-500 text-sm mt-1">Aquí verás reflejados los avisos sobre tus pagos y retanqueos.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
          {notifs.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleMarcarUna(notif.id, notif.leida)}
              className={cn(
                "p-4 sm:p-6 transition-all relative flex gap-4 cursor-pointer",
                notif.leida ? "bg-white hover:bg-gray-50 opacity-70" : "bg-blue-50/50 hover:bg-blue-50"
              )}
            >
              {!notif.leida && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full" />
              )}
              
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                notif.leida ? "bg-gray-100 text-gray-400" : "bg-blue-100 text-blue-600"
              )}>
                <Info className="w-5 h-5" />
              </div>

              <div className="flex-1">
                <h3 className={cn(
                  "text-sm font-bold",
                  notif.leida ? "text-gray-700" : "text-gray-900"
                )}>
                  {notif.titulo}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{notif.mensaje}</p>
                <div className="mt-2 text-xs text-gray-400 flex items-center gap-2">
                  <span>{new Date(notif.created_at).toLocaleString()}</span>
                  {!notif.leida && (
                     <span className="flex items-center text-blue-600 font-medium">
                       <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-1.5"></span>
                       Nueva
                     </span>
                  )}
                </div>
              </div>

              {!notif.leida && (
                 <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors" title="Marcar como leída">
                     <Check className="w-4 h-4" />
                   </button>
                 </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

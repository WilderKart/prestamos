"use client";

import { useEffect } from "react";
import { useNotificationStore } from "@/store/useNotificationStore";
import { createClient } from "@/utils/supabase/client";
import NotificationItem from "./NotificationItem";
import { markAllNotificationsReadAction } from "@/app/actions/notifications";
import { CheckCircle, BellSlash, CircleNotch } from "@phosphor-icons/react";
import { motion } from "framer-motion";

export default function NotificationPanel({ 
  onClose,
  empresaId 
}: { 
  onClose: () => void;
  empresaId: string;
}) {
  const { notifications, setNotifications, addNotification, markAllAsRead, loading, setLoading } = useNotificationStore();
  const supabase = createClient();

  useEffect(() => {
    fetchNotifications();

    // ⚡ REALTIME: Suscripción Táctica con Manejo de Errores
    const channel = supabase
      .channel("notifications_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notificaciones",
          filter: `empresa_id=eq.${empresaId}`, // 🔐 Defensa en profundidad
        },
        (payload) => {
          console.log("Nueva notificación recibida:", payload.new);
          addNotification(payload.new as any);
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error("Fallo en sincronización Realtime");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("notificaciones")
      .select("*")
      .eq("user_id", user.id)
      .eq("empresa_id", empresaId) // 🔐 Defensa en profundidad
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) {
      setNotifications(data);
    }
    setLoading(false);
  }

  const handleMarkAllRead = async () => {
    markAllAsRead();
    await markAllNotificationsReadAction();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      className="fixed inset-x-4 md:absolute md:inset-auto md:right-0 top-20 md:top-16 md:w-[360px] max-h-[500px] bg-white rounded-[32px] shadow-2xl shadow-black/20 border border-black/[0.03] overflow-hidden z-[110] flex flex-col"
    >
      <div className="p-6 bg-black/[0.02] flex items-center justify-between border-b border-black/[0.03]">
        <h3 className="text-[13px] font-black text-black/20 uppercase tracking-[0.2em]">Bandeja de Entrada</h3>
        {notifications.some(n => !n.leida) && (
          <button 
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 text-ios-blue text-[11px] font-black uppercase tracking-widest active:scale-95 transition-all"
          >
            <CheckCircle weight="bold" size={14} />
            Marcar Todo
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {loading && notifications.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-black/10 gap-4">
             <CircleNotch className="animate-spin" size={32} weight="bold" />
             <p className="text-[10px] font-black uppercase tracking-widest">Sincronizando Nodo...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-black/5 gap-6">
             <div className="w-16 h-16 bg-black/[0.02] rounded-3xl flex items-center justify-center">
               <BellSlash weight="fill" size={32} />
             </div>
              <div className="text-center">
                <p className="text-[14px] font-[1000] text-black/40 uppercase">¡Todo al día por aquí!</p>
                <p className="text-[10px] font-bold text-black/10 uppercase tracking-tighter mt-1">No hay alertas pendientes</p>
              </div>
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationItem 
              key={n.id} 
              notification={n} 
              onClose={onClose} 
            />
          ))
        )}
      </div>

      <div className="p-4 bg-black/[0.01] border-t border-black/[0.02] text-center">
         <p className="text-[9px] font-black text-black/15 uppercase tracking-[0.3em]">Protocolo Mivank v1.5.0</p>
      </div>
    </motion.div>
  );
}

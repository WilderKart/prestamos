"use client";

import { useNotificationStore, Notification } from "@/store/useNotificationStore";
import { markNotificationReadAction } from "@/app/actions/notifications";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { 
  RocketLaunch, 
  Receipt, 
  WarningCircle, 
  Circle 
} from "@phosphor-icons/react";

const notificationRoutes: Record<string, string> = {
  RUTA_ASIGNADA: "/cobrador/mision",
  PAGO_REGISTRADO: "/capitan/pagos",
  ALERTA_MORA: "/capitan/clientes",
};

const notificationIcons: Record<string, any> = {
  RUTA_ASIGNADA: RocketLaunch,
  PAGO_REGISTRADO: Receipt,
  ALERTA_MORA: WarningCircle,
};

export default function NotificationItem({ 
  notification, 
  onClose 
}: { 
  notification: Notification; 
  onClose: () => void; 
}) {
  const router = useRouter();
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  
  const Icon = notificationIcons[notification.tipo] || WarningCircle;

  const handleClick = async () => {
    // 1. Marcar como leída en DB y Store
    if (!notification.leida) {
      markAsRead(notification.id);
      await markNotificationReadAction(notification.id);
    }

    // 2. Cerrar panel
    onClose();

    // 3. Navegar según tipo
    const route = notificationRoutes[notification.tipo];
    if (route) {
      router.push(route);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`p-4 rounded-2xl cursor-pointer transition-all active:scale-[0.98] flex gap-4 items-start ${
        !notification.leida ? "bg-ios-blue/[0.04] border border-ios-blue/10" : "hover:bg-black/[0.02]"
      }`}
    >
      <div className={`p-2 rounded-xl shrink-0 ${
        !notification.leida ? "bg-ios-blue text-white shadow-lg shadow-ios-blue/20" : "bg-black/5 text-black/40"
      }`}>
        <Icon weight="fill" size={20} />
      </div>
      
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex justify-between items-start">
          <p className={`text-[14px] leading-tight truncate ${!notification.leida ? "font-[1000] text-black" : "font-bold text-black/50"}`}>
            {notification.titulo}
          </p>
          {!notification.leida && (
            <div className="w-2 h-2 rounded-full bg-ios-pink shrink-0 mt-1" />
          )}
        </div>
        <p className="text-[12px] font-bold text-black/40 leading-tight line-clamp-2">
          {notification.descripcion}
        </p>
        <p className="text-[9px] font-black text-black/20 uppercase tracking-widest pt-1">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: es })}
        </p>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function ClientSidebar({ navLinks, initialCount }: { navLinks: any[], initialCount: number }) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(initialCount);
  const supabase = createClient();

  useEffect(() => {
    // Escuchamos inserciones (aumenta count) o updates (si se marcaron como leidas, recalcular/restar)
    // En realidad lo mas facil es escuchar INSERT: +1 y escuchar UPDATE: si change.leida === true, count-- o lo re-calculamos.
    // Para simplificar: solo +1 en INSERT. El click para marcar leído se puede refetch o optimistic
    const channel = supabase.channel('notifs_badge')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notificaciones' }, () => {
        setUnreadCount(prev => prev + 1);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notificaciones' }, (payload) => {
        if (payload.new.leida === true && payload.old.leida === false) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Si abrimos la pagina de notificaciones, idealmente un hook para vaciar, 
  // pero el update arriba captura los optimistic db updates.
  return (
    <nav className="flex-1 px-4 space-y-1">
      {navLinks.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        
        let displayBadge = 0;
        if (link.label === "Notificaciones") {
           displayBadge = unreadCount;
        }

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all group ${
              isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-blue-600"}`} />
              {link.label}
            </div>
            {displayBadge > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {displayBadge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

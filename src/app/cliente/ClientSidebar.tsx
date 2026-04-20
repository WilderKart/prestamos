"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";

export default function ClientSidebar({ navLinks, initialCount }: { navLinks: any[], initialCount: number }) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(initialCount);
  const supabase = createClient();

  useEffect(() => {
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

  return (
    <nav className="space-y-2">
      {navLinks.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        
        let displayBadge = 0;
        if (link.label === "Alertas") {
           displayBadge = unreadCount;
        }

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center justify-between px-5 py-4 text-[13px] font-black uppercase tracking-widest rounded-2xl transition-all group relative ${
              isActive 
              ? "text-ios-blue bg-ios-blue/5" 
              : "text-black/30 hover:text-black hover:bg-black/[0.02]"
            }`}
          >
            <div className="flex items-center gap-4 relative z-10">
              <Icon 
                weight={isActive ? "fill" : "bold"} 
                size={22} 
                className={`transition-colors ${isActive ? "text-ios-blue" : "text-black/10 group-hover:text-black/30"}`} 
              />
              <span className={isActive ? "tracking-tighter" : ""}>{link.label}</span>
            </div>
            
            {displayBadge > 0 && (
              <span className="bg-ios-pink text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-ios-pink/20 relative z-10 uppercase tracking-tighter">
                {displayBadge} NEW
              </span>
            )}

            {isActive && (
              <motion.div 
                layoutId="sidebar-pill"
                className="absolute inset-0 bg-ios-blue/[0.03] border-r-[3px] border-ios-blue rounded-2xl"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

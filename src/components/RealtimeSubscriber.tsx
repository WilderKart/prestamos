"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "react-hot-toast";

export default function RealtimeSubscriber({ role }: { role: "ADMIN" | "CAPITAN" | "CLIENTE" }) {
  const supabase = createClient();

  useEffect(() => {
    const channelName = `realtime_${role.toLowerCase()}_global`;
    const channel = supabase.channel(channelName);

    if (role === "CLIENTE") {
      channel
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notificaciones" },
          (payload) => {
            toast('Nueva notificación', { icon: '🔔' });
          }
        );
    } 

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`📡 Suscrito a Toasts Globales como ${role}`);
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [role, supabase]);

  return null;
}

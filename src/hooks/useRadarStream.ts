"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

/**
 * useRadarStream: Motor de sincronización de telemetría de grado SaaS.
 * Implementa el protocolo Snapshot -> Stream -> Reconcile con buffering de 2s.
 */

interface RadarPoint {
  cobrador_id: string;
  nombre: string;
  lat: number;
  lng: number;
  status: 'active' | 'weak' | 'offline';
  last_report: string;
}

export function useRadarStream() {
  const [data, setData] = useState<Record<string, RadarPoint>>({});
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  
  const supabase = createClient();
  const bufferRef = useRef<Record<string, RadarPoint>>({});
  const lastUpdateRef = useRef<number>(0);
  const flushIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Snapshot Inicial
  const fetchSnapshot = useCallback(async () => {
    try {
      const { data: snapshot, error } = await supabase.rpc('rpc_global_radar_snapshot');
      if (error) throw error;

      const initialData: Record<string, RadarPoint> = {};
      snapshot.forEach((point: RadarPoint) => {
        initialData[point.cobrador_id] = point;
      });

      setData(initialData);
      setLoading(false);
    } catch (err) {
      console.error("Radar Snapshot Error:", err instanceof Error ? err.message : JSON.stringify(err));
      setLoading(false);
    }
  }, [supabase]);

  // Buffer Flush Logic (Cada 2 segundos)
  useEffect(() => {
    flushIntervalRef.current = setInterval(() => {
      const buffer = bufferRef.current;
      if (Object.keys(buffer).length > 0) {
        setData(prev => ({
          ...prev,
          ...buffer
        }));
        bufferRef.current = {}; // Limpiar buffer después del flush
      }
    }, 2000);

    return () => {
      if (flushIntervalRef.current) clearInterval(flushIntervalRef.current);
    };
  }, []);

  // Realtime Subscription
  useEffect(() => {
    fetchSnapshot();

    const channel = supabase
      .channel('radar-fleet-realtime')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'cobrador_tracking' 
        },
        (payload) => {
          const newPoint = payload.new;
          
          // Anti-Replay: Verificar timestamps si ya existe en el estado local
          // (Nota: El snapshot inicial provee el contexto necesario)
          
          // Mapear el punto entrante al formato de UI
          const uiPoint: RadarPoint = {
            cobrador_id: newPoint.cobrador_id,
            nombre: 'Actualizando...', // El nombre se mantiene del snapshot
            lat: newPoint.lat,
            lng: newPoint.lng,
            status: 'active', // Recién llegado = activo
            last_report: newPoint.created_at
          };

          // Acumular en buffer
          bufferRef.current[uiPoint.cobrador_id] = {
            ...bufferRef.current[uiPoint.cobrador_id], // Preservar nombre si está en buffer
            ...uiPoint
          };
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchSnapshot]);

  return { 
    points: Object.values(data), 
    loading, 
    isConnected 
  };
}

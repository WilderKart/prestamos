"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import LogisticsMap from "@/components/ui/LogisticsMap";
import { 
  Users, 
  NavigationArrow, 
  CircleNotch, 
  WarningCircle, 
  ShieldCheck,
  ArrowRight
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

interface CollectorState {
  cobrador_id: string;
  lat: number;
  lng: number;
  created_at: string;
  nombre: string;
  isStale?: boolean;
  isOffline?: boolean;
}

export default function GlobalRadarClient({ empresaId }: { empresaId: string }) {
  const [markers, setMarkers] = useState<CollectorState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  
  // Referencia para evitar cierres de scope en el callback de realtime
  const markersRef = useRef<CollectorState[]>([]);

  const loadInitial = async () => {
    try {
      const { data, error: rpcError } = await supabase.rpc("get_latest_tracking_for_company");
      if (rpcError) throw rpcError;
      
      const initialMarkers = (data || []).map((m: any) => ({
        ...m,
        ...calculateStatus(m.created_at)
      }));

      setMarkers(initialMarkers);
      markersRef.current = initialMarkers;
    } catch (err: any) {
      console.error("Error loading global radar:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatus = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = diff / 1000 / 60;
    return {
      isStale: mins > 5,
      isOffline: mins > 15
    };
  };

  const updateMarker = (point: any) => {
    setMarkers((prev) => {
      const map = new Map(prev.map((m) => [m.cobrador_id, m]));
      const existing = map.get(point.cobrador_id);

      // Control Anti-Replay: Ignorar si el evento es más antiguo que el estado actual
      if (existing && new Date(existing.created_at) > new Date(point.created_at)) {
        return prev;
      }

      const updated = {
        ...(existing || {}),
        ...point,
        ...calculateStatus(point.created_at),
        // Si no tenemos el nombre en el evento realtime, lo buscamos en el estado existente
        nombre: point.nombre || existing?.nombre || "Cobrador"
      };

      map.set(point.cobrador_id, updated);
      const newMarkers = Array.from(map.values());
      markersRef.current = newMarkers;
      return newMarkers;
    });
  };

  useEffect(() => {
    loadInitial();

    // Suscripción Realtime Hardened con Filtro de Empresa
    const channel = supabase
      .channel(`global-radar-${empresaId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "cobrador_tracking",
          filter: `empresa_id=eq.${empresaId}`,
        },
        (payload) => {
          updateMarker(payload.new);
        }
      )
      // Escuchar reconexiones del sistema
      .on("system", { event: "reconnect" } as any, () => {
        console.log("Realtime reconnected. Resyncing fleet...");
        loadInitial();
      })
      .subscribe();

    // Intervalo para actualizar estados visuales (Activo -> Débil -> Offline) cada minuto
    const statusInterval = setInterval(() => {
      setMarkers(prev => prev.map(m => ({
        ...m,
        ...calculateStatus(m.created_at)
      })));
    }, 60000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(statusInterval);
    };
  }, [empresaId]);

  const handleCollectorClick = async (collector: CollectorState) => {
    try {
      const { data: routeId, error: routeError } = await supabase.rpc(
        "get_active_route_for_collector",
        { cobrador: collector.cobrador_id }
      );

      if (routeError) throw routeError;

      if (routeId) {
        router.push(`/capitan/rutas/${routeId}`);
      } else {
        alert(`El cobrador ${collector.nombre} no tiene una ruta activa asignada para el día de hoy.`);
      }
    } catch (err) {
      console.error("Error fetching active route:", err);
      alert("Error al intentar conectar con la ruta táctica.");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <CircleNotch className="w-12 h-12 text-ios-blue animate-spin" />
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20">Iniciando Radar Táctico...</span>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
      <WarningCircle className="w-12 h-12 text-ios-pink" />
      <p className="text-sm font-bold text-black/40 uppercase tracking-tighter">Fallo en la Secuencia de Radar</p>
      <button onClick={() => window.location.reload()} className="px-6 py-3 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Reintentar Sincronización</button>
    </div>
  );

  const activeCount = markers.filter(m => !m.isOffline).length;

  return (
    <div className="relative w-full h-full rounded-[44px] overflow-hidden border border-black/[0.03] shadow-2xl">
      {/* Mapa Táctico */}
      <div className="absolute inset-0">
        <LogisticsMap 
          points={[]} // Sin destinos para mapa operativo global
          showPath={false}
          collectorPos={undefined} // No usamos prop única, sino marcadores múltiples abajo
          customMarkers={markers.map(m => ({
            lat: m.lat,
            lng: m.lng,
            label: m.nombre,
            status: m.isOffline ? 'offline' : (m.isStale ? 'weak' : 'active'),
            onClick: () => handleCollectorClick(m)
          }))}
        />
      </div>

      {/* Overlay: Fleet Health Stats */}
      <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-2">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/80 backdrop-blur-xl px-5 py-3 rounded-[24px] shadow-xl border border-white/20 flex items-center gap-4"
        >
          <div className="w-10 h-10 bg-ios-blue text-white rounded-2xl flex items-center justify-center shadow-lg shadow-ios-blue/20">
            <NavigationArrow weight="fill" size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-black/20 uppercase tracking-widest leading-none mb-1">Cobradores en Misión</p>
            <p className="text-xl font-black text-black leading-none">{activeCount} <span className="text-[13px] text-black/20">/ {markers.length}</span></p>
          </div>
        </motion.div>

        <div className="flex gap-2">
           <StatusPill color="bg-ios-green" label="Activos" count={markers.filter(m => !m.isStale && !m.isOffline).length} />
           <StatusPill color="bg-ios-yellow" label="Señal Débil" count={markers.filter(m => m.isStale && !m.isOffline).length} />
           <StatusPill color="bg-black/10" label="Offline" count={markers.filter(m => m.isOffline).length} />
        </div>
      </div>

      {/* Footer Industrial */}
      <div className="absolute bottom-6 right-6 z-[1000]">
        <div className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full shadow-2xl">
           <ShieldCheck weight="fill" size={14} className="text-ios-green" />
           <span className="text-[9px] font-black uppercase tracking-[0.2em]">Zero Trust Verified</span>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ color, label, count }: { color: string, label: string, count: number }) {
  if (count === 0) return null;
  return (
    <div className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-2 shadow-sm">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-[9px] font-black uppercase tracking-wider text-black/40">{count} {label}</span>
    </div>
  );
}

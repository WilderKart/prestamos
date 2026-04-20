"use client";

import { useRadarStream } from "@/hooks/useRadarStream";
import GlobalRadarMap from "@/components/maps/GlobalRadarMap";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { MapTrifold, Users, WifiHigh, WifiSlash } from "@phosphor-icons/react";

/**
 * GlobalRadarClient: Integrador operativo del Radar Global.
 * Orquesta la telemetría, el mapa estratégico y la navegación táctica.
 */

export default function GlobalRadarClient() {
  const { points, loading, isConnected } = useRadarStream();
  const router = useRouter();
  const supabase = createClient();

  const handleMarkerClick = async (cobradorId: string) => {
    try {
      // Resolver la ruta activa hoy para este cobrador usando la RPC segura V5.7
      const { data: routeId, error } = await supabase.rpc('get_active_route_for_collector', {
        cobrador: cobradorId
      });

      if (error || !routeId) {
        alert("El cobrador no tiene una misión activa asignada para hoy.");
        return;
      }

      // Navegar a la vista táctica
      router.push(`/capitan/rutas/${routeId}`);
    } catch (err) {
      console.error("Navigation Error:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-ios-blue border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-widest text-black/40 animate-pulse">
          Sincronizando Radar de Flota...
        </p>
      </div>
    );
  }

  // Agrupar contadores de salud
  const stats = {
    active: points.filter(p => p.status === 'active').length,
    weak: points.filter(p => p.status === 'weak').length,
    offline: points.filter(p => p.status === 'offline').length,
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header Táctico / Resumen de Salud */}
      <div className="flex items-center justify-between bg-white p-4 rounded-[24px] shadow-sm border border-black/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
            <MapTrifold size={20} weight="fill" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-tight">Radar Global Operativo</h2>
            <div className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-ios-green' : 'bg-ios-red animate-pulse'}`}></div>
               <span className="text-[9px] font-bold text-black/40 uppercase tracking-widest">
                 {isConnected ? 'Sincronizado' : 'Reconectando...'}
               </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <StatBadge count={stats.active} label="Activos" color="bg-ios-green" icon={<WifiHigh size={12} weight="bold" />} />
          <StatBadge count={stats.weak} label="Críticos" color="bg-ios-yellow" icon={<WifiHigh size={12} weight="bold" />} />
          <StatBadge count={stats.offline} label="Offline" color="bg-black/20" icon={<WifiSlash size={12} weight="bold" />} />
          <div className="h-8 w-px bg-black/5 mx-2"></div>
          <div className="flex flex-col items-end">
            <span className="text-[14px] font-black text-black leading-none">{points.length}</span>
            <span className="text-[8px] font-bold text-black/40 uppercase tracking-widest">Total Flota</span>
          </div>
        </div>
      </div>

      {/* Mapa Principal */}
      <div className="flex-1 min-h-[500px] relative rounded-[32px] overflow-hidden shadow-2xl border border-white">
          <GlobalRadarMap 
            markers={points.map(p => ({
              ...p,
              onClick: () => handleMarkerClick(p.cobrador_id)
            }))} 
          />
          
          {/* Overlay de Ayuda Inline */}
          <div className="absolute bottom-6 left-6 right-6 bg-black/80 backdrop-blur-md text-white p-4 rounded-2xl flex items-center justify-between z-[1000] border border-white/10 pointer-events-none">
             <p className="text-[9px] font-medium uppercase tracking-[0.2em] opacity-80">
               Click en marcador para navegación táctica a la ruta del día
             </p>
             <div className="flex items-center gap-2">
                 <Users size={14} />
                 <span className="text-[10px] font-black">{points.length} COBRADORES EN MISIÓN</span>
             </div>
          </div>
      </div>
    </div>
  );
}

function StatBadge({ count, label, color, icon }: { count: number, label: string, color: string, icon: any }) {
  return (
    <div className="flex items-center gap-2 bg-black/5 px-3 py-1.5 rounded-full">
      <div className={`w-5 h-5 ${color} rounded-lg flex items-center justify-center text-white shadow-sm`}>
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black leading-none">{count}</span>
        <span className="text-[7px] font-bold text-black/40 uppercase tracking-widest">{label}</span>
      </div>
    </div>
  );
}

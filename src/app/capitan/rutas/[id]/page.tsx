"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  MapPin, 
  User, 
  CheckCircle, 
  Clock, 
  Phone,
  DotsThreeVertical,
  NavigationArrow,
  WarningCircle
} from "@phosphor-icons/react";
import { createClient } from "@/utils/supabase/client";
import { updateVisitasOrderAction } from "@/app/actions/routes";
import dynamic from "next/dynamic";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/utils/format";
import { toast } from "react-hot-toast";
import { Motorbike, Activity } from "@phosphor-icons/react";

// Importar mapa dinámicamente para evitar SSR issues con Leaflet
const LogisticsMap = dynamic(() => import("@/components/ui/LogisticsMap"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-black/5 animate-pulse rounded-[32px]" />
});

export default function DetalleRutaPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ruta, setRuta] = useState<any>(null);
  const [visitas, setVisitas] = useState<any[]>([]);
  const [collectorPos, setCollectorPos] = useState<{ lat: number; lng: number } | null>(null);
  const [trackingHistory, setTrackingHistory] = useState<{ lat: number; lng: number }[]>([]);

  const supabase = createClient();

  useEffect(() => {
    fetchDetalleRuta();
  }, [id]);

  useEffect(() => {
    if (!ruta?.cobrador_id) return;

    // 1. Cargar historial del día (Breadcrumbs)
    const fetchHistory = async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from("cobrador_tracking")
        .select("lat, lng, created_at")
        .eq("cobrador_id", ruta.cobrador_id)
        .gte("created_at", today)
        .order("created_at", { ascending: true });
      
      if (data) setTrackingHistory(data);
    };

    fetchHistory();

    // 2. Suscripción en Tiempo Real (Live Tracking)
    const channel = supabase
      .channel(`tracking_${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "cobrador_tracking",
          filter: `cobrador_id=eq.${ruta.cobrador_id}`,
        },
        (payload: any) => {
          const newPos = { lat: payload.new.lat, lng: payload.new.lng };
          setCollectorPos(newPos);
          setTrackingHistory(prev => [...prev, newPos]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, ruta?.cobrador_id]);

  async function fetchDetalleRuta() {
    try {
      const { data: rutaData, error: rError } = await supabase
        .from("rutas")
        .select(`
          *,
          usuarios!rutas_cobrador_id_fkey(nombre, telefono)
        `)
        .eq("id", id)
        .single();

      if (rError) throw rError;
      setRuta(rutaData);

      const { data: visitasData, error: vError } = await supabase
        .from("visitas")
        .select(`
          *,
          clientes(
            id,
            lat,
            lng,
            direccion,
            barrio,
            usuarios!clientes_usuario_id_fkey(nombre),
            prestamos(id, valor_cuota, saldo_actual)
          )
        `)
        .eq("ruta_id", id)
        .order("orden", { ascending: true });

      if (vError) throw vError;
      setVisitas(visitasData || []);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleReorder = async (newOrder: any[]) => {
    // Optimistic Update
    const updatedVisitas = newOrder.map((v, idx) => ({ ...v, orden: idx + 1 }));
    setVisitas(updatedVisitas);

    // Persist
    const { success } = await updateVisitasOrderAction(
      updatedVisitas.map(v => ({ id: v.id, orden: v.orden }))
    );

    if (success) {
      toast.success("Secuencia de cobro sincronizada", {
        style: {
          background: "black",
          color: "white",
          borderRadius: "16px",
          fontSize: "11px",
          fontWeight: "black",
          textTransform: "uppercase",
          letterSpacing: "0.1em"
        }
      });
    }
  };

  const visitasConGeo = visitas.filter(v => v.clientes?.lat && v.clientes?.lng);
  const visitasSinGeo = visitas.filter(v => !v.clientes?.lat || !v.clientes?.lng);

  const mapPoints = visitasConGeo.map(v => ({
    lat: v.clientes?.lat,
    lng: v.clientes?.lng,
    label: (v.clientes?.usuarios as any)?.nombre,
    isCompleted: v.estado === 'completado'
  }));

  if (loading) return (
    <div className="min-h-screen bg-ios-bg flex items-center justify-center">
       <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-ios-blue border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[10px] font-black uppercase tracking-widest text-black/20">Sincronizando Inteligencia de Campo...</p>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ios-bg pb-24 lg:flex lg:h-screen lg:overflow-hidden">
      {/* Mobile Header / Panel Izquierdo Desktop */}
      <div className="lg:w-[450px] lg:flex lg:flex-col lg:border-r lg:border-black/5">
        <header className="sticky top-0 z-30 bg-ios-bg/80 backdrop-blur-xl border-b border-black/5 px-6 pt-12 pb-6">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => router.back()} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-all">
               <ArrowLeft weight="bold" />
            </button>
            <h1 className="text-2xl font-[1000] text-black tracking-tight leading-none italic">
              Hoja de <span className="text-ios-blue">Ruta</span>
            </h1>
          </div>

          <div className="ios-glass p-4 rounded-3xl border-none shadow-sm flex items-center gap-4">
             <div className="w-12 h-12 bg-ios-blue/10 rounded-2xl flex items-center justify-center text-ios-blue">
                <User weight="fill" size={24} />
             </div>
             <div>
                <p className="text-[10px] font-black text-ios-gray/40 uppercase tracking-widest">Cobrador en Misión</p>
                <h3 className="font-bold text-black">{ruta?.usuarios?.nombre}</h3>
             </div>
             <a href={`tel:${ruta?.usuarios?.telefono}`} className="ml-auto w-10 h-10 bg-ios-blue text-white rounded-full flex items-center justify-center shadow-lg shadow-ios-blue/20">
                <Phone weight="fill" />
             </a>
          </div>
        </header>

        <main className="px-6 py-6 overflow-y-auto lg:flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xs font-black text-ios-gray/30 uppercase tracking-[0.3em]">
              Secuencia de Visitas ({visitas.length})
            </h2>
            <div className="px-3 py-1 bg-ios-blue/10 rounded-full text-[10px] font-black text-ios-blue uppercase tracking-widest">
              Prioridad IA
            </div>
          </div>

          <div className="space-y-4">
            <Reorder.Group axis="y" values={visitas} onReorder={handleReorder} className="space-y-4">
              <AnimatePresence>
                {visitas.map((visita, idx) => {
                  const cli = visita.clientes;
                  const usr = cli?.usuarios as any;
                  const completed = visita.estado === 'completado';

                  return (
                    <Reorder.Item
                      key={visita.id}
                      value={visita}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className={`ios-glass p-5 rounded-[32px] border-none shadow-lg relative overflow-hidden transition-all group ${completed ? 'bg-ios-green/5' : 'bg-white'}`}
                    >
                      <div className="flex gap-4">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black shrink-0 ${completed ? 'bg-ios-green text-white shadow-lg shadow-ios-green/20' : 'bg-black text-white shadow-lg shadow-black/20'}`}>
                          {visita.orden}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start">
                            <h4 className={`text-lg font-[1000] tracking-tight leading-none italic ${completed ? 'text-ios-green' : 'text-black'}`}>
                              {usr?.nombre}
                            </h4>
                            <div className="cursor-grab active:cursor-grabbing p-1 opacity-10 group-hover:opacity-100 transition-opacity">
                               <DotsThreeVertical weight="bold" size={20} />
                            </div>
                          </div>
                          <p className="text-[11px] font-bold text-ios-gray/40 uppercase tracking-widest line-clamp-1">
                             {cli?.direccion} • {cli?.barrio}
                          </p>
                          
                          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-black/5">
                             <div className="space-y-0.5">
                                <p className="text-[9px] font-black text-ios-gray/30 uppercase tracking-widest">Cuota</p>
                                <p className="text-sm font-[1000] text-black">
                                   {formatCurrency((cli?.prestamos as any)?.[0]?.valor_cuota || 0)}
                                </p>
                             </div>
                             <div className="ml-auto flex items-center gap-2">
                                {completed ? (
                                  <div className="flex items-center gap-1.5 px-3 py-1 bg-ios-green/10 rounded-full text-[10px] font-black text-ios-green uppercase tracking-widest">
                                     <CheckCircle weight="fill" size={14} /> Completado
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 px-3 py-1 bg-black/5 rounded-full text-[10px] font-black text-ios-gray/40 uppercase tracking-widest">
                                     <Clock weight="fill" size={14} /> Pendiente
                                  </div>
                                )}
                             </div>
                          </div>
                        </div>
                      </div>
                    </Reorder.Item>
                  );
                })}
              </AnimatePresence>
            </Reorder.Group>
          </div>

          {/* Sección de Advertencia: Clientes sin Ubicación */}
          {visitasSinGeo.length > 0 && (
            <div className="mt-12 space-y-6 animate-fade-up">
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-ios-pink animate-pulse" />
                 <h2 className="text-[10px] font-black text-ios-pink uppercase tracking-[0.3em]">
                    Pendientes de Posicionamiento ({visitasSinGeo.length})
                 </h2>
              </div>
              
              <div className="space-y-3">
                {visitasSinGeo.map((v) => (
                  <div key={v.id} className="ios-glass p-5 rounded-[32px] border-none shadow-sm opacity-60 flex justify-between items-center">
                    <div className="space-y-1">
                       <h5 className="font-bold text-black">{(v.clientes?.usuarios as any)?.nombre}</h5>
                       <p className="text-[10px] font-bold text-ios-gray/40 uppercase tracking-widest">Protocolo: Captura Manual Requerida</p>
                    </div>
                    <div className="w-10 h-10 bg-ios-pink/10 text-ios-pink rounded-full flex items-center justify-center">
                       <WarningCircle weight="fill" size={20} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <div className="hidden lg:block lg:flex-1 h-full p-6">
         <div className="w-full h-full rounded-[44px] overflow-hidden shadow-2xl border border-white relative">
            <LogisticsMap 
              points={mapPoints} 
              collectorPos={collectorPos || undefined}
              history={trackingHistory}
            />
            
            {/* Legend & Status Overlay */}
            <div className="absolute top-8 right-8 z-[1000] space-y-4">
               {collectorPos && (
                 <div className="bg-ios-blue text-white p-4 rounded-3xl shadow-2xl flex items-center gap-3 animate-fade-left">
                    <div className="relative">
                       <Activity weight="bold" className="animate-pulse" />
                       <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest">Señal en Vivo</p>
                       <p className="text-[9px] font-bold opacity-60 tracking-tight uppercase">Sincronizado vía Satélite</p>
                    </div>
                 </div>
               )}

               <div className="ios-glass p-6 rounded-[32px] shadow-2xl border-none space-y-4 min-w-[200px]">
                  <h5 className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em] mb-2">Monitor Táctico</h5>
                  <div className="space-y-3">
                     <div className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 rounded-full bg-black shadow-lg shadow-black/20" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-black/60">Pendientes</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 rounded-full bg-ios-green shadow-lg shadow-ios-green/20" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-black/60">Recaudados</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-full h-[2px] bg-orange-400 opacity-40 rounded-full" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-orange-400">Breadcrumbs</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
      
      {/* Mobile Floating Action Button to toggle map (Optional/Future) */}
      <div className="lg:hidden fixed bottom-10 right-10 z-[30] flex flex-col gap-4">
          <button className="w-16 h-16 bg-black text-white rounded-3xl flex items-center justify-center shadow-2xl active:scale-90 transition-all">
             <NavigationArrow weight="fill" size={28} />
          </button>
      </div>
    </div>
  );
}

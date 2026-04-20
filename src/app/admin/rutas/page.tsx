"use server";

import { createClient, requireAuth } from "@/utils/supabase/server";
import { 
  MapTrifold, 
  Plus, 
  MapPin, 
  UserCircle, 
  Calendar,
  CheckCircle,
  Clock,
  ArrowRight,
  ChartLineUp,
  WarningCircle,
  Path,
  Lightning,
  DotsThreeCircle,
  CaretRight
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { redirect } from "next/navigation";
import GenerateRoutesButton from "./GenerateRoutesButton";

export default async function AdminRutasPage() {
  const { userData: sessionUser, supabase } = await requireAuth("ADMIN");

  // Obtener rutas de hoy
  const { data: rutas, error } = await supabase
    .from("rutas")
    .select(`
      *,
      cobrador:usuarios!rutas_cobrador_id_fkey(nombre),
      visitas(id, estado)
    `)
    .eq("fecha", new Date().toISOString().split('T')[0])
    .order("created_at", { ascending: false });

  const totalVisitas = rutas?.reduce((acc, r) => acc + (r.visitas?.length || 0), 0) || 0;
  const visitasCompletadas = rutas?.reduce((acc, r) => acc + (r.visitas?.filter((v: any) => v.estado === 'completado').length || 0), 0) || 0;
  const visitasPendientes = totalVisitas - visitasCompletadas;

  return (
    <div className="space-y-12 animate-fade-up">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-ios-yellow text-black rounded-3xl flex items-center justify-center shadow-2xl shadow-ios-yellow/20 transform rotate-3 border-2 border-white">
              <Path weight="fill" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-[1000] text-black tracking-tighter leading-none">
                Logística de <span className="text-ios-blue">Rutas</span>
              </h1>
              <p className="text-[11px] font-black text-black/20 uppercase tracking-[0.4em] mt-1">
                Sincronización de Campo
              </p>
            </div>
          </div>
        </div>
        
        <GenerateRoutesButton />
      </div>

      {/* Stats Quick View - iOS Premium Style */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="ios-glass p-8 rounded-[40px] border-none shadow-2xl shadow-black/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
             <Path weight="fill" size={80} />
          </div>
          <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em] mb-1">Rutas Activas</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-[1000] text-black tracking-tighter">{rutas?.length || 0}</h3>
            <span className="text-[10px] font-black text-ios-blue uppercase tracking-widest">Iniciadas</span>
          </div>
        </div>

        <div className="ios-glass p-8 rounded-[40px] border-none shadow-2xl shadow-black/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
             <CheckCircle weight="fill" size={80} />
          </div>
          <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em] mb-1">Efectividad Total</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-[1000] text-ios-green tracking-tighter">
              {visitasCompletadas}
            </h3>
            <span className="text-[10px] font-black text-black/20 uppercase tracking-widest">Impactos</span>
          </div>
        </div>

        <div className="ios-glass p-8 rounded-[40px] border-none shadow-2xl shadow-black/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
             <Clock weight="fill" size={80} />
          </div>
          <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em] mb-1">Pendientes de Visita</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-[1000] text-ios-pink tracking-tighter">{visitasPendientes}</h3>
            <span className="text-[10px] font-black text-black/20 uppercase tracking-widest">Restantes</span>
          </div>
        </div>
      </div>

      {/* Active Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-[11px] font-black text-black/20 uppercase tracking-[0.4em]">Monitor de Despliegue Diario</h2>
          <div className="w-8 h-8 rounded-full bg-black/[0.03] flex items-center justify-center">
             <ChartLineUp weight="bold" size={14} className="text-black/20" />
          </div>
        </div>

        {!rutas || rutas.length === 0 ? (
          <div className="ios-glass border-dashed border-2 border-black/5 p-20 flex flex-col items-center justify-center text-center space-y-6 rounded-[50px]">
            <div className="w-24 h-24 bg-white rounded-[40px] flex items-center justify-center shadow-2xl transform rotate-6 border border-black/[0.02]">
              <MapTrifold weight="fill" size={48} className="text-black/5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-[1000] text-black tracking-tight">Sin Despliegue Activo</h3>
              <p className="text-[14px] font-bold text-black/30 max-w-sm mx-auto">
                No se han generado rutas para el ciclo actual. Inicie el algoritmo de asignación para comenzar.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rutas.map((ruta) => {
              const completado = ruta.visitas?.filter((v:any) => v.estado === 'completado').length || 0;
              const total = ruta.visitas?.length || 0;
              const porcentaje = total > 0 ? Math.round((completado / total) * 100) : 0;

              return (
                <div key={ruta.id} className="ios-glass border-none p-8 rounded-[44px] shadow-2xl shadow-black/5 group hover:bg-black/[0.01] transition-all relative overflow-hidden">
                  {/* Subtle Background Icon */}
                  <Path weight="fill" size={120} className="absolute -bottom-10 -right-10 text-black/[0.02] transform rotate-12 transition-transform group-hover:scale-110" />

                  <div className="relative z-10 space-y-8">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-black/[0.03] shadow-xl group-hover:border-ios-blue/20 transition-all">
                          <UserCircle weight="fill" size={32} className="text-black/10 group-hover:text-ios-blue" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em]">Operador en Campo</p>
                          <p className="text-[17px] font-[1000] text-black tracking-tight">{(ruta.cobrador as any)?.nombre || "Agente No ID"}</p>
                        </div>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-[9px] font-[1000] uppercase tracking-widest border border-white shadow-sm ${
                        ruta.estado === 'completado' ? 'bg-ios-green/10 text-ios-green' : 'bg-ios-yellow/10 text-black'
                      }`}>
                        {ruta.estado}
                      </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex justify-between items-end">
                          <div className="space-y-1">
                             <p className="text-[10px] font-black text-black/20 uppercase tracking-widest">Progreso de Ruta</p>
                             <p className="text-2xl font-[1000] text-black tracking-tight">{porcentaje}%</p>
                          </div>
                          <p className="text-[12px] font-black text-black/20">{completado}/{total} Visitas</p>
                       </div>
                       <div className="h-2 w-full bg-black/[0.03] rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${porcentaje}%` }}
                            className={`h-full rounded-full ${porcentaje === 100 ? 'bg-ios-green' : 'bg-ios-blue'}`}
                          />
                       </div>
                    </div>

                    <Link 
                      href={`/admin/rutas/${ruta.id}`}
                      className="flex items-center justify-center gap-3 w-full py-5 bg-black/[0.03] hover:bg-black hover:text-white rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-sm group/btn"
                    >
                      Auditores de Ruta
                      <CaretRight weight="bold" className="group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Advisory Insight */}
      <div className="ios-glass-alt p-8 rounded-[44px] border-none flex items-start gap-6 shadow-2xl shadow-black/5 bg-gradient-to-br from-white to-black/[0.01]">
        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-ios-blue shadow-xl border border-black/[0.02] shrink-0">
          <Lightning weight="fill" size={32} />
        </div>
        <div className="space-y-2 pt-1">
          <h4 className="text-[15px] font-[1000] text-black tracking-tight uppercase">Algoritmo de Asignación Inteligente</h4>
          <p className="text-[13px] font-semibold text-black/40 leading-relaxed italic">
            "El sistema balancea automáticamente los puntos de recaudo según proximidad y jerarquía de riesgo. Las rutas generadas son inmutables para el ciclo actual para garantizar la integridad del reporte diario."
          </p>
        </div>
      </div>
    </div>
  );
}

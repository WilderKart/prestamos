import { createClient, requireRole } from "@/utils/supabase/server";
import { 
  NavigationArrow, 
  MapPin, 
  Phone, 
  User, 
  CurrencyDollar, 
  Clock,
  LayoutDashboard,
  CheckCircle,
  CaretRight,
  House,
  Briefcase,
  ShieldCheck,
  WarningCircle,
  PaperPlaneTilt,
  CircleNotch
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { redirect } from "next/navigation";
import MissionClient from "./MissionClient";

export default async function CobradorMisionPage() {
  const session = await requireRole(["COBRADOR", "ADMIN"]);
  const supabase = await createClient();

  // 1. Obtener la ruta activa y el estado de misión del usuario (Zero Trust)
  const [{ data: ruta }, { data: userData }] = await Promise.all([
    supabase
      .from("rutas")
      .select("id, estado")
      .eq("cobrador_id", session.user.id)
      .eq("empresa_id", session.empresa_id)
      .eq("fecha", new Date().toISOString().split('T')[0])
      .eq("estado", "pendiente")
      .single(),
    supabase
      .from("usuarios")
      .select("estado_mision, empresa_id")
      .eq("id", session.user.id)
      .single()
  ]);

  if (!ruta) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] px-8 text-center space-y-10 animate-fade-up">
        <div className="relative">
           <div className="w-24 h-24 bg-black/[0.03] rounded-[44px] flex items-center justify-center text-black/5 animate-pulse">
              <NavigationArrow weight="fill" size={48} />
           </div>
           <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-ios-yellow rounded-2xl flex items-center justify-center text-black shadow-xl border-4 border-white">
              <Clock weight="fill" size={18} />
           </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-3xl font-[1000] text-black tracking-tighter uppercase leading-none">Cero Misiones</h2>
          <p className="text-[15px] font-bold text-black/40 leading-relaxed uppercase tracking-tight max-w-xs mx-auto">
            "Su nodo operativo se encuentra en estado de espera. Contacte a su Capitán para iniciar la secuencia de cobro diario."
          </p>
        </div>

        <Link 
          href="/dashboard"
          className="px-12 py-5 bg-black text-white rounded-[24px] font-[1000] text-[13px] uppercase tracking-[0.3em] shadow-2xl shadow-black/20 active:scale-95 transition-all"
        >
          Retornar al Inicio
        </Link>
      </div>
    );
  }

  // 2. Obtener TODAS las visitas de la ruta para la barra de progreso
  const { data: allVisitas } = await supabase
    .from("visitas")
    .select(`
      id,
      orden,
      estado,
      clientes:clientes!visitas_cliente_id_fkey (
        id,
        cedula,
        lat,
        lng,
        usuarios!clientes_usuario_id_fkey (nombre, telefono),
        prestamos (id, saldo_actual, valor_cuota)
      )
    `)
    .eq("ruta_id", ruta.id)
    .order("orden", { ascending: true });

  const currentVisita = allVisitas?.find(v => v.estado === "pendiente");

  if (!visita) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] px-8 text-center space-y-10 animate-fade-up">
        <div className="ios-glass p-16 rounded-[60px] text-center space-y-8 shadow-2xl shadow-ios-green/10 max-w-lg">
           <div className="w-32 h-32 bg-ios-green text-white rounded-[44px] flex items-center justify-center mx-auto shadow-2xl shadow-ios-green/30 transform -rotate-3 border-4 border-white">
              <CheckCircle weight="fill" size={64} />
           </div>
           <div className="space-y-4">
              <h3 className="text-3xl font-[1000] text-black tracking-tighter uppercase">Ruta Completada</h3>
              <p className="text-[15px] font-bold text-black/40 leading-relaxed uppercase tracking-tight">
                 "Excelente trabajo. Todos los nodos de la misión han sido visitados y sincronizados. Proceda al balance de cierre."
              </p>
           </div>
           <Link 
             href="/cobrador/cierre"
             className="w-full py-5 bg-black text-white rounded-[28px] font-black text-[13px] uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4"
           >
             Protocolo de Cierre
             <CaretRight weight="bold" size={20} />
           </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-up">
      {/* Header Premium */}
      <div className="flex justify-between items-center px-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20">Secuencia Activa</span>
             <div className="w-1.5 h-1.5 rounded-full bg-ios-yellow animate-pulse" />
          </div>
          <h1 className="text-4xl font-[1000] text-black tracking-tighter leading-none uppercase">
             Misión <span className="text-ios-blue">Actual</span>
          </h1>
          {currentVisita && (
            <p className="text-[11px] font-black text-black/20 uppercase tracking-[0.4em] mt-1">Visitando Objetivo #{currentVisita.orden}</p>
          )}
        </div>
        <div className="w-16 h-16 bg-black text-ios-yellow rounded-[26px] flex items-center justify-center shadow-2xl border-2 border-white/5 active:scale-90 transition-transform">
          <PaperPlaneTilt weight="fill" size={32} />
        </div>
      </div>

      <div className="space-y-10">
         <MissionClient 
            visita={currentVisita} 
            allVisitas={allVisitas || []}
            empresaId={session.empresa_id!} 
            estadoMision={userData?.estado_mision || 'INACTIVO'}
          />
      </div>

      {/* Advisory Footer */}
      <div className="ios-glass-alt p-8 rounded-[44px] border-none flex items-start gap-4 opacity-30 justify-center">
         <ShieldCheck weight="fill" size={20} />
         <span className="text-[10px] font-black uppercase tracking-[0.4em]">Sincronización GPS Zero Trust Activa — Tier 4 Security</span>
      </div>
    </div>
  );
}

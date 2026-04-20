import { requireAuth } from "@/utils/supabase/server";
import { formatCurrency } from "@/utils/format";
import { 
  CheckCircle, 
  XCircle, 
  UserPlus, 
  Clock, 
  WarningCircle, 
  CurrencyDollar,
  CaretRight,
  ShieldCheck,
  CalendarBlank,
  ChartBar,
  Funnel,
  IdentificationCard,
  CreditCard,
  Sparkle
} from "@phosphor-icons/react/dist/ssr";
import SolicitudesActions from "./SolicitudesActions";
import { getDesembolsoByPrestamo } from "./desembolsoActions";
import DesembolsoView from "./DesembolsoView";

export default async function CapitanSolicitudes() {
  const { supabase, userData: session } = await requireAuth("CAPITAN");
  const empresa_id = session.empresa_id;

  const { data: solicitudes } = await supabase
    .from("solicitudes_prestamo")
    .select(`
      *,
      clientes!inner (
        empresa_id,
        usuario_id,
        cedula,
        telefono,
        score,
        usuarios (
          nombre,
          email
        )
      ),
      fiadores (
        id,
        nombre,
        cedula,
        telefono
      )
    `)
    .eq("clientes.empresa_id", empresa_id) // 🔐 Filtro por empresa
    .order("created_at", { ascending: false });

  const solicitudesWithDesembolso = await Promise.all(
    (solicitudes || []).map(async (solicitud) => {
      let desembolso = null;
      if (solicitud.estado === "APROBADO" && solicitud.prestamo_id) {
        const result = await getDesembolsoByPrestamo(solicitud.prestamo_id);
        desembolso = result.desembolso;
      }
      return { ...solicitud, desembolso };
    })
  );

  const getStatusConfig = (estado: string) => {
    switch (estado) {
      case "PENDIENTE":
        return { color: "text-ios-yellow bg-ios-yellow/10", icon: Clock };
      case "APROBADO":
        return { color: "text-ios-green bg-ios-green/10", icon: CheckCircle };
      case "RECHAZADO":
        return { color: "text-ios-pink bg-ios-pink/10", icon: XCircle };
      case "FIADOR_REQUERIDO":
        return { color: "text-ios-blue bg-ios-blue/10", icon: UserPlus };
      default:
        return { color: "text-black/40 bg-black/5", icon: WarningCircle };
    }
  };

  return (
    <div className="space-y-12 animate-fade-up">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-ios-blue text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-ios-blue/20 transform -rotate-3 border-2 border-white">
            <CurrencyDollar weight="fill" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-[1000] text-black tracking-tighter leading-none">
              Gestión de <span className="text-ios-blue">Capital</span>
            </h1>
            <p className="text-[11px] font-black text-black/20 uppercase tracking-[0.4em] mt-1">
              Bandeja de Aprobación Mivank
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="px-6 py-3 ios-glass-alt rounded-2xl flex items-center gap-3 border-none">
              <ChartBar weight="fill" size={20} className="text-ios-blue" />
              <div>
                 <p className="text-[10px] font-black text-black/20 uppercase leading-none">Total Pendientes</p>
                 <p className="text-[17px] font-[1000] text-black leading-none mt-1">{solicitudes?.filter(s => s.estado === 'PENDIENTE').length || 0}</p>
              </div>
           </div>
        </div>
      </div>

      {/* Advisory Message */}
      <div className="ios-glass-alt p-8 rounded-[44px] border-none shadow-2xl shadow-black/5 flex items-start gap-6 bg-gradient-to-r from-ios-yellow/[0.03] to-transparent">
         <div className="w-14 h-14 bg-white rounded-3xl flex items-center justify-center text-ios-yellow shadow-xl border border-black/[0.02] shrink-0">
            <ShieldCheck weight="fill" size={28} />
         </div>
         <div className="space-y-1 pt-1">
            <p className="text-[13px] font-black text-black/30 uppercase tracking-[0.1em]">Protocolo de Auditoría</p>
            <p className="text-[14px] font-[800] text-black/60 leading-snug">
              "Toda aprobación impacta la matriz financiera de forma inmediata. Valide el scoring y el respaldo antes de sincronizar capital."
            </p>
         </div>
      </div>

      {/* List Section */}
      <div className="space-y-10">
        <div className="flex items-center justify-between px-4">
           <h3 className="text-[11px] font-black text-black/20 uppercase tracking-[0.4em]">Flujo Cronológico</h3>
           <div className="flex items-center gap-3 text-black/20">
              <Funnel weight="bold" size={16} />
              <span className="text-[11px] font-black uppercase tracking-widest leading-none">Filtrar Historial</span>
           </div>
        </div>

        {!solicitudesWithDesembolso || solicitudesWithDesembolso.length === 0 ? (
          <div className="ios-glass h-[400px] flex flex-col items-center justify-center text-center p-12 space-y-8 rounded-[60px] border-dashed border-2 border-black/5">
              <div className="w-24 h-24 bg-black/[0.03] rounded-[44px] flex items-center justify-center text-black/5 mx-auto">
                <Clock weight="fill" size={48} />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-[1000] text-black/20 uppercase tracking-widest leading-none">Matriz Limpia</h3>
                <p className="text-[13px] font-bold text-black/10 uppercase tracking-tight max-w-xs mx-auto">
                  No existen solicitudes pendientes de auditoría en este ciclo operativo.
                </p>
              </div>
          </div>
        ) : (
          <div className="space-y-6">
            {solicitudesWithDesembolso.map((solicitud, idx) => {
              const { color, icon: Icon } = getStatusConfig(solicitud.estado);
              return (
                <div
                  key={solicitud.id}
                  className="ios-glass p-8 border-none rounded-[44px] shadow-2xl shadow-black/[0.03] group hover:bg-black/[0.01] transition-all relative overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-10">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-black text-white rounded-[28px] flex items-center justify-center shadow-2xl shadow-black/20 transform -rotate-1 border border-white/5 relative">
                         <span className="text-2xl font-[1000] tracking-tighter">
                           {solicitud.clientes?.usuarios?.nombre.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                         </span>
                         <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-ios-blue flex items-center justify-center shadow-lg border-2 border-white">
                            <Sparkle weight="fill" size={14} className="text-white" />
                         </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                           <h3 className="text-2xl font-[1000] text-black tracking-tighter uppercase leading-none">
                             {solicitud.clientes?.usuarios?.nombre || "Usuario"}
                           </h3>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="flex items-center gap-2 text-[11px] font-black text-black/20 uppercase tracking-widest leading-none">
                              <IdentificationCard weight="fill" size={16} />
                              {solicitud.clientes?.cedula || "N/A"}
                           </div>
                           <div className="w-1 h-1 rounded-full bg-black/10" />
                           <div className="flex items-center gap-2 text-[11px] font-black text-black/20 uppercase tracking-widest leading-none">
                              <CalendarBlank weight="fill" size={16} />
                              {new Date(solicitud.created_at).toLocaleDateString("es", { day: '2-digit', month: 'short' }).toUpperCase()}
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className={cn(
                      "flex items-center gap-3 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border border-white",
                      color
                    )}>
                      <Icon weight="fill" size={16} />
                      {solicitud.estado.replace("_", " ")}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                    <div className="space-y-4">
                       <p className="text-[10px] font-black text-black/20 uppercase tracking-widest ml-2 leading-none">Monto Solicitado</p>
                       <div className="ios-glass-alt p-6 rounded-[32px] border-none shadow-sm flex items-center justify-between">
                          <p className="text-3xl font-[1000] text-black tracking-tighter leading-none">
                             {formatCurrency(solicitud.monto_solicitado || 0)}
                          </p>
                          <CreditCard weight="fill" size={24} className="text-black/5" />
                       </div>
                    </div>
                    
                    <div className="space-y-4">
                       <p className="text-[10px] font-black text-black/20 uppercase tracking-widest ml-2 leading-none">Score Auditores</p>
                       <div className="ios-glass-alt p-6 rounded-[32px] border-none shadow-sm flex items-center justify-between">
                          <p className="text-3xl font-[1000] text-black tracking-tighter leading-none">
                             {solicitud.clientes?.score || "0"}
                          </p>
                          <ShieldCheck weight="fill" size={24} className="text-ios-green/40" />
                       </div>
                    </div>

                    <div className="space-y-4">
                       <p className="text-[10px] font-black text-black/20 uppercase tracking-widest ml-2 leading-none">Respaldo / Fiador</p>
                       <div className="ios-glass-alt p-6 rounded-[32px] border-none shadow-sm flex items-center justify-between">
                          <p className="text-[15px] font-[1000] text-black/40 tracking-tight leading-none uppercase truncate max-w-[120px]">
                             {solicitud.fiadores ? solicitud.fiadores.nombre : "Sin Nodo"}
                          </p>
                          <UserPlus weight="fill" size={24} className={cn(solicitud.fiadores ? "text-ios-blue/40" : "text-black/5")} />
                       </div>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="pt-10 border-t border-black/[0.03]">
                    {solicitud.estado === "PENDIENTE" && (
                      <SolicitudesActions 
                        solicitudId={solicitud.id}
                        clienteNombre={solicitud.clientes?.usuarios?.nombre}
                      />
                    )}

                    {solicitud.estado === "APROBADO" && solicitud.desembolso && (
                      <DesembolsoView 
                        desembolso={solicitud.desembolso}
                        monto={solicitud.monto_solicitado}
                        clienteNombre={solicitud.clientes?.usuarios?.nombre || "Cliente"}
                      />
                    )}

                    {solicitud.estado === "APROBADO" && !solicitud.desembolso && (
                      <div className="p-8 bg-ios-yellow/[0.03] border border-ios-yellow/10 rounded-[44px] flex flex-col md:flex-row items-center justify-between gap-8 group/alert relative overflow-hidden">
                        <div className="absolute top-[-20%] left-[-10%] text-ios-yellow/5 rotate-12">
                           <WarningCircle weight="fill" size={140} />
                        </div>
                        <div className="relative z-10 flex items-center gap-6">
                           <div className="w-16 h-16 bg-ios-yellow text-black rounded-[22px] flex items-center justify-center shadow-xl shadow-ios-yellow/20 animate-pulse">
                              <WarningCircle weight="fill" size={32} />
                           </div>
                           <div className="space-y-1">
                              <h4 className="text-[17px] font-[1000] text-ios-yellow uppercase tracking-tighter leading-none">Entrega de Capital Pendiente</h4>
                              <p className="text-[13px] font-bold text-black/40 italic leading-none">El protocolo requiere carga de evidencia inmediata.</p>
                           </div>
                        </div>
                        <div className="relative z-10 w-14 h-14 bg-black text-ios-yellow rounded-[20px] flex items-center justify-center shadow-2xl active:scale-95 transition-all group-hover/alert:scale-110">
                           <CurrencyDollar weight="fill" size={24} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}

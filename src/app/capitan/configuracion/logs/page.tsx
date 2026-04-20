import { getAuditLogsAction } from "@/app/actions/audit";
import { 
  Receipt, 
  MapTrifold, 
  UserPlus, 
  Note, 
  Clock, 
  ShieldCheck,
  WarningCircle,
  Cpu
} from "@phosphor-icons/react/dist/ssr";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const actionIcons: Record<string, any> = {
  PAGO_REGISTRADO: { icon: Receipt, color: "bg-ios-green", label: "Pago" },
  RUTA_ASIGNADA: { icon: MapTrifold, color: "bg-ios-blue", label: "Ruta" },
  CLIENTE_CREADO: { icon: UserPlus, color: "bg-ios-purple", label: "Cliente" },
  SOLICITUD_PROCESADA: { icon: Note, color: "bg-ios-yellow", label: "Solicitud" },
  LOGIN_CAPITAN: { icon: ShieldCheck, color: "bg-black", label: "Acceso" },
};

export default async function AuditLogsPage() {
  const logs = await getAuditLogsAction();

  return (
    <div className="space-y-10 animate-fade-up px-2 py-6 pt-0 font-sans antialiased pb-32">
      {/* Header */}
      <div className="px-6 space-y-2">
        <h1 className="text-4xl font-[1000] text-black tracking-tighter">Registro de <span className="text-ios-blue">Actividad</span></h1>
        <p className="text-[13px] font-bold text-black/30 uppercase tracking-[0.2em]">Historial de Auditoría Inmutable</p>
      </div>

      <div className="px-6 relative">
        {/* Línea de tiempo Vertical */}
        <div className="absolute left-10 top-0 bottom-0 w-[2px] bg-black/[0.03] z-0" />

        <div className="space-y-8 relative z-10">
          {logs && logs.length > 0 ? (
            logs.map((log) => {
              const meta = actionIcons[log.accion] || { icon: Clock, color: "bg-ios-gray", label: "Evento" };
              const isSystem = log.is_system_action;
              const Icon = isSystem ? Cpu : meta.icon;
              const accentColor = isSystem ? "bg-black/10 text-black/40" : `${meta.color} text-white`;

              return (
                <div key={log.id} className="flex gap-6 group">
                  {/* Icon Container */}
                  <div className={`w-10 h-10 rounded-[14px] ${accentColor} flex items-center justify-center shadow-lg shadow-black/5 shrink-0 transition-transform ${!isSystem ? "group-hover:scale-110" : ""}`}>
                    <Icon weight={isSystem ? "bold" : "fill"} size={20} />
                  </div>

                  {/* Content Container */}
                  <div className={`flex-1 bg-white rounded-[28px] p-6 shadow-sm border border-black/[0.03] transition-all ${!isSystem ? "hover:shadow-xl active:scale-[0.99] cursor-default" : "opacity-60 cursor-not-allowed"}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="space-y-1">
                        <p className={`text-[11px] font-black uppercase tracking-widest leading-none ${isSystem ? "text-black/20" : "text-black/30"}`}>
                          {log.usuario_nombre} {isSystem && "• AUTOMATIZACIÓN"}
                        </p>
                        <h3 className={`text-[15px] font-[1000] tracking-tight ${isSystem ? "text-black/40" : "text-black"}`}>
                          {log.accion.replace(/_/g, " ")}
                        </h3>
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-tighter px-3 py-1.5 rounded-full ${isSystem ? "bg-black/5 text-black/20" : "bg-ios-blue/5 text-ios-blue"}`}>
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: es })}
                      </span>
                    </div>

                    {!isSystem && log.detalles && (
                      <div className="mt-4 p-4 bg-black/[0.02] rounded-2xl border border-black/[0.01]">
                        <pre className="text-[12px] font-bold text-black/60 font-mono whitespace-pre-wrap leading-relaxed">
                          {typeof log.detalles === 'string' ? log.detalles : JSON.stringify(log.detalles, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
               <div className="w-20 h-20 bg-black/[0.03] rounded-[40px] flex items-center justify-center text-black/10">
                  <Clock weight="fill" size={40} />
               </div>
               <div className="space-y-1">
                  <p className="text-[15px] font-[1000] text-black/30 uppercase tracking-tight">Sin Huella Digital</p>
                  <p className="text-[11px] font-bold text-black/15 uppercase tracking-widest">No hay eventos registrados</p>
               </div>
            </div>
          )}
        </div>
      </div>

      <div className="mx-6 p-6 bg-ios-yellow/10 rounded-[32px] border border-ios-yellow/20 flex gap-4 items-start">
         <WarningCircle weight="fill" className="text-ios-yellow mt-1 shrink-0" size={24} />
         <div className="space-y-1">
            <p className="text-[13px] font-black text-black">Mantenimiento Industrial</p>
            <p className="text-[11px] font-semibold text-black/60 leading-relaxed">
              Sistema de purga automática activo. Los registros se eliminan tras 30 días de inactividad para garantizar el rendimiento de los índices.
            </p>
         </div>
      </div>
    </div>
  );
}

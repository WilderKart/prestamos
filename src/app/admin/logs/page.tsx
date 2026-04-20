import { createClient, requireAuth } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { 
  Scroll, 
  ShieldWarning, 
  IdentificationCard,
  TerminalWindow,
  Clock,
  CaretRight,
  ShieldCheck,
  Activity,
  User,
  Fingerprint
} from "@phosphor-icons/react/dist/ssr";

export default async function AdminLogsPage() {
  const { userData: sessionUser, supabase } = await requireAuth("ADMIN");

  let logs: any[] = [];
  let error: any = null;

  try {
    const result = await supabase
      .from("admin_logs")
      .select(`
        id,
        admin_id,
        accion,
        modulo,
        entidad_id,
        descripcion,
        created_at,
        usuarios!admin_logs_admin_id_fkey(nombre)
      `)
      .order("created_at", { ascending: false });

    logs = result.data || [];
    error = result.error;
  } catch (e) {
    console.error("Error cargando logs:", e);
    error = e;
  }

  if (error) {
    return (
      <div className="p-20 text-center flex flex-col items-center ios-page">
        <div className="w-20 h-20 bg-ios-pink/10 rounded-full flex items-center justify-center mb-6">
          <ShieldWarning className="w-10 h-10 text-ios-pink" weight="fill" />
        </div>
        <h3 className="text-2xl font-[1000] text-black tracking-tighter">Inconsistencia de Red</h3>
        <p className="mt-2 text-[15px] font-semibold text-black/40">No se pudo recuperar el registro inmutable de auditoría.</p>
      </div>
    );
  }

  return (
    <div className="ios-page space-y-10 selection:bg-ios-blue selection:text-white pb-32 pt-4">
      {/* Header Section */}
      <section className="animate-fade-up">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-4">
          <div className="space-y-1">
             <div className="flex items-center gap-3 text-black mb-2 opacity-20">
                <Scroll weight="fill" size={32} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Immutable Ledger</span>
             </div>
             <h1 className="text-4xl font-[1000] text-black tracking-tighter leading-none">
               Protocolos de <span className="opacity-40">Auditoría</span>
             </h1>
             <p className="text-[14px] font-bold text-black/40 tracking-tight leading-loose max-w-xl">
               Registro determinista de cada cambio estructural realizado en el núcleo de seguridad Mivank.
             </p>
          </div>
          
          <div className="px-6 py-3 bg-black text-white rounded-2xl flex items-center gap-3 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-black/20">
             <div className="w-2 h-2 bg-ios-blue rounded-full animate-pulse shadow-[0_0_8px_rgba(0,122,255,1)]" />
             Zero Trust Enabled
          </div>
        </div>
      </section>

      {/* Table Section */}
      <section className="px-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="ios-glass border-none shadow-2xl shadow-black/5 rounded-[44px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-black/[0.03]">
                  <th className="px-8 py-6 text-left text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">Autoridad Admin</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">Acción / Capa</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">Descripción Ténica</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.02]">
                {logs?.map((log) => {
                  const usuario = Array.isArray(log.usuarios) ? log.usuarios[0] : (log.usuarios as any);
                  return (
                    <tr key={log.id} className="group hover:bg-black/[0.01] transition-colors">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-5">
                          <div className="h-14 w-14 bg-black/[0.03] rounded-2xl flex items-center justify-center text-black shadow-inner">
                             <Fingerprint weight="fill" size={24} className="text-black/10 group-hover:text-ios-blue transition-colors" />
                          </div>
                          <div>
                            <div className="text-[15px] font-[900] text-black tracking-tight leading-none mb-1 group-hover:text-ios-blue transition-colors">
                              {usuario?.nombre || "Admin Root"}
                            </div>
                            <div className="text-[10px] font-black text-black/20 font-mono tracking-tighter">
                               ID: {log.admin_id.split('-')[0]}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                         <div className="flex flex-col gap-1.5">
                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white rounded-full text-[9px] font-black uppercase tracking-widest w-fit">
                               <Activity weight="bold" /> {log.accion}
                            </span>
                            <span className="text-[11px] font-black text-black/30 uppercase tracking-widest ml-1">
                               {log.modulo}
                            </span>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="max-w-md">
                            <p className="text-[13px] font-bold text-black/60 leading-relaxed italic">
                               "{log.descripcion || "Sin descripción técnica"}"
                            </p>
                            <div className="mt-2 text-[10px] font-black text-black/10 tracking-widest flex items-center gap-2">
                               <TerminalWindow weight="fill" />
                               ENTITY_ID: {log.entidad_id ? log.entidad_id.split('-')[0]+'...' : "NULL"}
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-right">
                         <div className="flex flex-col items-end">
                            <div className="flex items-center gap-2 text-black/60">
                               <Clock weight="fill" size={14} className="opacity-20" />
                               <span className="text-[13px] font-[900] tracking-tighter">
                                 {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </span>
                            </div>
                            <span className="text-[11px] font-bold text-black/30 uppercase tracking-widest mt-1">
                               {new Date(log.created_at).toLocaleDateString("es", { day: 'numeric', month: 'short' })}
                            </span>
                         </div>
                      </td>
                    </tr>
                  ))}
                
                {(!logs || logs.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-8 py-32">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-black/5 rounded-[32px] flex items-center justify-center text-black/10 mb-6 border border-dashed border-black/10">
                           <Scroll weight="fill" size={40} />
                        </div>
                        <h3 className="text-xl font-[1000] text-black tracking-tight mb-2">Libro Vacío</h3>
                        <p className="text-[14px] font-semibold text-black/40 max-w-xs">No se han registrado eventos críticos en la capa administrativa.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

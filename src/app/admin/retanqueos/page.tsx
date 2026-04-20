import { createClient, requireAuth } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { 
  ArrowsClockwise, 
  ShieldWarning, 
  UserCircle, 
  Calendar, 
  CurrencyDollar, 
  CheckCircle,
  XCircle,
  Clock,
  DotsThreeCircle,
  Lightning,
  Hash,
  ArrowRight
} from "@phosphor-icons/react/dist/ssr";
import { formatCurrency } from "@/utils/format";

export default async function AdminRetanqueosPage() {
  const { userData: sessionUser, supabase } = await requireAuth("ADMIN");

  let retanqueos: any[] = [];
  let error: any = null;

  try {
    const result = await supabase
      .from("solicitudes_retanqueo")
      .select(`
        id,
        cliente_id,
        prestamo_origen_id,
        monto_solicitado,
        estado,
        created_at,
        clientes (
          cedula,
          usuarios!clientes_usuario_id_fkey(nombre)
        )
      `)
      .order("created_at", { ascending: false });

    retanqueos = result.data || [];
    error = result.error;
  } catch (e) {
    console.error("Error cargando retanqueos:", e);
    error = e;
  }

  if (error) {
    return (
      <div className="ios-page flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 bg-ios-pink/10 rounded-[32px] flex items-center justify-center text-ios-pink shadow-inner border border-white">
          <ShieldWarning weight="fill" size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-[1000] text-black tracking-tighter">Fallo en la Red</h3>
          <p className="text-[14px] font-bold text-black/30 max-w-xs">No se pudo establecer conexión con el nodo de retanqueos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-up">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-ios-purple text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-ios-purple/20 transform -rotate-3 border-2 border-white">
              <ArrowsClockwise weight="fill" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-[1000] text-black tracking-tighter leading-none">
                Gestión de <span className="text-ios-purple">Expansion</span>
              </h1>
              <p className="text-[11px] font-black text-black/20 uppercase tracking-[0.4em] mt-1">
                Matriz de Retanqueos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Table - iOS Style */}
      <div className="ios-glass border-none rounded-[44px] shadow-2xl shadow-black/[0.03] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-black/[0.03] bg-black/[0.01]">
                <th className="px-8 py-6 text-left text-[10px] font-black text-black/20 uppercase tracking-[0.4em]">Expediente Cliente</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-black/20 uppercase tracking-[0.4em]">Nodo Origen</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-black/20 uppercase tracking-[0.4em]">Magnitud Solicitada</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-black/20 uppercase tracking-[0.4em]">Estado Protocolo</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-black/20 uppercase tracking-[0.4em]">TimeStamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.02]">
              {retanqueos?.map((solicitud) => {
                const cliente = solicitud.clientes as any;
                const isAprobado = solicitud.estado === 'APROBADO';
                const isRechazado = solicitud.estado === 'RECHAZADO';

                return (
                  <tr key={solicitud.id} className="hover:bg-black/[0.01] transition-colors group">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-black/[0.03] rounded-xl flex items-center justify-center text-black/10 group-hover:text-black transition-colors">
                           <UserCircle weight="fill" size={24} />
                        </div>
                        <div>
                          <p className="text-[15px] font-[900] text-black leading-tight tracking-tight">
                            {cliente?.usuarios?.nombre || "N/A"}
                          </p>
                          <p className="text-[11px] font-bold text-black/20 uppercase tracking-widest">
                            CC: {cliente?.cedula}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-[12px] font-black text-black/30">
                         <Hash weight="bold" size={14} />
                         <span>{solicitud.prestamo_origen_id ? solicitud.prestamo_origen_id.slice(0, 8).toUpperCase() : "ROOT"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                       <p className="text-[17px] font-[1000] text-ios-purple tracking-tighter">
                         {formatCurrency(solicitud.monto_solicitado || 0)}
                       </p>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-[1000] uppercase tracking-widest border border-white shadow-sm ${
                        isAprobado ? 'bg-ios-green/10 text-ios-green' :
                        isRechazado ? 'bg-ios-pink/10 text-ios-pink' :
                        'bg-ios-yellow/10 text-black'
                      }`}>
                         {solicitud.estado || 'PENDIENTE'}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                       <div className="flex items-center gap-2 text-[12px] font-bold text-black/40">
                          <Calendar weight="fill" size={16} className="text-black/10" />
                          {new Date(solicitud.created_at).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
                       </div>
                    </td>
                  </tr>
                );
              })}
              {(!retanqueos || retanqueos.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-6 opacity-20">
                      <Lightning weight="fill" size={60} />
                      <div className="space-y-1">
                        <h3 className="text-xl font-[1000] tracking-tight uppercase">Sin Historial de Expansión</h3>
                        <p className="text-[12px] font-black tracking-widest uppercase">Protocolo en Reposo</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Note */}
      <footer className="px-8 flex items-center gap-4 opacity-30">
         <ShieldCheck weight="fill" size={24} />
         <p className="text-[11px] font-bold text-black leading-relaxed italic">
            "Todas las solicitudes de retanqueo están sujetas a la validación de integridad de capital del nodo maestro Mivank."
         </p>
      </footer>
    </div>
  );
}

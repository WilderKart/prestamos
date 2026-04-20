import { createClient, requireAuth } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { 
  Receipt, 
  ShieldWarning, 
  CheckCircle, 
  XCircle, 
  Clock, 
  IdentificationCard,
  User,
  CalendarBlank,
  Bank,
  DeviceMobile,
  CurrencyDollar,
  CaretRight,
  ShieldCheck,
  TrendUp
} from "@phosphor-icons/react/dist/ssr";
import { formatCurrency } from "@/utils/format";

export default async function AdminPagosPage() {
  const { userData: sessionUser, supabase } = await requireAuth("ADMIN");

  let pagos: any[] = [];
  let error: any = null;

  try {
    const result = await supabase
      .from("pagos")
      .select(`
        id,
        valor,
        metodo,
        estado,
        created_at,
        prestamo_id,
        prestamos (
          clientes (
            cedula,
            usuarios!clientes_usuario_id_fkey(nombre)
          )
        )
      `)
      .order("created_at", { ascending: false });

    pagos = result.data || [];
    error = result.error;
  } catch (e) {
    console.error("Error cargando pagos:", e);
    error = e;
  }

  if (error) {
    return (
      <div className="p-20 text-center flex flex-col items-center ios-page">
        <div className="w-20 h-20 bg-ios-pink/10 rounded-full flex items-center justify-center mb-6">
          <ShieldWarning className="w-10 h-10 text-ios-pink" weight="fill" />
        </div>
        <h3 className="text-2xl font-[1000] text-black tracking-tighter">Inconsistencia de Red</h3>
        <p className="mt-2 text-[15px] font-semibold text-black/40">No se pudo recuperar el historial de transacciones financieras.</p>
      </div>
    );
  }

  const getStatusConfig = (estado: string) => {
    switch (estado) {
      case "APROBADO":
        return { color: "text-ios-green bg-ios-green/10", icon: CheckCircle };
      case "RECHAZADO":
        return { color: "text-ios-pink bg-ios-pink/10", icon: XCircle };
      case "PENDIENTE":
      case "PENDIENTE_VALIDACION":
        return { color: "text-ios-yellow bg-ios-yellow/10", icon: Clock };
      default:
        return { color: "text-black/40 bg-black/5", icon: Clock };
    }
  };

  const getMethodIcon = (metodo: string) => {
    switch (metodo?.toLowerCase()) {
      case "nequi":
      case "daviplata":
        return <DeviceMobile weight="fill" className="text-ios-pink" />;
      case "transferencia":
      case "banco":
        return <Bank weight="fill" className="text-ios-blue" />;
      default:
        return <CurrencyDollar weight="fill" className="text-ios-green" />;
    }
  };

  return (
    <div className="ios-page space-y-10 selection:bg-ios-blue selection:text-white pb-32 pt-4">
      {/* Header Section */}
      <section className="animate-fade-up">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-4">
          <div className="space-y-1">
             <div className="flex items-center gap-3 text-ios-blue mb-2">
                <Receipt weight="fill" size={32} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20">Financial Audit</span>
             </div>
             <h1 className="text-4xl font-[1000] text-black tracking-tighter leading-none">
               Arqueo de <span className="text-ios-blue">Pagos</span>
             </h1>
             <p className="text-[14px] font-bold text-black/40 tracking-tight leading-loose max-w-xl">
               Historial maestro de recaudos y validaciones de capital entrante bajo el protocolo Mivank.
             </p>
          </div>
          
          <div className="px-6 py-3 bg-ios-blue text-white rounded-2xl flex items-center gap-2 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-ios-blue/20">
             <ShieldCheck weight="fill" size={18} /> Verified Log
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
                  <th className="px-8 py-6 text-left text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">Origen de Fondos</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">Inyección de Capital</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">Protocolo Canal</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">Validación</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.02]">
                {pagos?.map((pago) => {
                  const status = getStatusConfig(pago.estado);
                  const prestamo = Array.isArray(pago.prestamos) ? pago.prestamos[0] : (pago.prestamos as any);
                  const cliente = Array.isArray(prestamo?.clientes) ? prestamo?.clientes[0] : (prestamo?.clientes as any);
                  const usuario = Array.isArray(cliente?.usuarios) ? cliente?.usuarios[0] : (cliente?.usuarios as any);

                  return (
                    <tr key={pago.id} className="group hover:bg-black/[0.01] transition-colors">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-5">
                          <div className="h-14 w-14 bg-black/[0.03] rounded-2xl flex items-center justify-center text-black border border-white shadow-inner group-hover:bg-ios-blue/5 transition-colors">
                             <User weight="fill" size={24} className="text-black/10 group-hover:text-ios-blue transition-colors" />
                          </div>
                          <div>
                            <div className="text-[17px] font-[900] text-black tracking-tight leading-none mb-1">
                              {usuario?.nombre || "Usuario"}
                            </div>
                            <div className="text-[12px] font-bold text-black/30 flex items-center gap-1 uppercase">
                               <IdentificationCard weight="fill" />
                               {cliente?.cedula || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                         <div className="flex items-center gap-2">
                            <TrendUp weight="bold" className="text-ios-green" />
                            <p className="text-[17px] font-[1000] text-black tracking-tighter">
                               {formatCurrency(pago.valor)}
                            </p>
                         </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-black/[0.03] flex items-center justify-center">
                               {getMethodIcon(pago.metodo)}
                            </div>
                            <span className="text-[13px] font-black text-black/60 uppercase tracking-tighter">{pago.metodo}</span>
                         </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                          <status.icon weight="fill" size={14} />
                          {pago.estado.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-right">
                         <div className="flex flex-col items-end">
                            <span className="text-[13px] font-bold text-black/40">{new Date(pago.created_at).toLocaleDateString()}</span>
                            <span className="text-[10px] font-black text-black/10">{new Date(pago.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                         </div>
                      </td>
                    </tr>
                  ))}
                
                {(!pagos || pagos.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-8 py-32">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-black/5 rounded-[32px] flex items-center justify-center text-black/10 mb-6 border border-dashed border-black/10">
                           <Receipt weight="fill" size={40} />
                        </div>
                        <h3 className="text-xl font-[1000] text-black tracking-tight mb-2">Sin Recaudos</h3>
                        <p className="text-[14px] font-semibold text-black/40 max-w-xs">El historial de transacciones está actualmente vacío.</p>
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

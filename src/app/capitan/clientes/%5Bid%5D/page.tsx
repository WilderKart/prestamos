import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  CaretLeft, 
  User, 
  Phone, 
  MapPin, 
  CreditCard, 
  CalendarBlank, 
  ShieldCheck, 
  ChartLineUp,
  CaretRight,
  Plus,
  Coins,
  Money,
  Receipt,
  ArrowSquareUpRight,
  IdentificationCard,
  Hash
} from "@phosphor-icons/react/dist/ssr";
import PrestamoFormModal from "./PrestamoFormModal";
import DesembolsoFormModal from "@/app/capitan/solicitudes/DesembolsoFormModal";
import { formatCurrency } from "@/utils/format";

export default async function ClienteDetallesPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const clienteId = params.id;
  const supabase = await createClient();

  const { data: cliente, error: errorCliente } = await supabase
    .from("clientes")
    .select(`
      *,
      usuarios!clientes_usuario_id_fkey(nombre, email)
    `)
    .eq("id", clienteId)
    .single();

  if (errorCliente || !cliente) {
    notFound();
  }

  const { data: prestamos } = await supabase
    .from("prestamos")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("created_at", { ascending: false });

  const prestamosWithDesembolso = await Promise.all(
    (prestamos || []).map(async (prestamo) => {
      const { data: desembolso } = await supabase
        .from("desembolsos")
        .select("*")
        .eq("prestamo_id", prestamo.id)
        .maybeSingle();
      return { ...prestamo, desembolso };
    })
  );

  const { data: cuotas } = await supabase
    .from("cuotas")
    .select("estado")
    .in("prestamo_id", prestamos?.map((p) => p.id) || ["00000000-0000-0000-0000-000000000000"]);

  const totalCuotas = cuotas?.length || 0;
  const cuotasPagadas = cuotas?.filter((c) => c.estado === "PAGADO").length || 0;
  const tasaCumplimiento = totalCuotas > 0 ? Math.round((cuotasPagadas / totalCuotas) * 100) : null;

  const nombre = (cliente.usuarios as any)?.nombre || "Sin Nombre";
  const email = (cliente.usuarios as any)?.email || "";

  return (
    <div className="space-y-10 animate-fade-up px-4 py-6 font-sans antialiased">
      
      {/* iOS Style Profile Header */}
      <div className="ios-card bg-white p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-none shadow-2xl shadow-black/[0.02]">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-[32px] bg-ios-bg border border-black/5 flex items-center justify-center text-ios-blue shadow-inner group">
              <User weight="fill" size={44} className="group-hover:scale-110 transition-transform" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-ios-green text-white text-[9px] font-[900] px-3 py-1.5 rounded-full shadow-lg uppercase tracking-[2px] border-2 border-white">
              VERIFICADO
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
               <span className="text-[11px] font-[800] uppercase tracking-[4px] text-ios-gray/60 leading-none">Perfil del Cliente</span>
            </div>
            <h1 className="text-4xl font-[900] text-black tracking-tighter lowercase leading-tight">
              {nombre}
            </h1>
            <p className="text-[14px] font-bold text-ios-gray flex items-center gap-2">
              <IdentificationCard weight="fill" className="text-ios-blue/40" /> CC: {cliente.cedula}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
           <PrestamoFormModal clienteId={cliente.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-32">
        {/* Contact & Insights */}
        <div className="lg:col-span-4 space-y-6">
          <div className="ios-card p-8 bg-white space-y-8">
            <div>
              <h3 className="ios-section-title pl-0 mb-4">Información de Contacto</h3>
              <div className="space-y-5">
                <DetailRow icon={Phone} label="Teléfono" value={cliente.telefono || "Sin Registro"} color="blue" />
                <DetailRow icon={MapPin} label="Dirección" value={cliente.direccion || "Sin Registro"} color="purple" />
                <DetailRow icon={CreditCard} label="Método Preferido" value={cliente.metodo_pago_principal || "Efectivo"} color="pink" />
              </div>
            </div>

            <div className="pt-8 border-t border-black/[0.03] space-y-5">
              <h3 className="ios-section-title pl-0 mb-4">Estado Crediticio</h3>
              <div className="flex items-center justify-between p-5 bg-ios-bg/50 rounded-2xl border border-black/5 group">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-ios-blue group-hover:scale-110 transition-transform">
                       <ShieldCheck weight="fill" size={24} />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-ios-gray uppercase tracking-widest leading-none mb-1">Scoring Actual</p>
                      <p className={`text-[17px] font-[900] ${cliente.score === 'BUENO' ? 'text-ios-green' : 'text-ios-yellow'}`}>
                        {cliente.score || "BUENO"}
                      </p>
                    </div>
                 </div>
                 <CaretRight weight="bold" className="text-ios-gray opacity-30" />
              </div>

              {/* Performance Card */}
              <div className="bg-gradient-to-br from-ios-blue to-ios-purple p-6 rounded-[28px] text-white shadow-xl shadow-ios-blue/20">
                <div className="flex items-center gap-2 mb-4">
                  <ChartLineUp weight="fill" className="text-white/60" size={20} />
                  <span className="text-[10px] font-black uppercase tracking-[3px] text-white/70">CUMPLIMIENTO</span>
                </div>
                {tasaCumplimiento !== null ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-4xl font-[900] tracking-tighter">{tasaCumplimiento}%</p>
                      <p className="text-[12px] font-bold text-white/60 mt-1 uppercase tracking-wider">Tasa de pago puntual</p>
                    </div>
                    <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white shadow-[0_0_10px_white]" style={{ width: `${tasaCumplimiento}%` }} />
                    </div>
                  </div>
                ) : (
                  <p className="text-[13px] font-bold text-white/80 leading-relaxed italic">Construyendo historial crediticio...</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* History of Credits */}
        <div className="lg:col-span-8 space-y-8">
           <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-ios-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-ios-blue/20">
                    <Coins weight="fill" size={20} />
                 </div>
                 <h2 className="text-[20px] font-[900] text-black tracking-tighter uppercase">Historial de Créditos</h2>
              </div>
              <span className="px-4 py-1.5 bg-white rounded-full text-[10px] font-black text-ios-gray uppercase tracking-widest border border-black/5 shadow-sm">
                {prestamos?.length || 0} REGISTROS
              </span>
           </div>

            <div className="space-y-6">
               {(prestamosWithDesembolso && prestamosWithDesembolso.length > 0) ? (
                 prestamosWithDesembolso.map((prestamo, idx) => (
                   <div 
                     key={prestamo.id} 
                     className="ios-card bg-white p-8 transition-all hover:scale-[1.01] active:scale-[0.99] group overflow-hidden border-none"
                   >
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 bg-ios-bg rounded-[24px] flex items-center justify-center text-ios-blue border border-black/[0.03] shadow-inner group-hover:scale-110 transition-transform">
                              <Money weight="fill" size={28} />
                           </div>
                           <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                 <p className="text-[28px] font-[900] text-black tracking-tighter leading-none">
                                   {formatCurrency(prestamo.saldo_actual || 0)}
                                 </p>
                                 <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                   prestamo.estado === 'ACTIVO' 
                                   ? 'bg-ios-green/10 text-ios-green border-ios-green/20' 
                                   : 'bg-ios-gray/10 text-ios-gray border-ios-gray/20'
                                 }`}>
                                   {prestamo.estado}
                                 </span>
                              </div>
                              <p className="text-[12px] font-bold text-ios-gray uppercase tracking-widest flex items-center gap-2">
                                <Hash weight="bold" size={14} className="text-ios-blue/40" /> {formatCurrency(prestamo.monto)} INICIAL
                              </p>
                           </div>
                        </div>

                        <div className="flex items-center gap-10 md:pl-10 md:border-l border-black/[0.03]">
                           <div className="space-y-1">
                             <p className="text-[10px] font-black text-ios-gray uppercase tracking-[2px] mb-1">Cuotas</p>
                             <p className="text-[15px] font-[900] text-black tracking-tight">{prestamo.numero_cuotas} <span className="text-ios-blue text-[11px] uppercase tracking-widest opacity-60 ml-1">{prestamo.frecuencia}</span></p>
                           </div>
                           <div className="space-y-1">
                             <p className="text-[10px] font-black text-ios-gray uppercase tracking-[2px] mb-1">Fecha</p>
                             <p className="text-[15px] font-[900] text-black tracking-tight">
                                {new Date(prestamo.created_at).toLocaleDateString()}
                             </p>
                           </div>
                           <div className="bg-ios-bg p-3 rounded-2xl group-hover:bg-ios-blue/10 transition-colors">
                            <CaretRight weight="bold" size={20} className="text-ios-gray group-hover:text-ios-blue" />
                          </div>
                        </div>
                     </div>

                     {/* Disburstment Context Section */}
                     <div className="mt-8 pt-8 border-t border-black/[0.03]">
                        {prestamo.desembolso ? (
                          <div className="bg-ios-green/[0.03] border border-ios-green/10 rounded-[28px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-ios-green/10 rounded-2xl flex items-center justify-center text-ios-green shadow-sm shadow-ios-green/5">
                                <Receipt weight="fill" size={24} />
                              </div>
                              <div>
                                <p className="text-[13px] font-[900] text-black leading-none mb-1">Desembolso Confirmado</p>
                                <p className="text-[11px] text-ios-gray font-bold uppercase tracking-widest">
                                  {prestamo.desembolso.metodo_desembolso} • {new Date(prestamo.desembolso.fecha_desembolso).toLocaleDateString("es")}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {prestamo.desembolso.comprobante_url && (
                                <a 
                                  href={prestamo.desembolso.comprobante_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-6 py-3 bg-white text-black text-[11px] font-[900] uppercase tracking-widest rounded-xl border border-black/5 hover:bg-ios-bg transition-colors shadow-sm"
                                >
                                  COMPROBANTE
                                  <ArrowSquareUpRight weight="bold" size={14} />
                                </a>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-ios-yellow/[0.03] border border-ios-yellow/10 rounded-[28px] p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-ios-yellow/10 rounded-2xl flex items-center justify-center text-ios-yellow">
                                <Money weight="fill" size={24} className="animate-pulse" />
                              </div>
                              <div>
                                <p className="text-[13px] font-[900] text-black leading-none mb-1">Sin evidencia de entrega</p>
                                <p className="text-[11px] text-ios-gray font-bold uppercase tracking-widest">Registra el desembolso ahora</p>
                              </div>
                            </div>
                            <DesembolsoFormModal
                              prestamoId={prestamo.id}
                              montoPrestamo={prestamo.monto}
                              clienteNombre={nombre}
                            />
                          </div>
                        )}
                     </div>
                   </div>
                 ))
               ) : (
                 <div className="ios-card p-24 text-center bg-white/50 border-dashed border-2 border-black/5">
                   <div className="bg-ios-bg p-8 rounded-[40px] text-ios-gray/20 mb-6 inline-flex mx-auto">
                     <Coins weight="fill" size={64} />
                   </div>
                   <h3 className="text-[20px] font-[900] text-black tracking-tight mb-2">Historial Limpio</h3>
                   <p className="text-ios-gray font-semibold max-w-sm mx-auto text-[14px]">
                     Este cliente aún no ha solicitado financiamiento. Genera su primera solicitud aquí.
                   </p>
                 </div>
               )}
            </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: 'blue' | 'purple' | 'pink' }) {
  const colors = {
    blue: "text-ios-blue",
    purple: "text-ios-purple",
    pink: "text-ios-pink"
  };

  return (
    <div className="flex items-center gap-4 group/row">
      <div className={`w-11 h-11 rounded-xl bg-ios-bg flex items-center justify-center text-ios-gray group-hover/row:${colors[color]} transition-colors border border-black/[0.02]`}>
        <Icon weight="fill" size={20} />
      </div>
      <div className="space-y-0.5">
        <p className="text-[10px] font-black text-ios-gray/60 uppercase tracking-[2px]">{label}</p>
        <p className="text-[15px] font-bold text-black tracking-tight group-hover/row:text-ios-blue transition-colors truncate max-w-[200px]">{value}</p>
      </div>
    </div>
  );
}

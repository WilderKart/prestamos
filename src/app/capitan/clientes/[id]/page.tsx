import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  CaretLeft, 
  UserCircle, 
  Phone, 
  MapPin, 
  CreditCard, 
  Calendar, 
  ShieldCheck, 
  ChartLineUp,
  CaretRight,
  Plus,
  Coins,
  Money,
  Receipt,
  Hash,
  IdentificationCard,
  Crown,
  Info,
  Sparkle
} from "@phosphor-icons/react/dist/ssr";
import VerComprobanteButton from "../VerComprobanteButton";
import PrestamoFormModal from "./PrestamoFormModal";
import DesembolsoFormModal from "@/app/capitan/solicitudes/DesembolsoFormModal";
import { formatCurrency } from "@/utils/format";

export default async function ClienteDetallesPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const clienteId = params.id;
  const supabase = await createClient();

  // Obtener detalle del cliente con info de usuario
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

  // Obtener préstamos de este cliente
  const { data: prestamos } = await supabase
    .from("prestamos")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("created_at", { ascending: false });

  // Fetch disbursement info for each loan
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

  // Calcular tasa de cumplimiento desde cuotas reales
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
    <div className="space-y-12 animate-fade-up">
      {/* Premium iOS Navigation Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex items-center gap-6">
          <Link
            href="/capitan/clientes"
            className="w-14 h-14 flex items-center justify-center bg-black/[0.03] text-black/40 hover:text-black hover:bg-black/5 rounded-[22px] transition-all active:scale-90 group"
          >
            <CaretLeft weight="bold" size={24} className="group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div className="space-y-1">
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20">Expediente Maestro</span>
                <span className="px-2 py-0.5 rounded-full bg-ios-blue text-white text-[8px] font-black uppercase tracking-widest shadow-lg shadow-ios-blue/10">Nodo Activo</span>
             </div>
             <h1 className="text-4xl font-[1000] text-black tracking-tighter leading-none uppercase">
               {nombre}
             </h1>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
           <PrestamoFormModal clienteId={cliente.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Profile Info (Left) */}
        <div className="lg:col-span-4 space-y-8">
          <div className="ios-glass border-none p-10 rounded-[44px] shadow-2xl shadow-black/5 space-y-10 relative overflow-hidden">
            {/* Background Accent */}
            <UserCircle weight="fill" size={140} className="absolute -bottom-10 -left-10 text-black/[0.02] transform -rotate-12" />
            
            <div className="relative z-10 space-y-10">
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-[36px] bg-black text-white flex items-center justify-center shadow-2xl transform -rotate-2 border-2 border-white/5 relative">
                   <UserCircle weight="fill" size={48} />
                   <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-ios-yellow rounded-2xl flex items-center justify-center text-black shadow-xl border-4 border-white">
                      <Crown weight="fill" size={18} />
                   </div>
                </div>
                <div className="text-center">
                   <p className="text-[14px] font-[1000] text-black tracking-tight">{nombre.toUpperCase()}</p>
                   <p className="text-[11px] font-black text-black/20 uppercase tracking-[0.2em] mt-1">Socio Identificado</p>
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-black/[0.03]">
                <DetailItem icon={IdentificationCard} label="Documento" value={cliente.cedula} />
                <DetailItem icon={Phone} label="Sincronización" value={cliente.telefono || "---"} />
                <DetailItem icon={MapPin} label="Geozona" value={cliente.direccion || "---"} />
                <DetailItem icon={CreditCard} label="Nodo Pago" value={cliente.metodo_pago_principal || "---"} />
              </div>

              <div className="ios-glass-alt p-6 rounded-[32px] border-none flex items-center justify-between shadow-xl shadow-black/5">
                 <div className="space-y-1">
                    <p className="text-[9px] font-black text-black/20 uppercase tracking-[0.2em]">Score Auditores</p>
                    <p className={`text-[17px] font-[1000] leading-none ${
                      cliente.score === 'BUENO' ? 'text-ios-green' : 'text-ios-pink'
                    }`}>
                      {cliente.score || "BUENO"}
                    </p>
                 </div>
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                   cliente.score === 'BUENO' ? 'bg-ios-green/10 text-ios-green' : 'bg-ios-pink/10 text-ios-pink'
                 }`}>
                    <ShieldCheck weight="fill" size={24} />
                 </div>
              </div>
            </div>
          </div>

          {/* Performance Hero Card */}
          <div className="ios-glass-alt p-10 rounded-[44px] border-none bg-gradient-to-br from-ios-blue to-ios-purple text-white shadow-2xl shadow-ios-blue/20 relative overflow-hidden group">
              <ChartLineUp weight="fill" size={120} className="absolute -bottom-10 -right-10 text-white/5 transform group-hover:scale-110 transition-transform" />
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                   <Sparkle weight="fill" size={20} className="text-white/40" />
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Tasa de Sincronía</span>
                </div>
                {tasaCumplimiento !== null ? (
                  <div className="space-y-1">
                    <p className="text-6xl font-[1000] tracking-tighter">{tasaCumplimiento}%</p>
                    <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest italic">Nivel de cumplimiento operativo</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-2xl font-[1000] tracking-tighter">Sin Protocolo</p>
                    <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest">Aún no se registran cuotas de impacto</p>
                  </div>
                )}
              </div>
          </div>
        </div>

        {/* Financial Timeline (Right) */}
        <div className="lg:col-span-8 space-y-8">
           <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-ios-yellow shadow-xl">
                    <Coins weight="fill" size={24} />
                 </div>
                 <div>
                    <h2 className="text-2xl font-[1000] text-black tracking-tight leading-none uppercase">Línea de Créditos</h2>
                    <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.4em] mt-1">Historial Transaccional</p>
                 </div>
              </div>
              <div className="w-12 h-12 bg-black/[0.03] rounded-full flex items-center justify-center text-black/40">
                 <Hash weight="bold" size={16} />
              </div>
           </div>

            <div className="space-y-6">
               {prestamosWithDesembolso && prestamosWithDesembolso.length > 0 ? (
                 prestamosWithDesembolso.map((prestamo, idx) => (
                   <div 
                     key={prestamo.id} 
                     className="ios-glass border-none p-10 rounded-[44px] shadow-2xl shadow-black/[0.03] group hover:bg-black/[0.01] transition-all"
                   >
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                        <div className="flex items-center gap-8">
                           <div className="w-20 h-20 bg-black/[0.03] rounded-[28px] flex items-center justify-center group-hover:bg-black group-hover:text-ios-yellow transition-all duration-500 shadow-inner">
                              <Coins weight="fill" size={32} className="text-black/10 transition-all duration-500" />
                           </div>
                           <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                 <div className={`px-4 py-1 rounded-full text-[9px] font-[1000] uppercase tracking-widest border border-white shadow-sm ${
                                   prestamo.estado === 'ACTIVO' ? 'bg-ios-green/10 text-ios-green' : 'bg-black/5 text-black/30'
                                 }`}>
                                   {prestamo.estado}
                                 </div>
                                 <span className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em] leading-none">#{prestamo.id.slice(0, 8)}</span>
                              </div>
                              <p className="text-4xl font-[1000] text-black tracking-tighter">
                                {formatCurrency(prestamo.saldo_actual)}
                                <span className="text-xs text-black/20 font-black ml-3 uppercase bg-black/[0.03] px-3 py-1 rounded-lg">Original: {formatCurrency(prestamo.monto)}</span>
                              </p>
                           </div>
                        </div>

                        <div className="flex items-center gap-10 border-t md:border-t-0 md:border-l border-black/[0.03] pt-10 md:pt-0 md:pl-10 h-full">
                           <div className="space-y-1 text-center">
                             <p className="text-[10px] font-black text-black/20 uppercase tracking-widest">Protocolo</p>
                             <p className="text-[15px] font-[900] text-black leading-none">{prestamo.numero_cuotas} {prestamo.frecuencia}</p>
                           </div>
                           <div className="space-y-1 text-center">
                             <p className="text-[10px] font-black text-black/20 uppercase tracking-widest">Timestamp</p>
                             <p className="text-[15px] font-[900] text-black leading-none">
                                {new Date(prestamo.created_at).toLocaleDateString('es', { day: '2-digit', month: 'short' }).toUpperCase()}
                             </p>
                           </div>
                           <button className="w-14 h-14 bg-black/[0.03] rounded-[22px] flex items-center justify-center text-black/20 group-hover:bg-black group-hover:text-white transition-all shadow-sm active:scale-90">
                              <CaretRight weight="bold" size={24} />
                           </button>
                        </div>
                     </div>

                     {/* Action or Proof Section */}
                     <div className="mt-10 pt-10 border-t border-black/[0.03] relative overflow-hidden">
                        {prestamo.desembolso ? (
                          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-ios-green text-white rounded-xl flex items-center justify-center shadow-lg shadow-ios-green/20">
                                <Money weight="fill" size={20} />
                              </div>
                              <div>
                                <p className="text-[11px] font-black text-ios-green uppercase tracking-widest leading-none mb-1">Impacto de Capital Confirmado</p>
                                <p className="text-[13px] font-bold text-black/40">Desembolso total por {formatCurrency(prestamo.desembolso.monto)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-10">
                               <div className="text-right">
                                  <p className="text-[9px] font-black text-black/20 uppercase tracking-widest">Método</p>
                                  <p className="text-[12px] font-black text-black capitalize">{prestamo.desembolso.metodo_desembolso?.toLowerCase()}</p>
                               </div>
                               {prestamo.desembolso.comprobante_url && (
                                 <VerComprobanteButton 
                                   desembolso={prestamo.desembolso}
                                   monto={prestamo.monto}
                                   clienteNombre={nombre}
                                 />
                                )}
                            </div>
                          </div>
                        ) : (
                          <div className="ios-glass-alt p-6 rounded-[32px] border-none flex flex-col md:flex-row items-center justify-between gap-6 bg-ios-yellow/[0.03] border border-ios-yellow/10">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-ios-yellow text-black rounded-2xl flex items-center justify-center shadow-lg shadow-ios-yellow/20">
                                <Money weight="fill" size={24} />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[11px] font-black text-ios-yellow uppercase tracking-widest leading-none">Desembolso en Espera</span>
                                <p className="text-[13px] font-bold text-black/40 italic leading-none">El protocolo requiere carga de evidencia inmediata.</p>
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
                 <div className="ios-glass border-dashed border-2 border-black/5 p-20 flex flex-col items-center justify-center text-center space-y-8 rounded-[60px]">
                    <div className="w-24 h-24 bg-black/[0.03] rounded-[44px] flex items-center justify-center text-black/5">
                      <Coins weight="fill" size={48} />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-[1000] text-black/20 uppercase tracking-widest leading-none">Expediente Vacío</h3>
                      <p className="text-[13px] font-bold text-black/10 uppercase tracking-tight max-w-xs mx-auto">
                        Este nodo de cliente no registra inyecciones de capital verificadas.
                      </p>
                    </div>
                 </div>
               )}
            </div>
        </div>
      </div>
      
      {/* Footer Advisory */}
      <div className="ios-glass-alt p-8 rounded-[44px] border-none flex items-start gap-3 opacity-30 justify-center">
         <Info weight="fill" size={20} />
         <span className="text-[10px] font-black uppercase tracking-[0.4em]">Auditado por Mivank Matrix Alpha v1.0 — Security Tier 4 Active</span>
      </div>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-center gap-5 group/detail transition-all">
      <div className="w-12 h-12 rounded-2xl bg-black/[0.02] flex items-center justify-center text-black/10 group-hover/detail:bg-black group-hover/detail:text-ios-yellow transition-all shadow-inner">
        <Icon weight="fill" size={20} />
      </div>
      <div className="space-y-0.5">
        <p className="text-[9px] font-black text-black/20 uppercase tracking-[0.3em]">{label}</p>
        <p className="text-[15px] font-[1000] text-black tracking-tighter leading-none transition-colors truncate max-w-[200px]">{value}</p>
      </div>
    </div>
  );
}

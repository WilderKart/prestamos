import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  User, 
  Phone, 
  MapPin, 
  CreditCard, 
  Calendar, 
  ShieldCheck, 
  TrendingUp,
  ChevronRight,
  Plus,
  Coins,
  Banknote,
  Receipt,
  ExternalLink
} from "lucide-react";
import PrestamoFormModal from "./PrestamoFormModal";
import DesembolsoFormModal from "@/app/capitan/solicitudes/DesembolsoFormModal";

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
    <div className="space-y-10 animate-fade-up px-2 py-8">
      {/* Premium Navigation Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-[32px] shadow-sm">
        <div className="flex items-center gap-5">
          <Link
            href="/capitan/clientes"
            className="w-12 h-12 flex items-center justify-center bg-gray-50 text-gray-400 hover:text-black hover:bg-accent-yellow rounded-2xl transition-all duration-300 shadow-sm group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="text-[10px] font-black uppercase tracking-[3px] text-gray-400">Expediente Cliente</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">
              {nombre}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
           <PrestamoFormModal clienteId={cliente.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Client Profile Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card-premium p-8 bg-white border-none shadow-xl">
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-[32px] bg-[#111111] flex items-center justify-center text-accent-yellow shadow-2xl transform -rotate-3">
                <User className="w-10 h-10" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-accent-yellow text-black text-[10px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-tight">
                VIP Tier
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Datos de Identidad</h3>
                <p className="text-lg font-black text-gray-900">{nombre.toUpperCase()}</p>
                <p className="text-xs font-bold text-gray-500">CC: {cliente.cedula}</p>
              </div>

              <div className="pt-6 border-t border-gray-50 space-y-4">
                <DetailRow icon={Phone} label="Teléfono" value={cliente.telefono || "---"} />
                <DetailRow icon={MapPin} label="Ubicación" value={cliente.direccion || "---"} />
                <DetailRow icon={CreditCard} label="Principal" value={cliente.metodo_pago_principal || "---"} />
              </div>

              <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nivel de Riesgo</span>
                    <span className={`text-sm font-black mt-1 ${
                      cliente.score === 'BUENO' ? 'text-green-500' : 'text-orange-500'
                    }`}>
                      {cliente.score || "BUENO"}
                    </span>
                 </div>
                 <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
                    <ShieldCheck className={`w-6 h-6 ${
                      cliente.score === 'BUENO' ? 'text-green-400' : 'text-orange-400'
                    }`} />
                 </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Card */}
           <div className="card-premium p-6 bg-accent-yellow border-none text-black">
              <div className="flex items-center gap-3 mb-4">
                 <TrendingUp className="w-5 h-5 text-black/40" />
                 <span className="text-[10px] font-black uppercase tracking-[2px]">Performance</span>
              </div>
              {tasaCumplimiento !== null ? (
                <>
                  <p className="text-3xl font-black tracking-tighter">{tasaCumplimiento}%</p>
                  <p className="text-xs font-bold text-black/60 mt-1">Tasa de cumplimiento</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-black tracking-tighter">Información próximamente</p>
                  <p className="text-xs font-bold text-black/60 mt-1">Sin cuotas registradas aún</p>
                </>
              )}
           </div>
        </div>

        {/* Right Column: Loans List */}
        <div className="lg:col-span-8 space-y-8">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-[#111111] rounded-xl flex items-center justify-center text-accent-yellow">
                    <Coins className="w-5 h-5" />
                 </div>
                 <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Historial de Créditos</h2>
              </div>
              <span className="text-xs font-bold text-gray-400">{prestamos?.length || 0} Registros</span>
           </div>

            <div className="space-y-6">
               {prestamosWithDesembolso && prestamosWithDesembolso.length > 0 ? (
                 prestamosWithDesembolso.map((prestamo, idx) => (
                   <div 
                     key={prestamo.id} 
                     className="card-premium p-8 bg-white border-none shadow-lg hover:shadow-xl transition-all duration-300 group"
                     style={{ animationDelay: `${idx * 100}ms` }}
                   >
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                           <div className="w-14 h-14 bg-gray-50 rounded-[20px] flex items-center justify-center group-hover:bg-[#111111] transition-all duration-500">
                              <Coins className="w-7 h-7 text-gray-300 group-hover:text-accent-yellow transition-all duration-500" />
                           </div>
                           <div>
                              <div className="flex items-center gap-2 mb-1">
                                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Saldo Actual</span>
                                 <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                   prestamo.estado === 'ACTIVO' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'
                                 }`}>
                                   {prestamo.estado}
                                 </span>
                              </div>
                              <p className="text-2xl font-black text-gray-900 tracking-tight">
                                ${prestamo.saldo_actual?.toLocaleString()}
                                <span className="text-xs text-gray-400 font-bold ml-2">de ${prestamo.monto?.toLocaleString()}</span>
                              </p>
                           </div>
                        </div>

                        <div className="flex items-center gap-8 border-t md:border-t-0 md:border-l border-gray-50 pt-6 md:pt-0 md:pl-8">
                           <div>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Cuotas</p>
                             <p className="text-sm font-black text-gray-900">{prestamo.numero_cuotas} {prestamo.frecuencia}</p>
                           </div>
                           <div>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fecha</p>
                             <p className="text-sm font-black text-gray-900">
                                {new Date(prestamo.created_at).toLocaleDateString()}
                             </p>
                           </div>
                           <button className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:bg-accent-yellow group-hover:text-black transition-all">
                              <ChevronRight className="w-6 h-6" />
                           </button>
                        </div>
                     </div>

                     {prestamo.desembolso ? (
                       <div className="mt-6 pt-6 border-t border-gray-100">
                         <div className="flex items-center gap-2 mb-3">
                           <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center">
                             <Banknote className="w-3 h-3 text-white" />
                           </div>
                           <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Desembolso Registrado</span>
                         </div>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                           <div>
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Monto</p>
                             <p className="text-sm font-black text-gray-900">${prestamo.desembolso.monto?.toLocaleString()}</p>
                           </div>
                           <div>
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Método</p>
                             <p className="text-sm font-bold text-gray-700 capitalize">{prestamo.desembolso.metodo_desembolso?.toLowerCase()}</p>
                           </div>
                           <div>
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Fecha</p>
                             <p className="text-sm font-bold text-gray-700">{new Date(prestamo.desembolso.fecha_desembolso).toLocaleDateString("es")}</p>
                           </div>
                           {prestamo.desembolso.comprobante_url && (
                             <div>
                               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Comprobante</p>
                               <a 
                                 href={prestamo.desembolso.comprobante_url} 
                                 target="_blank" 
                                 rel="noopener noreferrer"
                                 className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-800"
                               >
                                 <Receipt className="w-3 h-3" />
                                 Ver
                                 <ExternalLink className="w-3 h-3" />
                               </a>
                             </div>
                           )}
                         </div>
                       </div>
                     ) : (
                       <div className="mt-6 pt-6 border-t border-gray-100">
                         <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                             <div className="w-6 h-6 bg-yellow-100 rounded-md flex items-center justify-center">
                               <Banknote className="w-3 h-3 text-yellow-600" />
                             </div>
                             <span className="text-[10px] font-black text-yellow-600 uppercase tracking-widest">Desembolso Pendiente</span>
                           </div>
                           <DesembolsoFormModal
                             prestamoId={prestamo.id}
                             montoPrestamo={prestamo.monto}
                             clienteNombre={nombre}
                           />
                         </div>
                       </div>
                     )}
                   </div>
                 ))
              ) : (
                <div className="card-premium p-16 text-center bg-gray-50/30 border-dashed border-2 border-gray-100">
                  <Coins className="w-12 h-12 text-gray-200 mx-auto mb-6" />
                  <h3 className="text-lg font-black text-gray-400 uppercase tracking-widest">Sin Créditos</h3>
                  <p className="text-xs font-bold text-gray-300 mt-2 max-w-xs mx-auto">
                    Este cliente aún no ha solicitado financiamiento en la plataforma.
                  </p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-center gap-4 group/row">
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover/row:text-accent-yellow transition-colors">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[9px] font-black text-gray-300 uppercase tracking-[2px]">{label}</p>
        <p className="text-sm font-bold text-gray-600 group-hover/row:text-gray-900 transition-colors truncate max-w-[180px]">{value}</p>
      </div>
    </div>
  );
}

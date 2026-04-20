import { createClient, requireAuth } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { 
  Wallet, 
  ShieldWarning, 
  CheckCircle, 
  XCircle, 
  Clock, 
  IdentificationCard,
  User,
  CalendarBlank,
  ArrowsCounterClockwise,
  CaretRight,
  ChartBar
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { formatCurrency } from "@/utils/format";

export default async function AdminPrestamosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { userData: sessionUser, supabase } = await requireAuth("ADMIN");

  const sp = await searchParams;
  const filtroEstado = sp.estado || "todos";

  let query = supabase
    .from("prestamos")
    .select(`
      id, 
      cliente_id, 
      monto, 
      saldo_actual, 
      estado, 
      fecha_inicio,
      clientes!inner ( 
        cedula,
        usuarios!clientes_usuario_id_fkey(nombre)
      )
    `)
    .order("fecha_inicio", { ascending: false });

  if (filtroEstado !== "todos") {
    query = query.eq("estado", filtroEstado.toUpperCase());
  }

  const { data: prestamos, error } = await query;

  if (error) {
    return (
      <div className="p-20 text-center flex flex-col items-center ios-page">
        <div className="w-20 h-20 bg-ios-pink/10 rounded-full flex items-center justify-center mb-6">
          <ShieldWarning className="w-10 h-10 text-ios-pink" weight="fill" />
        </div>
        <h3 className="text-2xl font-[1000] text-black tracking-tighter">Error de Sincronización</h3>
        <p className="mt-2 text-[15px] font-semibold text-black/40">No se pudo recuperar la matriz de créditos activos.</p>
      </div>
    );
  }

  const getStatusConfig = (estado: string) => {
    switch (estado) {
      case "ACTIVO":
        return { color: "text-ios-green bg-ios-green/10", icon: CheckCircle };
      case "EN_MORA":
        return { color: "text-ios-pink bg-ios-pink/10", icon: WarningCircle };
      case "FINALIZADO":
        return { color: "text-black/40 bg-black/5", icon: CheckCircle };
      default:
        return { color: "text-ios-yellow bg-ios-yellow/10", icon: Clock };
    }
  };

  return (
    <div className="ios-page space-y-10 selection:bg-ios-blue selection:text-white pb-32 pt-4">
      {/* Header Section */}
      <section className="animate-fade-up">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-4">
          <div className="space-y-1">
             <div className="flex items-center gap-3 text-ios-green mb-2">
                <Wallet weight="fill" size={32} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20">Credit Lifecycle</span>
             </div>
             <h1 className="text-4xl font-[1000] text-black tracking-tighter leading-none">
               Gestión de <span className="text-ios-green">Cartera</span>
             </h1>
             <p className="text-[14px] font-bold text-black/40 tracking-tight leading-loose max-w-xl">
               Supervisión estratégica de fondos desplegados y control de riesgos operativos en tiempo real.
             </p>
          </div>
          
          <div className="w-full md:w-auto p-1.5 bg-black/[0.03] rounded-[24px] flex">
            {[
              { id: "todos", label: "Todos", icon: ChartBar },
              { id: "activo", label: "Activos", icon: CheckCircle },
              { id: "en_mora", label: "Mora", icon: ShieldWarning },
              { id: "finalizado", label: "Cerrados", icon: ArrowsCounterClockwise },
            ].map((tab) => {
              const isActive = filtroEstado === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={`/admin/prestamos${tab.id === 'todos' ? '' : `?estado=${tab.id}`}`}
                  className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-[18px] text-[11px] font-black uppercase tracking-widest transition-all ${
                    isActive 
                    ? 'bg-white text-black shadow-lg shadow-black/5 active:scale-95' 
                    : 'text-black/30 hover:text-black hover:bg-black/5'
                  }`}
                >
                  <tab.icon weight={isActive ? "fill" : "bold"} size={16} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </Link>
              );
            })}
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
                  <th className="px-8 py-6 text-left text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">Titular de Crédito</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">Monto Original</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">Saldo Pendiente</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">Estatus Operativo</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">Activación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.02]">
                {prestamos?.map((prestamo) => {
                  const status = getStatusConfig(prestamo.estado);
                  const cliente = Array.isArray(prestamo.clientes) ? prestamo.clientes[0] : (prestamo.clientes as any);
                  const usuario = Array.isArray(cliente?.usuarios) ? cliente?.usuarios[0] : (cliente?.usuarios as any);

                  return (
                    <tr key={prestamo.id} className="group hover:bg-black/[0.01] transition-colors">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-5">
                          <div className="h-14 w-14 bg-black/[0.03] rounded-2xl flex items-center justify-center text-black shadow-inner group-hover:bg-ios-green/5 transition-colors">
                             <User weight="fill" size={24} className="text-black/10 group-hover:text-ios-green transition-colors" />
                          </div>
                          <div>
                            <div className="text-[17px] font-[900] text-black tracking-tight leading-none mb-1 group-hover:text-ios-green transition-colors">
                              {usuario?.nombre || "Usuario"}
                            </div>
                            <div className="text-[12px] font-bold text-black/30 flex items-center gap-1 uppercase">
                               <IdentificationCard weight="fill" />
                               {cliente?.cedula}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                         <p className="text-[15px] font-[800] text-black tracking-tight">
                            {formatCurrency(prestamo.monto)}
                         </p>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                         <p className={`text-[17px] font-[1000] tracking-tighter ${prestamo.estado === 'EN_MORA' ? 'text-ios-pink' : 'text-black'}`}>
                            {formatCurrency(prestamo.saldo_actual)}
                         </p>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                          <status.icon weight="fill" size={14} />
                          {prestamo.estado.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-right">
                         <div className="flex flex-col items-end">
                            <span className="text-[13px] font-bold text-black/40">{new Date(prestamo.fecha_inicio).toLocaleDateString()}</span>
                            <div className="flex items-center gap-1 text-[10px] font-black text-black/10 transition-colors group-hover:text-ios-blue">
                               Details <CaretRight weight="bold" />
                            </div>
                         </div>
                      </td>
                    </tr>
                  ))}
                
                {(!prestamos || prestamos.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-8 py-32">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-black/5 rounded-[32px] flex items-center justify-center text-black/10 mb-6 border border-dashed border-black/10">
                           <Wallet weight="fill" size={40} />
                        </div>
                        <h3 className="text-xl font-[1000] text-black tracking-tight mb-2">Cartera Inactiva</h3>
                        <p className="text-[14px] font-semibold text-black/40 max-w-xs">No hay registros de créditos desplegados bajo el filtro de seguridad seleccionado.</p>
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

// Helper icons that were missing in import for type safety
const WarningCircle = ShieldWarning;

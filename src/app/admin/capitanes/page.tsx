import { createClient, requireAuth } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { 
  UserSquare, 
  ShieldWarning, 
  Users, 
  IdentificationCard,
  User,
  ChartBar,
  TrendUp,
  Target,
  CaretRight,
  ShieldCheck,
  Briefcase
} from "@phosphor-icons/react/dist/ssr";
import { formatCurrency } from "@/utils/format";

export default async function AdminCapitanesPage() {
  const { userData: sessionUser, supabase } = await requireAuth("ADMIN");

  let capitanes: any[] = [];
  let error: any = null;

  try {
    const result = await supabase
      .from("usuarios")
      .select("id, nombre, email, created_at")
      .eq("rol", "CAPITAN")
      .order("created_at", { ascending: false });
    
    capitanes = result.data || [];
    error = result.error;
  } catch (e) {
    console.error("Error cargando capitanes:", e);
    error = e;
  }

  if (error) {
    return (
      <div className="p-20 text-center flex flex-col items-center ios-page">
        <div className="w-20 h-20 bg-ios-pink/10 rounded-full flex items-center justify-center mb-6">
          <ShieldWarning className="w-10 h-10 text-ios-pink" weight="fill" />
        </div>
        <h3 className="text-2xl font-[1000] text-black tracking-tighter">Inconsistencia de Red</h3>
        <p className="mt-2 text-[15px] font-semibold text-black/40">No se pudo recuperar la matriz de capitanes activos.</p>
      </div>
    );
  }

  // Fetch stats for these capitanes
  const capitanIds = capitanes?.map((c) => c.id) || [];
  
  let clientesStats: Record<string, number> = {};
  let prestamosStats: Record<string, { count: number; cartera: number }> = {};

  if (capitanIds.length > 0) {
    const { data: clientesData } = await supabase
      .from("clientes")
      .select("capitan_id");
    
    if (clientesData) {
      clientesData.forEach((c) => {
        if (!clientesStats[c.capitan_id]) clientesStats[c.capitan_id] = 0;
        clientesStats[c.capitan_id]++;
      });
    }

    const { data: prestamosData } = await supabase
      .from("prestamos")
      .select("capitan_id, saldo_actual");
      
    if (prestamosData) {
      prestamosData.forEach((p) => {
        if (!prestamosStats[p.capitan_id]) {
          prestamosStats[p.capitan_id] = { count: 0, cartera: 0 };
        }
        prestamosStats[p.capitan_id].count++;
        prestamosStats[p.capitan_id].cartera += Number(p.saldo_actual || 0);
      });
    }
  }

  return (
    <div className="ios-page space-y-10 selection:bg-ios-blue selection:text-white pb-32 pt-4">
      {/* Header Section */}
      <section className="animate-fade-up">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-4">
          <div className="space-y-1">
             <div className="flex items-center gap-3 text-ios-purple mb-2">
                <UserSquare weight="fill" size={32} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20">Operational Leadership</span>
             </div>
             <h1 className="text-4xl font-[1000] text-black tracking-tighter leading-none">
               Gestión de <span className="text-ios-purple">Capitanes</span>
             </h1>
             <p className="text-[14px] font-bold text-black/40 tracking-tight leading-loose max-w-xl">
               Monitoreo de alto nivel para los líderes operativos y su rendimiento en el despliegue de capital.
             </p>
          </div>
          
          <div className="px-6 py-3 bg-ios-purple text-white rounded-2xl flex items-center gap-2 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-ios-purple/20">
             <ShieldCheck weight="fill" size={18} /> Master Admin View
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
                  <th className="px-8 py-6 text-left text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">Líder Operativo</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">Clientes</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">Despliegue Créditos</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">Cartera Activa</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">Antigüedad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.02]">
                {capitanes?.map((capitan) => {
                  const numClientes = clientesStats[capitan.id] || 0;
                  const pStats = prestamosStats[capitan.id] || { count: 0, cartera: 0 };

                  return (
                    <tr key={capitan.id} className="group hover:bg-black/[0.01] transition-colors">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-5">
                          <div className="h-14 w-14 bg-black/[0.03] rounded-2xl flex items-center justify-center text-black border border-white shadow-inner group-hover:bg-ios-purple/5 transition-colors">
                             <User weight="fill" size={24} className="text-black/10 group-hover:text-ios-purple transition-colors" />
                          </div>
                          <div>
                            <div className="text-[17px] font-[900] text-black tracking-tight leading-none mb-1 group-hover:text-ios-purple transition-colors">
                              {capitan.nombre || "Capitán"}
                            </div>
                            <div className="text-[12px] font-bold text-black/30 flex items-center gap-1">
                               {capitan.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                         <div className="flex items-center gap-2">
                           <Users weight="fill" size={14} className="text-ios-blue" />
                           <span className="text-[15px] font-[800] text-black">{numClientes}</span>
                         </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                         <div className="flex items-center gap-2">
                           <Target weight="fill" size={14} className="text-ios-green" />
                           <span className="text-[15px] font-[800] text-black">{pStats.count}</span>
                         </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                         <div className="flex items-center gap-2">
                           <TrendUp weight="bold" size={14} className="text-ios-green" />
                           <span className="text-[17px] font-[1000] text-black tracking-tighter">
                             {formatCurrency(pStats.cartera)}
                           </span>
                         </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-right">
                         <div className="flex flex-col items-end">
                            <span className="text-[13px] font-bold text-black/40">{new Date(capitan.created_at).toLocaleDateString("es", { month: 'short', year: 'numeric' })}</span>
                            <div className="flex items-center gap-1 text-[10px] font-black text-black/10 group-hover:text-ios-blue transition-colors">
                               Control Panel <CaretRight weight="bold" />
                            </div>
                         </div>
                      </td>
                    </tr>
                  ))}
                
                {(!capitanes || capitanes.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-8 py-32">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-black/5 rounded-[32px] flex items-center justify-center text-black/10 mb-6 border border-dashed border-black/10">
                           <UserSquare weight="fill" size={40} />
                        </div>
                        <h3 className="text-xl font-[1000] text-black tracking-tight mb-2">Escuadrón No Asignado</h3>
                        <p className="text-[14px] font-semibold text-black/40 max-w-xs">No hay capitanes registrados actualmente en la matriz de red.</p>
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

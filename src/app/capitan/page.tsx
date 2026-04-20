import { requireAuth } from "@/utils/supabase/server";
import { formatCurrency } from "@/utils/format";
import DashboardCockpit from "./components/DashboardCockpit";
import DashboardCharts from "./components/DashboardCharts";

export default async function CapitanDashboard() {
  const { supabase, userData: sessionUser } = await requireAuth("CAPITAN");
  const empresa_id = sessionUser.empresa_id;

  // 1. Datos Base obtenidos en el Servidor (Instantáneos)
  const [
    { data: prestamos },
    { data: pagos }
  ] = await Promise.all([
    supabase.from("prestamos").select("monto, interes, estado, saldo_actual").eq("empresa_id", empresa_id),
    supabase.from("pagos").select("valor, created_at").eq("estado", "APROBADO").eq("empresa_id", empresa_id)
  ]);

  const carteraActiva = prestamos?.reduce((acc, p) => acc + (p.saldo_actual || 0), 0) || 0;
  const totalRecuperado = pagos?.reduce((acc, p) => acc + (p.valor || 0), 0) || 0;
  const totalPrestamos = prestamos?.length || 0;
  
  // Métricas empaquetadas para el Cockpit
  const metrics = {
    carteraActiva,
    totalRecuperado,
    totalPrestamos
  };

  return (
    <div className="space-y-12">
      
      {/* ── Dashboard Cockpit (Client Container) ── */}
      <DashboardCockpit metrics={metrics} />

       {/* ── Deep Analytics (Server Side Data passed to Charts) ── */}
       <section className="animate-fade-up pt-8">
          <div className="flex items-center justify-between mb-6 px-4">
              <h3 className="text-[12px] font-black text-black/30 uppercase tracking-[0.3em]">Operational Insights</h3>
              <div className="px-4 py-2 bg-black text-white rounded-full text-[10px] font-black uppercase">Live Analytics</div>
          </div>
          <DashboardCharts recoveryData={[]} statusData={[]} />
       </section>

    </div>
  );
}

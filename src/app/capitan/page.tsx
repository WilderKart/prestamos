import { createClient } from "@/utils/supabase/server";
import { 
  Users, 
  Wallet, 
  TrendingUp, 
  AlertCircle, 
  Plus, 
  ArrowUpRight,
  ShieldCheck,
  Zap
} from "lucide-react";
import StatCard from "./components/StatCard";
import DashboardCharts from "./components/DashboardCharts";
import Link from "next/link";
import { formatCurrency } from "@/utils/format";

export default async function CapitanDashboard() {
  const supabase = await createClient();

  const { count: totalClientes } = await supabase
    .from("clientes")
    .select("*", { count: "exact", head: true });

  const { data: prestamos } = await supabase
    .from("prestamos")
    .select("monto, interes, estado");

  const { data: pagos } = await supabase
    .from("pagos")
    .select("valor, created_at")
    .eq("estado", "APROBADO");

  const { data: cuotasMora } = await supabase
    .from("cuotas")
    .select("valor_cuota")
    .neq("estado", "PAGADO")
    .lt("fecha_pago", new Date().toISOString());

  const totalPrestado = prestamos?.reduce((acc, p) => acc + (p.monto || 0), 0) || 0;
  const totalRecuperado = pagos?.reduce((acc, p) => acc + (p.valor || 0), 0) || 0;
  const totalMora = cuotasMora?.reduce((acc, c) => acc + (c.valor_cuota || 0), 0) || 0;

  const diasSemana = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
  const recoveryByDay: Record<string, number> = {};
  pagos?.forEach((pago) => {
    const dayIndex = new Date(pago.created_at).getDay();
    const dayName = diasSemana[dayIndex];
    recoveryByDay[dayName] = (recoveryByDay[dayName] || 0) + (pago.valor || 0);
  });
  const recoveryData = diasSemana.map((name) => ({
    name,
    value: recoveryByDay[name] || 0,
  }));

  const prestamosActivos = prestamos?.filter((p) => p.estado === "ACTIVO").length || 0;
  const prestamosMora = prestamos?.filter((p) => p.estado === "EN_MORA").length || 0;
  const totalPrestamos = prestamos?.length || 0;
  const alDia = totalPrestamos > 0 ? Math.round((prestamosActivos / totalPrestamos) * 100) : 0;
  const enMora = totalPrestamos > 0 ? Math.round((prestamosMora / totalPrestamos) * 100) : 0;
  const statusData = [
    { name: "Al Día", value: alDia, color: "#34D399" },
    { name: "En Mora", value: enMora, color: "#FFD60A" },
  ];

  return (
    <div className="flex flex-col gap-8 pb-32">
      
      <section className="animate-fade-up">
        <div className="bg-[#111111] text-white rounded-[40px] p-8 relative overflow-hidden group shadow-2xl">
           <div className="relative z-10 max-w-[200px]">
              <span className="bg-accent-yellow text-black text-[10px] font-black uppercase px-2 py-1 rounded-md tracking-widest mb-3 inline-block">Mivank Ultra</span>
              <h2 className="text-3xl font-black mb-1 mt-2 leading-tight">Total Prestado</h2>
              <p className="text-4xl font-black text-accent-yellow mt-1">{formatCurrency(totalPrestado)}</p>
              
              <Link href="/capitan/clientes" className="mt-8 bg-accent-yellow text-black px-6 py-3 rounded-full flex items-center justify-center gap-2 font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_10px_20px_-5px_#FFD60A]">
                  <Plus className="w-5 h-5" />
                  NUEVO CLIENTE
              </Link>
           </div>
           
           <div className="absolute top-0 right-0 h-full w-[50%] flex items-center justify-center">
              <div className="relative">
                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent-yellow/20 filter blur-3xl opacity-50"></div>
                 <div className="w-48 h-48 bg-zinc-800 rounded-full flex items-center justify-center border-8 border-zinc-700 shadow-2xl">
                    <ShieldCheck className="w-24 h-24 text-accent-yellow animate-pulse" />
                 </div>
              </div>
           </div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
         <div className="card-premium bg-white p-4 flex flex-col items-center justify-center text-center gap-2 shadow-xl border-none">
            <div className="p-3 bg-zinc-900 rounded-2xl text-white">
               <Users className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{totalClientes || 0} Clientes</span>
         </div>
         <div className="card-premium bg-white p-4 flex flex-col items-center justify-center text-center gap-2 shadow-xl border-none">
            <div className="p-3 bg-zinc-900 rounded-2xl text-white">
               <LockIcon className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Privado</span>
         </div>
         <div className="card-premium bg-white p-4 flex flex-col items-center justify-center text-center gap-2 shadow-xl border-none">
            <div className="p-3 bg-zinc-900 rounded-2xl text-white">
               <Zap className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Express</span>
         </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <StatCard 
          label="RECUPERADO" 
          value={formatCurrency(totalRecuperado)} 
          icon="TrendingUp"
        />
        <StatCard 
          label="MORA TOTAL" 
          value={formatCurrency(totalMora)} 
          icon="AlertCircle"
        />
      </section>

      <section className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-black text-gray-900 tracking-tight">ANALÍTICA DE CARTERA</h2>
        </div>
        <DashboardCharts recoveryData={recoveryData} statusData={statusData} />
      </section>

    </div>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

function Settings2({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M20 7h-9M14 17H5M17 12H7M4 12H3M21 12h-1M10 17h11M7 7H3"/>
    </svg>
  );
}

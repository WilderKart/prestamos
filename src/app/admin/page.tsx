import { createClient, requireAuth } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { 
  Users, 
  UserSquare, 
  UserGear, 
  Wallet, 
  Receipt, 
  WarningCircle, 
  ChartLineUp, 
  ArrowUpRight,
  ArrowsCounterClockwise,
  Gear,
  Scroll,
  CreditCard,
  SquaresFour,
  IdentificationCard,
  Vault,
  ShieldCheck,
  TrendUp
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { formatCurrency } from "@/utils/format";

export default async function AdminDashboardPage() {
  // 🔐 ZERO TRUST: Validar sesión y rol explícitamente en cada página
  const { userData: sessionUser, supabase } = await requireAuth("ADMIN");

  let totalUsuarios = 0;
  let totalCapitanes = 0;
  let totalClientes = 0;
  let prestamosActivos: { saldo_actual: number }[] = [];
  let prestamosMora = 0;
  let pagosPendientes = 0;

  try {
    const results = await Promise.all([
      supabase.from("usuarios").select("id", { count: "exact", head: true }),
      supabase.from("usuarios").select("id", { count: "exact", head: true }).eq("rol", "CAPITAN"),
      supabase.from("clientes").select("id", { count: "exact", head: true }),
      supabase.from("prestamos").select("saldo_actual, monto").eq("estado", "ACTIVO"),
      supabase.from("prestamos").select("id", { count: "exact", head: true }).eq("estado", "EN_MORA"),
      supabase.from("pagos").select("id", { count: "exact", head: true }).eq("estado", "PENDIENTE_VALIDACION"),
    ]);

    totalUsuarios = results[0].count || 0;
    totalCapitanes = results[1].count || 0;
    totalClientes = results[2].count || 0;
    prestamosActivos = results[3].data || [];
    prestamosMora = results[4].count || 0;
    pagosPendientes = results[5].count || 0;
  } catch (error) {
    console.error("Error cargando datos del dashboard:", error);
  }

  const carteraTotal = prestamosActivos.reduce((acc, curr) => acc + (curr.saldo_actual || 0), 0);

  const stats = [
    { name: 'Total Usuarios', value: totalUsuarios, icon: Users, color: 'text-ios-blue', bg: 'bg-ios-blue/10' },
    { name: 'Capitanes', value: totalCapitanes, icon: UserSquare, color: 'text-ios-purple', bg: 'bg-ios-purple/10' },
    { name: 'Clientes', value: totalClientes, icon: UserGear, color: 'text-ios-green', bg: 'bg-ios-green/10' },
    { name: 'Mora Activa', value: prestamosMora, icon: WarningCircle, color: 'text-ios-pink', bg: 'bg-ios-pink/10' },
  ];

  const adminModules = [
    { name: "Préstamos", href: "/admin/prestamos", icon: Wallet, description: "Catálogo completo de créditos.", color: "text-ios-green", bg: "bg-ios-green/10" },
    { name: "Pagos", href: "/admin/pagos", icon: Receipt, description: "Aprobación de recaudos.", color: "text-ios-blue", bg: "bg-ios-blue/10" },
    { name: "Retanqueos", href: "/admin/retanqueos", icon: ArrowsCounterClockwise, description: "Refinanciamientos.", color: "text-ios-purple", bg: "bg-ios-purple/10" },
    { name: "Usuarios", href: "/admin/usuarios", icon: Users, description: "Control de identidades.", color: "text-black", bg: "bg-black/5" },
    { name: "Configuración", href: "/admin/configuracion", icon: Gear, description: "Parámetros globales.", color: "text-black/40", bg: "bg-black/5" },
    { name: "Auditoría", href: "/admin/logs", icon: Scroll, description: "Trazabilidad Zero Trust.", color: "text-black/40", bg: "bg-black/5" },
  ];

  return (
    <div className="ios-page space-y-12 selection:bg-ios-blue selection:text-white pb-32 pt-8">
      
      {/* ── Admin Hero Section ── */}
      <section className="animate-fade-up">
        <div className="relative h-[280px] rounded-[44px] bg-black shadow-2xl shadow-black/20 overflow-hidden flex flex-col justify-end p-10 border border-white/5 group">
          {/* Pulsing Core */}
          <div className="absolute top-[-20%] right-[-10%] w-80 h-80 bg-ios-blue/20 rounded-full blur-[100px] opacity-60 group-hover:scale-125 transition-transform duration-[3s]" />
          <div className="absolute top-10 left-10 w-4 h-4 bg-ios-green rounded-full shadow-[0_0_20px_rgba(52,199,89,0.8)] animate-pulse" />
          
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 flex items-center justify-center text-ios-blue shadow-inner">
                 <Vault weight="fill" size={28} />
              </div>
              <div className="flex flex-col">
                <span className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em] leading-none mb-1">Central Enclave</span>
                <h1 className="text-white text-2xl font-[1000] tracking-tighter leading-none">Security Dashboard</h1>
              </div>
            </div>
            
            <p className="text-white/40 text-[13px] font-bold tracking-tight px-1">Cartera Global Consolidada</p>
            <div className="flex items-end gap-3">
              <span className="text-5xl md:text-6xl font-[1000] text-white tracking-tighter leading-[0.8]">
                 {formatCurrency(carteraTotal)}
              </span>
              <div className="px-3 py-1 bg-ios-green/10 text-ios-green rounded-full text-[10px] font-black uppercase tracking-widest mb-2 border border-ios-green/20">
                 Online
              </div>
            </div>
          </div>
          
          <ShieldCheck weight="fill" size={200} className="absolute bottom-[-10%] right-[-5%] text-white/[0.02] -rotate-12 pointer-events-none" />
        </div>
      </section>

      {/* ── KPI Grid ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up" style={{ animationDelay: '0.15s' }}>
        {stats.map((stat, i) => (
          <div key={i} className="ios-card bg-white p-6 flex flex-col gap-4 border-none shadow-xl shadow-black/5 hover:scale-[1.02] transition-transform cursor-default">
            <div className={`w-12 h-12 rounded-[18px] ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner`}>
              <stat.icon weight="fill" size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em] mb-1">{stat.name}</p>
               <p className="text-2xl font-[1000] text-black tracking-tighter">{stat.value}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ── Strategic Modules ── */}
      <section className="animate-fade-up" style={{ animationDelay: '0.25s' }}>
        <div className="flex items-center justify-between mb-6 px-4">
           <h3 className="text-[13px] font-[1000] text-black uppercase tracking-[0.2em]">Módulos de Control</h3>
           <div className="text-[11px] font-black text-ios-blue uppercase tracking-widest flex items-center gap-2">
              <ChartLineUp weight="bold" /> Real Time
           </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-2">
          {adminModules.map((module, i) => (
            <Link
              key={module.name}
              href={module.href}
              className="ios-glass-alt p-6 flex flex-col gap-4 hover:bg-black group transition-all duration-500 border-none relative overflow-hidden active:scale-95"
            >
              <div className={`w-12 h-12 rounded-2xl ${module.bg} flex items-center justify-center group-hover:bg-white/10 transition-colors`}>
                 <module.icon weight="fill" className={`${module.color} group-hover:text-white transition-colors`} size={24} />
              </div>
              <div className="relative z-10">
                <h4 className="text-lg font-[900] text-black tracking-tight group-hover:text-white mb-1 transition-colors">
                  {module.name}
                </h4>
                <p className="text-[12px] font-bold text-black/40 group-hover:text-white/40 transition-colors leading-tight">
                  {module.description}
                </p>
              </div>
              <div className="absolute bottom-4 right-4 text-black/5 group-hover:text-white/20 transition-colors">
                 <ArrowUpRight weight="bold" size={24} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Priority Alerts ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-up" style={{ animationDelay: '0.35s' }}>
        <div className="ios-card bg-ios-pink/5 p-8 flex items-center justify-between group active:scale-[0.98] transition-all border-none">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[28px] bg-white flex items-center justify-center shadow-xl group-hover:rotate-6 transition-transform">
               <WarningCircle weight="fill" size={32} className="text-ios-pink" />
            </div>
            <div>
               <p className="text-[11px] font-[1000] text-ios-pink uppercase tracking-widest mb-1">Mora Estratégica</p>
               <p className="text-4xl font-[1000] text-black tracking-tighter leading-none">{prestamosMora}</p>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-ios-pink/10 flex items-center justify-center text-ios-pink opacity-0 group-hover:opacity-100 transition-opacity">
             <TrendUp weight="bold" size={24} />
          </div>
        </div>

        <div className="ios-card bg-ios-yellow/5 p-8 flex items-center justify-between group active:scale-[0.98] transition-all border-none">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[28px] bg-white flex items-center justify-center shadow-xl group-hover:rotate-6 transition-transform">
               <Receipt weight="fill" size={32} className="text-ios-yellow" />
            </div>
            <div>
               <p className="text-[11px] font-[1000] text-ios-yellow uppercase tracking-widest mb-1">Validaciones</p>
               <p className="text-4xl font-[1000] text-black tracking-tighter leading-none">{pagosPendientes}</p>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-ios-yellow/10 flex items-center justify-center text-ios-yellow opacity-0 group-hover:opacity-100 transition-opacity">
             <ShieldCheck weight="bold" size={24} />
          </div>
        </div>
      </section>
    </div>
  );
}

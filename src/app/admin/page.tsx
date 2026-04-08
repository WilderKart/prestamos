import { createClient } from "@/utils/supabase/server";
import { 
  Users, 
  UserSquare2, 
  UserCircle2, 
  Wallet, 
  Receipt, 
  AlertCircle, 
  TrendingUp, 
  ArrowUpRight,
  RefreshCcw,
  Settings,
  ScrollText,
  CreditCard,
  LayoutDashboard
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalUsuarios },
    { count: totalCapitanes },
    { count: totalClientes },
    { data: prestamosActivos },
    { count: prestamosMora },
    { count: pagosPendientes },
  ] = await Promise.all([
    supabase.from("usuarios").select("id", { count: "exact", head: true }),
    supabase.from("usuarios").select("id", { count: "exact", head: true }).eq("rol", "CAPITAN"),
    supabase.from("clientes").select("id", { count: "exact", head: true }),
    supabase.from("prestamos").select("saldo_actual, monto").eq("estado", "ACTIVO"),
    supabase.from("prestamos").select("id", { count: "exact", head: true }).eq("estado", "EN_MORA"),
    supabase.from("pagos").select("id", { count: "exact", head: true }).eq("estado", "PENDIENTE_VALIDACION"),
  ]);

  const carteraTotal = prestamosActivos?.reduce((acc, curr) => acc + (curr.saldo_actual || 0), 0) || 0;
  const numPrestamosActivos = prestamosActivos?.length || 0;

  const stats = [
    { name: 'Total Usuarios', value: totalUsuarios || 0, icon: Users, color: 'text-white', bg: 'bg-black', rotate: '-rotate-3' },
    { name: 'Capitanes', value: totalCapitanes || 0, icon: UserSquare2, color: 'text-black', bg: 'bg-[#F5C518]', rotate: 'rotate-3' },
    { name: 'Clientes', value: totalClientes || 0, icon: UserCircle2, color: 'text-white', bg: 'bg-gray-800', rotate: '-rotate-6' },
    { name: 'Cartera Total', value: `$${carteraTotal.toLocaleString()}`, icon: TrendingUp, color: 'text-black', bg: 'bg-[#F5C518]', rotate: '-rotate-2' },
  ];

  const adminModules = [
    { name: "Préstamos", href: "/admin/prestamos", icon: Wallet, description: "Catálogo completo de créditos activos y finalizados.", accent: "emerald" },
    { name: "Pagos", href: "/admin/pagos", icon: Receipt, description: "Trazabilidad de cada reporte y aprobación de fondos.", accent: "blue" },
    { name: "Retanqueos", href: "/admin/retanqueos", icon: RefreshCcw, description: "Gestión de refinanciamientos y nuevos desembolsos.", accent: "purple" },
    { name: "Capitanes", href: "/admin/capitanes", icon: UserSquare2, description: "Administración de equipos de venta y comisiones.", accent: "amber" },
    { name: "Configuración", href: "/admin/configuracion", icon: Settings, description: "Ajuste de parámetros, tasas y límites del sistema.", accent: "stone" },
    { name: "Auditoría Logs", href: "/admin/logs", icon: ScrollText, description: "Historial de acciones críticas bajo Zero Trust.", accent: "slate" },
  ];

  return (
    <div className="space-y-12 animate-fade-in px-4 py-8">
      {/* Header Estilo Chation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-4">
            <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center shadow-2xl transform -rotate-3 text-[#F5C518]">
              <LayoutDashboard size={28} />
            </div>
            Overview <span className="text-[#F5C518]">Admin</span>
          </h1>
          <p className="mt-2 text-sm font-bold text-gray-400 uppercase tracking-widest leading-none">
            Control de Mando del Ecosistema Mivank
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/admin/usuarios"
            className="px-6 py-3 bg-white border border-gray-100 text-black text-sm font-black rounded-2xl hover:bg-gray-50 transition-all shadow-premium active:scale-95 flex items-center gap-2"
          >
            Gestión Usuarios
            <ArrowUpRight size={16} className="text-gray-300" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Principal */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="glass-card p-6 border-none shadow-premium hover:shadow-2xl transition-all duration-500 group"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center mb-6 shadow-lg transform ${stat.rotate} group-hover:rotate-0 transition-transform duration-500`}>
                <Icon className={`h-7 w-7 ${stat.color}`} />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{stat.name}</p>
              <p className="text-3xl font-black text-gray-900 tracking-tighter group-hover:text-black transition-colors">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Módulos de Gestión */}
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="h-0.5 w-12 bg-[#F5C518] rounded-full" />
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Módulos de Gestión</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminModules.map((module, i) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.name}
                href={module.href}
                className="glass-card p-8 border-none shadow-premium hover:bg-black group transition-all duration-500 relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors duration-500">
                    <Icon size={24} className="text-gray-400 group-hover:text-[#F5C518] transition-colors" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 group-hover:text-white mb-2 tracking-tight">
                    {module.name}
                  </h3>
                  <p className="text-sm font-medium text-gray-500 group-hover:text-gray-400 leading-relaxed">
                    {module.description}
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-[#F5C518] font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-500">
                    Explorar Módulo <ArrowUpRight size={14} />
                  </div>
                </div>
                {/* Indicador de acento visual */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5C518]/5 group-hover:bg-[#F5C518]/10 rounded-full blur-3xl -mr-16 -mt-16 transition-colors" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Estado Crítico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8 border-none shadow-premium bg-red-50/50 flex items-center justify-between group cursor-pointer hover:bg-red-500 transition-all duration-500">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg group-hover:bg-white/20 transition-colors">
              <AlertCircle size={32} className="text-red-600 group-hover:text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-red-600 group-hover:text-white mb-1">PRÉSTAMOS EN MORA</p>
              <p className="text-4xl font-black text-gray-900 group-hover:text-white tracking-tighter">{prestamosMora || 0}</p>
            </div>
          </div>
          <ArrowUpRight size={24} className="text-red-300 group-hover:text-white opacity-0 group-hover:opacity-100" />
        </div>

        <div className="glass-card p-8 border-none shadow-premium bg-[#F5C518]/5 flex items-center justify-between group cursor-pointer hover:bg-[#F5C518] transition-all duration-500">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg group-hover:bg-white/20 transition-colors">
              <Receipt size={32} className="text-[#F5C518] group-hover:text-black" />
            </div>
            <div>
              <p className="text-sm font-black text-[#F5C518] group-hover:text-black mb-1 text-orange-600">PAGOS POR VALIDAR</p>
              <p className="text-4xl font-black text-gray-900 group-hover:text-black tracking-tighter">{pagosPendientes || 0}</p>
            </div>
          </div>
          <ArrowUpRight size={24} className="text-[#F5C518] group-hover:text-black opacity-0 group-hover:opacity-100" />
        </div>
      </div>
    </div>
  );
}




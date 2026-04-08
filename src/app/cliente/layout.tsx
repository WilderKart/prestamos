import { createClient, requireAuth } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

import { 
  LayoutDashboard, 
  CreditCard,
  RefreshCcw,
  Bell,
  FileText,
  LogOut
} from "lucide-react";
import RealtimeSubscriber from "@/components/RealtimeSubscriber";
import ClientSidebar from "./ClientSidebar";

export default async function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAuth("CLIENTE");
  } catch {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get notifications count (unread)
  const { count: unreadCount } = await supabase
    .from("notificaciones")
    .select("*", { count: 'exact', head: true })
    .eq("usuario_id", user!.id)
    .eq("leida", false);

  const navLinks = [
    { href: "/cliente", label: "Dashboard", icon: LayoutDashboard },
    { href: "/cliente/solicitudes", label: "Mis Solicitudes", icon: FileText },
    { href: "/cliente/pago", label: "Reportar Pago", icon: CreditCard },
    { href: "/cliente/retanqueo", label: "Retanqueo", icon: RefreshCcw },
    { 
      href: "/cliente/notificaciones", 
      label: "Notificaciones", 
      icon: Bell,
      badge: unreadCount ? unreadCount : 0
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <RealtimeSubscriber role="CLIENTE" />
      {/* Mobile Header */}
      <div className="md:hidden bg-[#111111] text-white h-12 px-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-accent-yellow rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-xs">M</span>
          </div>
          <span className="font-bold text-sm tracking-tight">Mivank</span>
        </div>
        <Link href="/cliente/notificaciones" className="relative p-1.5 bg-zinc-800 rounded-lg">
          <Bell className="w-5 h-5" />
          {unreadCount && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center font-bold">{unreadCount}</span>
          )}
        </Link>
      </div>

      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 min-h-screen sticky top-0 z-10">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-200">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">Mivank <span className="text-blue-600">Cliente</span></span>
          </div>
        </div>

        <ClientSidebar navLinks={navLinks} initialCount={unreadCount || 0} />

        <div className="p-4 border-t border-gray-100">
          <form action={async () => {
            "use server";
            const { createClient } = await import("@/utils/supabase/server");
            const { redirect } = await import("next/navigation");
            const supabase = await createClient();
            await supabase.auth.signOut();
            redirect("/login");
          }}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
            >
              Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl overflow-hidden pb-20 md:pb-0">
        {children}
      </main>
      
      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#111111] px-2 pt-2 pb-6 flex items-center justify-around gap-1 z-50 border-t border-white/5">
        {navLinks.slice(0, 4).map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center gap-0.5 py-1 px-2 relative"
            >
              <Icon className="w-5 h-5 text-gray-400" />
              <span className="text-[10px] font-medium text-gray-500">{link.label.split(" ")[0]}</span>
              {link.badge && link.badge > 0 && (
                <span className="absolute -top-0.5 right-0 w-4 h-4 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center font-bold">{link.badge}</span>
              )}
            </Link>
          );
        })}
        <form
          action={async () => {
            "use server";
            const { createClient } = await import("@/utils/supabase/server");
            const { redirect } = await import("next/navigation");
            const supabase = await createClient();
            await supabase.auth.signOut();
            redirect("/login");
          }}
          className="flex flex-col items-center gap-0.5 py-1 px-2"
        >
          <button type="submit" className="p-0 border-0 bg-transparent cursor-pointer">
            <LogOut className="w-5 h-5 text-gray-400" />
          </button>
          <span className="text-[10px] font-medium text-gray-500">Salir</span>
        </form>
      </nav>
    </div>
  );
}

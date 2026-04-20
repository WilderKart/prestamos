export const dynamic = 'force-dynamic';

import { createClient, requireAuth } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

import { 
  Cards, 
  ArrowsClockwise,
  Bell,
  FileText,
  SignOut,
  UserCircle,
  House,
  ShieldCheck
} from "@phosphor-icons/react/dist/ssr";
import RealtimeSubscriber from "@/components/RealtimeSubscriber";
import ClientSidebar from "./ClientSidebar";
import ClientBottomNav from "./ClientBottomNav";

export default async function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userData: sessionUser, supabase } = await requireAuth("CLIENTE");

  // Get notifications count (unread)
  const { count: unreadCount } = await supabase
    .from("notificaciones")
    .select("*", { count: 'exact', head: true })
    .eq("usuario_id", sessionUser.id)
    .eq("leida", false);

  const navLinks = [
    { href: "/cliente", label: "Inicio", icon: House },
    { href: "/cliente/solicitudes", label: "Créditos", icon: FileText },
    { href: "/cliente/pago", label: "Pagos", icon: Cards },
    { href: "/cliente/retanqueo", label: "Cupos", icon: ArrowsClockwise },
    { 
      href: "/cliente/notificaciones", 
      label: "Alertas", 
      icon: Bell,
      badge: unreadCount ? unreadCount : 0
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row selection:bg-ios-blue selection:text-white">
      <RealtimeSubscriber role="CLIENTE" />
      
      {/* Mobile Top Header (Glass) */}
      <div className="md:hidden bg-white/80 backdrop-blur-xl h-16 px-6 flex items-center justify-between sticky top-0 z-[100] border-b border-black/[0.03]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-ios-blue rounded-xl flex items-center justify-center shadow-lg shadow-ios-blue/20">
            <span className="text-white font-black text-sm tracking-tighter">M</span>
          </div>
          <span className="font-[1000] text-lg text-black tracking-tighter">Mivank</span>
        </div>
        <div className="flex items-center gap-2">
           <Link href="/cliente/notificaciones" className="relative w-10 h-10 bg-black/[0.03] rounded-xl flex items-center justify-center text-black shadow-inner">
             <Bell weight="bold" size={20} />
             {unreadCount && unreadCount > 0 && (
               <span className="absolute top-2 right-2 w-2 h-2 bg-ios-pink rounded-full shadow-[0_0_8px_rgba(255,45,85,1)]" />
             )}
           </Link>
           <div className="w-10 h-10 bg-black/[0.03] rounded-xl flex items-center justify-center text-black/20">
              <UserCircle weight="fill" size={24} />
           </div>
        </div>
      </div>

      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-[300px] bg-white border-r border-black/[0.03] min-h-screen sticky top-0 z-10 p-10 space-y-12">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-ios-blue rounded-[20px] flex items-center justify-center shadow-2xl shadow-ios-blue/20">
            <span className="text-white font-black text-2xl tracking-tighter">M</span>
          </div>
          <div className="space-y-0.5">
             <span className="font-[1000] text-2xl text-black tracking-tighter leading-none block">Mivank</span>
             <span className="text-[11px] font-black uppercase text-ios-blue tracking-[0.2em] opacity-40">Client Matrix</span>
          </div>
        </div>

        <div className="flex-1 -mx-2">
           <ClientSidebar navLinks={navLinks} initialCount={unreadCount || 0} />
        </div>

        <div className="space-y-4">
           <div className="ios-glass-alt p-5 rounded-3xl border-none flex items-center gap-4">
              <div className="w-12 h-12 bg-ios-blue/10 rounded-2xl flex items-center justify-center text-ios-blue shadow-inner">
                 <ShieldCheck weight="fill" size={24} />
              </div>
              <div>
                 <p className="text-[13px] font-black text-black">Cifrado Militar</p>
                 <p className="text-[11px] font-bold text-black/30">Zero Trust Active</p>
              </div>
           </div>

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
               className="w-full flex items-center justify-center gap-3 px-6 py-5 text-[12px] font-black uppercase tracking-[0.2em] text-white bg-black rounded-3xl hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-black/10"
             >
               <SignOut weight="bold" size={20} />
               Sign Out Hub
             </button>
           </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        <div className="max-w-[1200px] mx-auto min-h-screen">
          {children}
        </div>
      </main>
      
      {/* Client-Side Bottom Navigation */}
      <ClientBottomNav navLinks={navLinks} />
    </div>
  );
}

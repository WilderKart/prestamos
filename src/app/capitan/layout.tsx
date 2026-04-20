export const dynamic = 'force-dynamic';

import { requireAuth } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DynamicHeader from "@/components/DynamicHeader";
import BottomNav from "@/components/BottomNav";
import SideNav from "@/components/SideNav";
import GlobalFAB from "@/components/GlobalFAB";
import RealtimeSubscriber from "@/components/RealtimeSubscriber";

export default async function CapitanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session;
  try {
    const auth = await requireAuth("CAPITAN");
    session = auth.userData;
  } catch {
    redirect("/login");
  }

  const navItems = [
    { name: "Resumen", href: "/capitan", icon: "ChartPieSlice" },
    { name: "Clientes", href: "/capitan/clientes", icon: "UsersThree" },
    { name: "Rutas", href: "/capitan/rutas", icon: "MapTrifold" },
    { name: "Pagos", href: "/capitan/pagos", icon: "Receipt" },
    { name: "Solicitudes", href: "/capitan/solicitudes", icon: "Note" },
  ];

  return (
    <div className="h-screen w-full bg-ios-bg flex font-sans selection:bg-ios-blue/30 selection:text-ios-blue overflow-hidden">
      <RealtimeSubscriber role="CAPITAN" />
      
      {/* Navegación lateral para escritorio - Anclaje Fijo */}
      <SideNav />

      {/* Área de visor central */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Cabecera Táctica - Anclaje Fijo */}
        <DynamicHeader title="Mivank" empresaId={session?.empresa_id || ""} />
        
        {/* Visor de Contenido con Scroll Independiente */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <main className="w-full max-w-[1600px] mx-auto relative z-10 pt-4 pb-40 px-3 md:px-6 xl:px-4">
            <div className="w-full h-full animate-in fade-in duration-500">
              {children}
            </div>
          </main>
          
          <GlobalFAB />
          <BottomNav items={navItems} />
        </div>
      </div>
    </div>
  );
}

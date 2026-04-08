import DynamicHeader from "@/components/DynamicHeader";
import BottomNav from "@/components/BottomNav";
import RealtimeSubscriber from "@/components/RealtimeSubscriber";
import { LayoutDashboard, Users, Receipt, FileText } from "lucide-react";

export default function CapitanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { name: "Resumen", href: "/capitan", icon: "LayoutDashboard" },
    { name: "Clientes", href: "/capitan/clientes", icon: "Users" },
    { name: "Pagos", href: "/capitan/pagos-pendientes", icon: "Receipt" },
    { name: "Solicitudes", href: "/capitan/solicitudes", icon: "FileText" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <RealtimeSubscriber role="CAPITAN" />
      
      <DynamicHeader title="Mivank" />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-4 relative z-10">
        {children}
      </main>

      <BottomNav items={navItems} />
    </div>
  );
}

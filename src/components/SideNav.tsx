"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ChartPieSlice, 
  UsersThree, 
  Receipt, 
  Note, 
  SignOut,
  Gear,
  CaretLeft,
  CaretRight,
  Wallet
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

interface NavItem {
  name: string;
  href: string;
  icon: any;
}

const navItems: NavItem[] = [
  { name: "Resumen", href: "/capitan", icon: ChartPieSlice },
  { name: "Clientes", href: "/capitan/clientes", icon: UsersThree },
  { name: "Cobradores", href: "/capitan/cobradores", icon: Note }, // Note is used for Solicitudes in layout, I'll use UsersThree for Clientes and ShieldCheck for Cobradores if possible
];

// Re-mapping for SideNav variety
const items = [
  { name: "Resumen", href: "/capitan", icon: ChartPieSlice },
  { name: "Clientes", href: "/capitan/clientes", icon: UsersThree },
  { name: "Cobradores", href: "/capitan/cobradores", icon: UserCircleIcon }, // I'll use correct names
  { name: "Pagos", href: "/capitan/pagos-pendientes", icon: Receipt },
  { name: "Solicitudes", href: "/capitan/solicitudes", icon: Note },
];

import { UserCircle as UserCircleIcon } from "@phosphor-icons/react";

export default function SideNav() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const supabase = createClient();

  // Load persistence
  useEffect(() => {
    const saved = localStorage.getItem("mivank-sidebar-collapsed");
    if (saved) setIsCollapsed(saved === "true");
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("mivank-sidebar-collapsed", String(newState));
  };

  const handleLogout = async () => {
    if (confirm("¿Finalizar Sesión?")) {
      await supabase.auth.signOut();
      window.location.href = "/login";
    }
  };

  const menuItems = [
    { name: "Dashboard", href: "/capitan", icon: ChartPieSlice },
    { name: "Clientes", href: "/capitan/clientes", icon: UsersThree },
    { name: "Cobradores", href: "/capitan/cobradores", icon: UserCircleIcon },
    { name: "Pagos", href: "/capitan/pagos-pendientes", icon: Receipt },
    { name: "Solicitudes", href: "/capitan/solicitudes", icon: Note },
    { name: "Configuración", href: "/capitan/configuracion", icon: Gear },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 100 : 280 }}
      className="hidden md:flex flex-col h-screen sticky top-0 bg-white border-r border-black/[0.03] z-[110] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
    >
      {/* Header / Logo */}
      <div className="p-6 h-[80px] flex items-center justify-between">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="logo-full"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-3 overflow-hidden whitespace-nowrap"
            >
              <div className="w-10 h-10 rounded-xl bg-ios-blue flex items-center justify-center text-white shadow-lg shadow-ios-blue/20">
                <Wallet weight="fill" size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-[1000] tracking-tighter text-black">Mivank</span>
                <span className="text-[9px] font-black text-ios-blue uppercase tracking-widest opacity-40">Matrix Enclave</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="logo-collapsed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mx-auto"
            >
              <div className="w-10 h-10 rounded-xl bg-ios-blue flex items-center justify-center text-white shadow-lg shadow-ios-blue/20">
                <Wallet weight="fill" size={24} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/capitan" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center h-12 rounded-xl transition-all relative overflow-hidden ${
                isActive 
                  ? "bg-ios-blue text-white shadow-lg shadow-ios-blue/20" 
                  : "text-black/40 hover:bg-black/[0.03] hover:text-black"
              }`}
            >
              <div className={`flex items-center justify-center min-w-[60px] h-full ${isCollapsed ? 'mx-auto' : ''}`}>
                <Icon weight={isActive ? "fill" : "bold"} size={24} />
              </div>
              
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[14px] font-bold tracking-tight"
                >
                  {item.name}
                </motion.span>
              )}

              {/* Collapsed Tooltip (Simple pure CSS version or Framer) */}
              {isCollapsed && (
                <div className="absolute left-[80px] px-3 py-2 bg-black text-white text-[11px] font-bold rounded-xl opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none z-50 whitespace-nowrap shadow-xl">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-black/[0.03]">
        <button
          onClick={handleLogout}
          className={`flex items-center h-14 rounded-2xl w-full text-ios-pink hover:bg-ios-pink/10 transition-all group overflow-hidden ${isCollapsed ? 'justify-center' : 'px-4 gap-4'}`}
        >
          <div className="min-w-[40px] flex items-center justify-center">
            <SignOut weight="fill" size={24} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
          {!isCollapsed && <span className="text-[14px] font-black uppercase tracking-widest">Salir</span>}
          
          {isCollapsed && (
            <div className="absolute left-[80px] px-3 py-2 bg-ios-pink text-white text-[11px] font-bold rounded-xl opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none z-50 whitespace-nowrap shadow-xl">
              Cerrar Sesión
            </div>
          )}
        </button>

        {/* Collapse Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="mt-4 flex items-center justify-center h-8 w-full text-black/20 hover:text-black/40 transition-colors"
        >
          {isCollapsed ? <CaretRight weight="bold" size={16} /> : <div className="flex items-center gap-2"><CaretLeft weight="bold" size={16} /><span className="text-[10px] font-black uppercase tracking-widest">Colapsar</span></div>}
        </button>
      </div>
    </motion.aside>
  );
}

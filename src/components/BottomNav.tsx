"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ChartPieSlice, 
  UsersThree, 
  Receipt, 
  Note, 
  SignOut,
  Gear,
  SquaresFour,
  UserCircle,
  MapTrifold
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

const IconMap: Record<string, any> = {
  ChartPieSlice,
  UsersThree,
  Receipt,
  Note,
  MapTrifold,
  Gear
};

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

export default function BottomNav({ items = [] }: { items?: NavItem[] }) {
  const pathname = usePathname();
  const supabase = createClient();

  const handleLogout = async () => {
    if (confirm("¿Finalizar Sesión?")) {
      await supabase.auth.signOut();
      window.location.href = "/login";
    }
  };

  // Enforce consistent items for mobile
  const mobileItems = [
    ...items,
    { name: "Cconfig", href: "/capitan/configuracion", icon: "Gear" }
  ];

  return (
    <div 
      id="bottom-nav" 
      className="fixed bottom-0 w-full z-20 bg-white border-t border-black/5 shadow-lg md:hidden"
    >
      <nav 
        className="flex items-center justify-around h-[76px] relative overflow-hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)', height: 'calc(76px + env(safe-area-inset-bottom))' }}
      >
        
        {mobileItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/capitan" && pathname.startsWith(item.href));
          const Icon = IconMap[item.icon] || ChartPieSlice;
          const label = item.name === "Resumen" ? "Inicio" : 
                        item.name === "Pagos" ? "Pagos" :
                        item.name === "Cconfig" ? "Ajustes" : item.name;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center h-full px-2 min-w-[64px] transition-all duration-300 ${isActive ? "text-ios-blue" : "text-black/30"}`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? "bg-ios-blue/5 scale-110" : "group-active:scale-90"}`}>
                <Icon 
                  weight={isActive ? "fill" : "bold"} 
                  size={24}
                />
              </div>
              
              {isActive && (
                <motion.div 
                  layoutId="bottom-nav-active"
                  className="absolute -bottom-1 w-1 h-1 bg-ios-blue rounded-full shadow-[0_0_8px_rgba(0,122,255,0.8)]"
                />
              )}
            </Link>
          );
        })}

        <div className="h-8 w-[1px] bg-black/[0.05] mx-1" />

        <button 
          onClick={handleLogout}
          className="w-[54px] h-[54px] flex items-center justify-center text-ios-pink active:scale-90 transition-all"
          title="Salir"
        >
          <div className="bg-ios-pink/10 p-2.5 rounded-2xl">
            <SignOut weight="fill" size={24} />
          </div>
        </button>
      </nav>
    </div>
  );
}

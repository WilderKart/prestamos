"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { 
  SquaresFour, 
  Users, 
  UserSquare, 
  UserGear, 
  Wallet, 
  Receipt, 
  ArrowsCounterClockwise, 
  Gear, 
  Scroll,
  SignOut,
  CircleNotch
} from "@phosphor-icons/react";
import { logout } from "@/app/actions/logout";
import { motion } from "framer-motion";

const navLinks = [
  { href: "/admin", label: "Overview", icon: SquaresFour },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin/capitanes", label: "Capitanes", icon: UserSquare },
  { href: "/admin/clientes", label: "Clientes", icon: UserGear },
  { href: "/admin/prestamos", label: "Préstamos", icon: Wallet },
  { href: "/admin/pagos", label: "Pagos", icon: Receipt },
  { href: "/admin/retanqueos", label: "Retanqueos", icon: ArrowsCounterClockwise },
  { href: "/admin/configuracion", label: "Configuración", icon: Gear },
  { href: "/admin/logs", label: "Logs Auditoría", icon: Scroll },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      router.push("/login");
    }
  };

  return (
    <nav className="flex-1 px-4 space-y-2 overflow-y-auto pb-6">
      <div className="mb-6 mt-4 px-3 flex items-center justify-between">
        <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.4em] leading-none">Access Control</p>
        <div className="w-1.5 h-1.5 bg-ios-green rounded-full shadow-[0_0_8px_rgba(52,199,89,0.5)] animate-pulse" />
      </div>

      <div className="space-y-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-4 px-4 py-3 text-[14px] font-bold rounded-2xl transition-all relative group ${
                isActive
                  ? "bg-black text-white shadow-xl shadow-black/10"
                  : "text-black/40 hover:text-black hover:bg-black/[0.03]"
              }`}
            >
              <Icon 
                weight={isActive ? "fill" : "bold"} 
                className={`w-5 h-5 transition-transform group-active:scale-90 ${
                  isActive ? "text-ios-blue" : ""
                }`} 
              />
              <span className="tracking-tight">{link.label}</span>
              
              {isActive && (
                <motion.div 
                  layoutId="sidebar-pill"
                  className="absolute right-3 w-1.5 h-1.5 bg-ios-blue rounded-full"
                />
              )}
            </Link>
          );
        })}
      </div>
      
      <div className="pt-6 mt-6 border-t border-black/[0.03]">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-4 px-4 py-3.5 text-[14px] font-bold rounded-2xl transition-all w-full text-ios-pink hover:bg-ios-pink/5 disabled:opacity-50 active:scale-95 group"
        >
          {isLoggingOut ? (
            <CircleNotch className="w-5 h-5 animate-spin" weight="bold" />
          ) : (
            <SignOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" weight="bold" />
          )}
          <span>{isLoggingOut ? "Cerrando..." : "Sign Out"}</span>
        </button>
      </div>
    </nav>
  );
}

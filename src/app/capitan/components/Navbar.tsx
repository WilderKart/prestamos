"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  House, 
  Users, 
  ShieldCheck, 
  Receipt, 
  SignOut,
  Wallet
} from "@phosphor-icons/react";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { name: "Inicio", href: "/capitan", icon: House },
  { name: "Clientes", href: "/capitan/clientes", icon: Users },
  { name: "Cobradores", href: "/capitan/cobradores", icon: ShieldCheck },
  { name: "Pagos", href: "/capitan/pagos-pendientes", icon: Receipt },
];

export default function Navbar() {
  const pathname = usePathname();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const isActive = (href: string) => {
    if (href === "/capitan") return pathname === "/capitan";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* ── Desktop Sidebar/Top (Minimal & Glass) ── */}
      <nav className="hidden md:block fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl">
        <div className="ios-glass rounded-[24px] px-6 h-16 flex items-center justify-between shadow-2xl shadow-black/5 border border-white/40 backdrop-blur-xl bg-white/70">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div className="flex items-center gap-3 pr-6 border-r border-black/5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Wallet weight="fill" className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-black tracking-tight">Mivank</span>
            </div>

            {/* Nav Items */}
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative flex items-center gap-2 px-5 py-2 rounded-2xl text-[14px] font-bold transition-all ${
                      active ? "text-blue-600" : "text-gray-500 hover:text-black hover:bg-black/5"
                    }`}
                  >
                    <Icon weight={active ? "fill" : "bold"} size={20} />
                    {item.name}
                    {active && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-blue-600/5 rounded-2xl -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-3 text-gray-500 hover:text-red-500 rounded-2xl hover:bg-red-500/5 transition-all"
          >
            <SignOut weight="bold" size={22} />
          </button>
        </div>
      </nav>

      {/* ── Mobile Tab Bar (The Real iOS Feel) ── */}
      <div className="md:hidden fixed bottom-8 left-6 right-6 z-50">
        <div className="ios-glass rounded-[32px] px-2 py-2 flex items-center justify-around shadow-2xl shadow-black/10 border border-white/50 backdrop-blur-xl bg-white/70">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex flex-col items-center gap-1.5 px-5 py-2.5 rounded-2xl transition-all ${
                  active ? "text-blue-600" : "text-gray-500"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="mobile-nav-pill-bg"
                    className="absolute inset-0 bg-blue-600/5 rounded-[22px]"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <Icon weight={active ? "fill" : "bold"} size={24} className="relative z-10" />
                <span className="text-[10px] font-bold relative z-10">{item.name}</span>
              </Link>
            );
          })}
          
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1.5 px-5 py-2.5 text-gray-500 hover:text-red-500"
          >
            <SignOut weight="bold" size={24} />
            <span className="text-[10px] font-bold">Salir</span>
          </button>
        </div>
      </div>
      
      {/* Spacer to avoid content being hidden behind navbar */}
      <div className="md:hidden h-28" />
      <div className="hidden md:block h-24" />
    </>
  );
}

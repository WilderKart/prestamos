"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Receipt,
  LogOut,
  Menu,
  X,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { name: "Resumen", href: "/capitan", icon: LayoutDashboard },
  { name: "Clientes", href: "/capitan/clientes", icon: Users },
  { name: "Pagos Pendientes", href: "/capitan/pagos-pendientes", icon: Receipt },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      {/* ── Desktop Top Navbar ── */}
      <nav className="hidden md:block bg-mivank-card border-b border-mivank-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-12">
            <div className="flex items-center">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-mivank-accent flex items-center justify-center shadow-lg shadow-mivank-accent/20">
                  <Wallet className="w-5 h-5 text-mivank-bg" />
                </div>
                <span className="text-xl font-bold text-mivank-text tracking-tight">
                  Mivank
                </span>
              </div>

              {/* Desktop Nav Items */}
              <div className="ml-10 flex space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? "bg-mivank-accent/10 text-mivank-accent"
                          : "text-mivank-text-secondary hover:text-mivank-text hover:bg-mivank-elevated"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                      {active && (
                        <motion.div
                          layoutId="desktop-active-pill"
                          className="absolute inset-0 rounded-xl bg-mivank-accent/10 -z-10"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="p-2.5 text-mivank-text-muted hover:text-mivank-danger rounded-xl hover:bg-mivank-elevated transition-all"
                title="Cerrar Sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile Top Bar (minimal) ── */}
      <div className="md:hidden bg-mivank-card border-b border-mivank-border sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-mivank-accent flex items-center justify-center">
              <Wallet className="w-4 h-4 text-mivank-bg" />
            </div>
            <span className="text-lg font-bold text-mivank-text">Mivank</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-mivank-text-muted hover:text-mivank-danger rounded-lg"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Mobile Bottom Navigation (pill style like reference) ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
        <div className="bg-mivank-card border border-mivank-border rounded-2xl shadow-2xl shadow-black/40 px-2 py-2 flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                  active
                    ? "text-mivank-bg"
                    : "text-mivank-text-muted"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="mobile-nav-pill"
                    className="absolute inset-0 bg-mivank-accent rounded-xl"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <Icon className="w-5 h-5 relative z-10" />
                <span className="text-[10px] font-semibold relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

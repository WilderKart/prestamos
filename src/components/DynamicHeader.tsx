"use client";

import { usePathname } from "next/navigation";
import { 
  CaretLeft, 
  Bell, 
  ChatCircleText,
  MagnifyingGlass,
  X,
  UserCircle
} from "@phosphor-icons/react";
import Link from "next/link";
import { useSearch } from "./SearchProvider";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationBell from "./notifications/NotificationBell";

export default function DynamicHeader({ title, empresaId }: { title: string, empresaId: string }) {
  const pathname = usePathname();
  const { searchQuery, setSearchQuery, isSearchOpen, toggleSearch } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const isHome = pathname === "/capitan";

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  return (
    <header className="ios-glass bg-white/70 border-b border-black/[0.03] text-black h-[76px] px-4 sticky top-0 z-[100] w-full flex items-center justify-center">
      <div className="max-w-[1400px] w-full flex items-center justify-between relative">
        
        {/* Left Side: Back or Logo */}
        <div className="flex items-center gap-4 flex-1">
          <AnimatePresence mode="wait">
            {!isSearchOpen ? (
              <motion.div 
                key="logo"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3"
              >
                {!isHome ? (
                  <Link 
                    href="/capitan"
                    className="h-11 w-11 bg-black/[0.03] hover:bg-black/10 rounded-2xl flex items-center justify-center transition-all active:scale-90 text-black border border-white"
                  >
                    <CaretLeft weight="bold" size={20} />
                  </Link>
                ) : (
                  <div className="w-11 h-11 bg-ios-blue rounded-[14px] flex items-center justify-center text-white shadow-xl shadow-ios-blue/30 rotate-3 font-[1000] text-xl border-2 border-white">
                    M
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-[18px] font-[1000] tracking-tighter leading-none">{title}</span>
                  <span className="text-ios-blue font-black tracking-[0.2em] text-[9px] uppercase opacity-40">Matrix Enclave</span>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Search Expanded State */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 flex items-center gap-4 bg-white/95 backdrop-blur-3xl z-50 px-2"
            >
              <div className="flex-1 relative group">
                <div className="absolute inset-0 bg-black/[0.04] rounded-[22px] transition-all group-focus-within:bg-black/5" />
                <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-ios-blue" size={20} weight="bold" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar clientes, cobros o rutas..."
                  className="w-full bg-transparent border-none py-4 pl-12 pr-12 text-[16px] font-bold tracking-tight transition-all outline-none text-black relative z-10"
                />
                {searchQuery && (
                   <button 
                     onClick={() => setSearchQuery('')}
                     className="absolute right-4 top-1/2 -translate-y-1/2 text-black/20 hover:text-black z-20 p-2 bg-black/[0.05] rounded-full"
                   >
                      <X weight="bold" size={12} />
                   </button>
                )}
              </div>
              <button 
                onClick={toggleSearch}
                className="pr-2 text-[14px] font-[800] text-ios-blue active:opacity-50 transition-opacity"
              >
                Cancelar
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {!isSearchOpen && (
              <motion.div 
                key="actions"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                 <button 
                    onClick={toggleSearch}
                    className="h-12 w-12 hover:bg-black/5 rounded-2xl flex items-center justify-center transition-all active:scale-90 relative group"
                 >
                    <div className="absolute inset-0 bg-black/[0.02] group-hover:bg-black/[0.05] rounded-2xl transition-colors" />
                    <MagnifyingGlass weight="bold" size={24} className="text-black/70 relative z-10" />
                 </button>
                 <NotificationBell empresaId={empresaId} />
                 <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-xl border border-white/10 active:scale-90 transition-transform">
                    <UserCircle weight="fill" size={32} />
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </header>
  );
}

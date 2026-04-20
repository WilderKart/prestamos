"use client";

import { useState, useRef, useEffect } from "react";
import { Bell } from "@phosphor-icons/react";
import NotificationBadge from "./NotificationBadge";
import NotificationPanel from "./NotificationPanel";
import { AnimatePresence } from "framer-motion";

export default function NotificationBell({ empresaId }: { empresaId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={bellRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 w-12 hover:bg-black/5 rounded-2xl flex items-center justify-center transition-all active:scale-90 group relative"
      >
        <div className={`absolute inset-0 rounded-2xl transition-colors ${isOpen ? "bg-black/5" : "bg-black/[0.02] group-hover:bg-black/[0.05]"}`} />
        <Bell weight={isOpen ? "fill" : "bold"} size={24} className={`relative z-10 transition-colors ${isOpen ? "text-ios-blue" : "text-black/70"}`} />
        <NotificationBadge />
      </button>

      <AnimatePresence>
        {isOpen && (
          <NotificationPanel 
            onClose={() => setIsOpen(false)} 
            empresaId={empresaId}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

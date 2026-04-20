"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "@phosphor-icons/react";

interface IosModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export default function IosModal({ 
  isOpen, 
  onClose, 
  children, 
  title, 
  subtitle,
  icon 
}: IosModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isOpen]);

  // Support ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[500] flex items-end justify-center pointer-events-none">
          {/* Backdrop (Solid Overlay) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 pointer-events-auto"
          />

          {/* Bottom Sheet (Solid Content) */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 w-full max-w-2xl bg-white rounded-t-3xl z-50 shadow-xl pointer-events-auto flex flex-col max-h-[92vh] overflow-hidden"
          >
            {/* Handle Indicator */}
            <div className="w-full flex justify-center pt-3 pb-1 shrink-0">
               <div className="w-12 h-1.5 bg-black/10 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-black/[0.03] shrink-0">
               <div className="flex items-center gap-4">
                  {icon && (
                    <div className="w-12 h-12 bg-ios-blue text-white rounded-2xl flex items-center justify-center shadow-lg shadow-ios-blue/20">
                      {icon}
                    </div>
                  )}
                  <div>
                    {title && <h2 className="text-xl font-[1000] text-black tracking-tighter leading-none">{title}</h2>}
                    {subtitle && <p className="text-[11px] font-bold text-ios-blue mt-1 uppercase tracking-widest">{subtitle}</p>}
                  </div>
               </div>
               <button 
                 onClick={onClose}
                 className="w-10 h-10 bg-black/5 rounded-full flex items-center justify-center text-black/40 hover:bg-black/10 transition-colors"
               >
                 <X weight="bold" size={18} />
               </button>
            </div>

            {/* Content Area with Safe Area and extra padding */}
            <div className="flex-1 overflow-y-auto px-6 pt-6 pb-[calc(env(safe-area-inset-bottom)+100px)]">
               {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

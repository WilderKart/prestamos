"use client";

import { CircleNotch } from "@phosphor-icons/react";
import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[70vh] animate-fade-up">
      <div className="flex flex-col items-center gap-8">
        <div className="relative">
          {/* iOS Style Spinner Container */}
          <div className="w-24 h-24 rounded-[40px] bg-white shadow-2xl shadow-black/5 flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-ios-blue/5 to-transparent opacity-50" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="text-ios-blue relative z-10"
            >
              <CircleNotch weight="bold" size={48} />
            </motion.div>
          </div>
          
          {/* Decorative floating dots */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute -top-4 -right-4 w-10 h-10 bg-ios-yellow/20 rounded-full blur-xl" 
          />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-[14px] font-[900] text-black uppercase tracking-[5px] opacity-80">Mivank OS</h2>
          <p className="text-[12px] font-bold text-ios-gray uppercase tracking-widest animate-pulse">Sincronizando Activos...</p>
        </div>
      </div>
    </div>
  );
}

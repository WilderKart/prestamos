"use client";

import { motion } from "framer-motion";
import { Check, Clock, Play } from "@phosphor-icons/react";

interface Step {
  id: string;
  estado: "completado" | "pendiente" | "activo";
}

interface MissionProgressBarProps {
  steps: Step[];
}

export default function MissionProgressBar({ steps }: MissionProgressBarProps) {
  return (
    <div className="w-full px-6 py-4 ios-glass border-none rounded-[32px] mb-8">
      <div className="relative flex items-center justify-between">
        {/* Background Connector Line */}
        <div className="absolute left-0 right-0 h-0.5 bg-black/[0.05] top-1/2 -translate-y-1/2 -z-10" />
        
        {steps.map((step, idx) => (
          <div key={step.id} className="relative flex flex-col items-center">
            <motion.div
              initial={false}
              animate={{
                scale: step.estado === "activo" ? 1.2 : 1,
                backgroundColor: 
                  step.estado === "completado" ? "#34C759" : 
                  step.estado === "activo" ? "#007AFF" : 
                  "#E5E5EA"
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-colors border-4 border-white`}
            >
              {step.estado === "completado" ? (
                <Check weight="bold" size={14} className="text-white" />
              ) : step.estado === "activo" ? (
                <Play weight="fill" size={12} className="text-white animate-pulse" />
              ) : (
                <Clock weight="bold" size={14} className="text-black/20" />
              )}
            </motion.div>
            
            {/* Index label (optional, minimalist) */}
            <span className={`text-[9px] font-black mt-2 uppercase tracking-widest ${
              step.estado === "activo" ? "text-ios-blue" : "text-black/20"
            }`}>
              {idx + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

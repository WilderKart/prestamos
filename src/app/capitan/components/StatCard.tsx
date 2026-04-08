"use client";

import { LucideIcon, TrendingUp, AlertCircle, Users, Wallet } from "lucide-react";
import { motion } from "framer-motion";

const IconMap: Record<string, LucideIcon> = {
  TrendingUp,
  AlertCircle,
  Users,
  Wallet
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string; // Changed to string for serialization
  variant?: "white" | "black";
  trend?: string;
  trendType?: "up" | "down";
}

export default function StatCard({ 
  label, 
  value, 
  icon, 
  variant = 'white',
  trend,
  trendType = 'up'
}: StatCardProps) {
  const isBlack = variant === 'black';
  const Icon = IconMap[icon] || TrendingUp; // Fallback

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className={`card-premium p-6 flex flex-col gap-4 min-h-[160px] ${
        isBlack ? 'bg-header text-white' : 'bg-white text-gray-900 border-none'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-2xl ${
          isBlack ? 'bg-zinc-800 text-accent-yellow' : 'bg-gray-50 text-header'
        }`}>
          <Icon className="w-6 h-6" />
        </div>
        
        {trend && (
           <span className={`text-xs font-bold px-2 py-1 rounded-full ${
             isBlack ? 'bg-zinc-800 text-accent-green' : 'bg-green-50 text-green-600'
           }`}>
             {trendType === 'up' ? '★' : '▾'} {trend}
           </span>
        )}
      </div>

      <div>
        <p className={`text-sm font-medium ${isBlack ? 'text-zinc-400' : 'text-zinc-500'}`}>
          {label}
        </p>
        <p className="text-2xl font-black mt-1 tracking-tight">
          {value}
        </p>
      </div>
    </motion.div>
  );
}

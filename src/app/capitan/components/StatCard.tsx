"use client";

import { 
  ArrowUp, 
  ArrowDown, 
  TrendUp, 
  TrendDown, 
  WarningCircle,
  ChartLineUp,
  Vault,
  Wallet,
  Warning,
  Money,
  CheckCircle,
  ChartBar
} from "@phosphor-icons/react";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string;
  icon: 'Wallet' | 'AlertCircle' | 'TrendingUp' | 'ChartBar' | string;
  trend?: string;
  trendType?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'red' | 'green' | 'purple' | 'black';
  onClick?: () => void;
}

export default function StatCard({ label, value, icon, trend, trendType = "neutral", color = 'black', onClick }: StatCardProps) {
  const isUp = trendType === 'up';

  const colorConfig = {
    blue: "text-ios-blue bg-ios-blue/10",
    red: "text-ios-pink bg-ios-pink/10",
    green: "text-ios-green bg-ios-green/10",
    purple: "text-ios-purple bg-ios-purple/10",
    black: "text-black bg-black/5"
  };

  const IconMap: Record<string, any> = {
    'Wallet': Wallet,
    'AlertCircle': Warning,
    'TrendingUp': TrendUp,
    'ChartBar': ChartBar,
    'Money': Money
  };

  const IconComponent = IconMap[icon] || Vault;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`ios-card bg-white p-4 relative overflow-hidden group transition-all duration-300 ${onClick ? 'cursor-pointer hover:shadow-xl active:scale-95' : ''}`}
    >
      <div className="relative z-10 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl transition-all duration-300 ${colorConfig[color]} group-hover:scale-110`}>
             <IconComponent size={18} weight="fill" />
          </div>
          <p className="text-[9px] font-black text-black/30 uppercase tracking-[0.2em]">{label}</p>
        </div>
        
        <div className="flex flex-col">
          <h3 className="text-xl md:text-2xl font-[1000] text-black tracking-tighter leading-none">{value}</h3>
          {trend && (
            <div className="flex items-center gap-1 mt-1.5">
              <span className={`text-[9px] font-black uppercase tracking-tighter ${isUp ? 'text-ios-green' : 'text-ios-pink'}`}>
                {trend}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Indicador táctico si es clicable */}
      {onClick && (
        <div className="absolute top-4 right-4 text-black/5 group-hover:text-black/20 transition-colors">
          <ArrowUp size={12} className="rotate-45" weight="bold" />
        </div>
      )}

      {/* Background Glow */}
      <div className={`absolute -bottom-4 -right-4 w-12 h-12 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity ${colorConfig[color]}`} />
    </motion.div>
  );
}

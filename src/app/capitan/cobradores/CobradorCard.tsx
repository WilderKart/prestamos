"use client";

import { motion } from "framer-motion";
import { 
  Phone, 
  EnvelopeSimple, 
  IdentificationCard 
} from "@phosphor-icons/react";
import CobradorCardActions from "./CobradorCardActions";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/utils/format";

interface CobradorCardProps {
  cobrador: any; // Incluye metricas: { clientes, capital, mora, efectividad }
  index: number;
}

export default function CobradorCard({ cobrador, index }: CobradorCardProps) {
  const router = useRouter();
  const metricas = cobrador.metricas || { clientes: 0, capital: 0, mora: 0, efectividad: 0 };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="ios-glass-alt border-none p-6 rounded-[36px] shadow-2xl shadow-black/5 relative overflow-hidden group hover:bg-white transition-all"
    >
      {/* 1. Header: Profile and Actions */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-black text-white rounded-[22px] flex items-center justify-center text-xl font-black shadow-2xl border-4 border-white/5">
            {cobrador.nombre.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-0.5">
            <h3 className="text-[19px] font-[1000] text-black tracking-tighter leading-tight">
              {cobrador.nombre}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em]">Cobrador</span>
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                cobrador.estado === 'ACTIVO' ? 'bg-ios-green/10 text-ios-green' : 'bg-ios-pink/10 text-ios-pink'
              }`}>
                {cobrador.estado}
              </span>
            </div>
          </div>
        </div>
        
        <div className="no-nav">
          <CobradorCardActions cobrador={cobrador} />
        </div>
      </div>

      {/* 2. Real Info Rows */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3 text-black/40">
            <div className="w-8 h-8 rounded-xl bg-ios-blue/5 flex items-center justify-center text-ios-blue">
              <EnvelopeSimple weight="fill" size={16} />
            </div>
            <span className="text-[13px] font-bold tracking-tight truncate max-w-[140px] lowercase">
              {cobrador.email}
            </span>
          </div>
          <span className="text-[15px] font-[1000] text-black tracking-tighter">
            {formatCurrency(metricas.capital)}
          </span>
        </div>

        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3 text-black/40">
            <div className="w-8 h-8 rounded-xl bg-ios-blue/5 flex items-center justify-center text-ios-blue">
              <Phone weight="fill" size={16} />
            </div>
            <span className="text-[12px] font-bold tracking-tight uppercase">
              {metricas.clientes > 0 ? "Terminal Conectada" : "Sin Actividad"}
            </span>
          </div>
          <span className="text-[11px] font-black text-ios-green uppercase tracking-widest">
            +{metricas.clientes} Clientes
          </span>
        </div>
      </div>

      {/* 3. Portfolio & Mora (The Large Section from Screenshot 3) */}
      <div className="bg-black/[0.02] rounded-[28px] p-5 flex items-center justify-between border border-black/[0.03]">
        <div className="space-y-1">
          <p className="text-[22px] font-[1000] text-black tracking-tighter leading-none">
            {formatCurrency(metricas.capital)}
          </p>
          <p className="text-[10px] font-black text-ios-green uppercase tracking-widest">
            +{metricas.clientes} Clientes
          </p>
        </div>

        <div className="h-10 w-[1px] bg-black/5 mx-4" />

        <div className="flex-1 space-y-1 text-right pr-4">
          <p className="text-[18px] font-[1000] text-ios-blue tracking-tighter leading-none">
            {formatCurrency(metricas.mora)}
          </p>
          <p className="text-[9px] font-black text-black/30 uppercase tracking-[0.1em]">
            Mora Recaudable
          </p>
        </div>

        <button 
          onClick={() => router.push(`/capitan/cobradores/${cobrador.id}`)}
          className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-black/[0.03] active:scale-90 transition-transform no-nav"
          title="Ver Expediente Completo"
        >
          <IdentificationCard weight="fill" size={24} className="text-black/20" />
        </button>
      </div>

      {/* Decorative Background Glow */}
      <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-ios-blue/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}

"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import StatCard from "./StatCard";
import { Receipt, Gear, Vault } from "@phosphor-icons/react";
import Link from "next/link";
import { MetricSkeleton, CalendarSkeleton, RadarSkeleton } from './DashboardSkeletons';
import { formatCurrency } from "@/utils/format";

// Importaciones dinámicas seguras para el cliente (Modo Dios)
const CalendarioFinanciero = dynamic(() => import("@/components/dashboard/CalendarioFinanciero"), { 
  ssr: false,
  loading: () => <CalendarSkeleton />
});

const GlobalRadarClient = dynamic(() => import("../mapa-global/GlobalRadarClient"), { 
  ssr: false,
  loading: () => <RadarSkeleton />
});

const PanelMora = dynamic(() => import("@/components/dashboard/PanelMora"), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-50 animate-pulse rounded-[40px]" />
});

interface DashboardCockpitProps {
  metrics: {
    carteraActiva: number;
    totalRecuperado: number;
    totalPrestamos: number;
  };
}

export default function DashboardCockpit({ metrics }: DashboardCockpitProps) {
  return (
    <div className="flex flex-col gap-6 xl:gap-8">
      
      {/* ── Dashboard Hero (Compacto) ── */}
      <section className="animate-fade-up">
        <div className="relative h-[160px] md:h-[120px] w-full rounded-[30px] md:rounded-[40px] bg-gradient-to-br from-[#000] to-[#222] overflow-hidden shadow-2xl border border-white/5">
          <div className="relative z-10 h-full p-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-ios-blue flex items-center justify-center text-white shadow-lg shadow-ios-blue/20">
                <Vault weight="fill" size={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest leading-none mb-1">Capital en Mercado</p>
                <h2 className="text-2xl md:text-3xl font-[1000] text-white tracking-tighter">
                  {formatCurrency(metrics.carteraActiva)}
                </h2>
              </div>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <Link href="/capitan/clientes" className="flex-1 md:flex-none bg-ios-blue text-white px-8 h-12 rounded-[20px] flex items-center justify-center gap-3 font-bold text-sm hover:scale-105 transition-all">
                PAGO RÁPIDO
              </Link>
              <div className="hidden lg:flex flex-col items-end text-right">
                 <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Total Operaciones</p>
                 <p className="text-xl font-black text-white">{metrics.totalPrestamos}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Malla Táctica 7/5 ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8">
        
        {/* COLUMNA IZQUIERDA (7) */}
        <div className="xl:col-span-7 space-y-6 md:space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <StatCard label="Cartera" value={formatCurrency(metrics.carteraActiva)} icon="Wallet" color="blue" />
            <StatCard label="Mora" value="$ 0" icon="AlertCircle" color="red" trend="Atención" />
            <StatCard label="Hoy" value={formatCurrency(metrics.totalRecuperado)} icon="TrendingUp" color="green" trend="+12%" trendType="up" />
            <StatCard label="Diferencia" value="$ 0" icon="ChartBar" color="purple" trend="Ok" />
          </div>

          <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[520px]">
             <div className="p-4 md:p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                <h3 className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-widest">Calendario de Liquidación</h3>
                <span className="text-[9px] md:text-[10px] font-bold text-ios-blue bg-ios-blue/10 px-3 py-1 rounded-full uppercase">Sincronizado</span>
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar">
                <Suspense fallback={<CalendarSkeleton />}>
                   <CalendarioFinanciero />
                </Suspense>
             </div>
          </div>
        </div>

        {/* COLUMNA DERECHA (5) */}
        <div className="xl:col-span-5 space-y-6 md:space-y-8">
          <div className="group relative overflow-hidden rounded-[40px] bg-white border border-gray-100 shadow-sm h-[400px]">
             <div className="absolute top-5 left-7 z-20 flex items-center gap-2">
                <div className="w-2 h-2 bg-ios-green rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Radar Operativo</span>
             </div>
             <div className="w-full h-full">
                <Suspense fallback={<RadarSkeleton />}>
                   <GlobalRadarClient />
                </Suspense>
             </div>
          </div>

          <div className="space-y-6">
             <PanelMora />
             
             <div className="grid grid-cols-2 gap-4">
                <Link href="/capitan/pagos" className="bg-white p-5 md:p-6 rounded-[32px] border border-gray-100 group flex flex-col gap-3 hover:shadow-xl transition-all">
                   <div className="w-10 h-10 bg-ios-blue/5 rounded-xl flex items-center justify-center text-ios-blue group-hover:bg-ios-blue group-hover:text-white transition-all">
                      <Receipt weight="fill" size={20} />
                   </div>
                   <p className="text-[13px] font-black">Validar Pagos</p>
                </Link>
                <Link href="/capitan/configuracion" className="bg-white p-5 md:p-6 rounded-[32px] border border-gray-100 group flex flex-col gap-3 hover:shadow-xl transition-all">
                   <div className="w-10 h-10 bg-ios-purple/5 rounded-xl flex items-center justify-center text-ios-purple group-hover:bg-ios-purple group-hover:text-white transition-all">
                      <Gear weight="fill" size={20} />
                   </div>
                   <p className="text-[13px] font-black">Ajustes</p>
                </Link>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

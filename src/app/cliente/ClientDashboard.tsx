"use client";

import { 
  Wallet, 
  CreditCard, 
  Calendar, 
  Receipt, 
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  WarningCircle,
  CaretRight,
  ChartPolar,
  UserCircle,
  TrendUp,
  Cards
} from "@phosphor-icons/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatCurrency } from "@/utils/format";

interface Props {
  prestamos: any[];
  saldoPorPagar: number;
  prestamosActivos: any[];
}

export default function ClientDashboard({ prestamos, saldoPorPagar, prestamosActivos }: Props) {
  return (
    <div className="ios-page space-y-10 pb-32 pt-4">
      {/* Dynamic Header */}
      <section className="px-4 animate-fade-up">
        <div className="flex items-center justify-between mb-2">
           <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-black/[0.03] flex items-center justify-center text-black/20">
                 <UserCircle weight="fill" size={32} />
              </div>
              <div className="space-y-0.5">
                 <h2 className="text-xl font-[1000] text-black tracking-tighter">Bienvenido</h2>
                 <p className="text-[11px] font-black text-black/30 uppercase tracking-[0.2em]">Matrix Account Active</p>
              </div>
           </div>
           <div className="w-10 h-10 bg-ios-blue/10 rounded-xl flex items-center justify-center text-ios-blue">
              <ChartPolar weight="fill" size={24} />
           </div>
        </div>
      </section>

      {/* Wallet Master Card */}
      <section className="px-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="ios-card-gradient-blue p-10 rounded-[44px] relative overflow-hidden shadow-2xl shadow-ios-blue/30 border-4 border-white/20"
        >
          <div className="absolute top-[-30%] right-[-20%] w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-32 h-32 bg-ios-yellow/20 rounded-full blur-[40px]" />
          
          <div className="relative z-10 space-y-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-1 opacity-60">
                <Wallet weight="fill" size={16} />
                <span className="text-[11px] font-black uppercase tracking-[0.3em]">Capital Pendiente de Pago</span>
              </div>
              <h2 className="text-5xl font-[1000] tracking-tighter leading-none">
                {formatCurrency(saldoPorPagar)}
              </h2>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur-xl px-6 py-4 rounded-3xl border border-white/10 flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">Créditos</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-[1000]">{prestamosActivos.length}</p>
                  <span className="text-[10px] font-black opacity-40">ACTIVOS</span>
                </div>
              </div>
              <Link 
                href="/cliente/pago"
                className="bg-white text-ios-blue px-8 py-4 rounded-3xl font-black text-[13px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-3 flex-[1.5] shadow-2xl shadow-black/10"
              >
                Reportar Abono
                <ArrowRight weight="bold" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Credit Matrix Section */}
      <section className="space-y-6 px-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[11px] font-black text-black/30 uppercase tracking-[0.4em]">Matriz de Créditos</h3>
          <div className="p-2 bg-black/[0.03] rounded-lg">
             <TrendUp weight="bold" size={16} className="text-ios-blue" />
          </div>
        </div>
        
        {prestamos.length > 0 ? (
          <div className="space-y-5">
            {prestamos.map((prestamo, i) => {
              const isActive = prestamo.estado === 'ACTIVO';
              return (
                <motion.div 
                  key={prestamo.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="ios-glass border-none p-8 rounded-[40px] shadow-2xl shadow-black/5 group hover:bg-black/[0.01] transition-all"
                >
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner border-2 border-white transition-colors ${
                        isActive ? 'bg-ios-blue/10 text-ios-blue' : 'bg-black/5 text-black/10'
                      }`}>
                        <CreditCard weight="fill" size={28} />
                      </div>
                      <div>
                        <h4 className="text-[18px] font-[1000] text-black tracking-tight leading-none mb-1">Crédito Transaccional</h4>
                        <div className="flex items-center gap-2">
                           <p className="text-[12px] font-black text-black/20 uppercase tracking-widest">Hash ID #{prestamo.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] shadow-sm border border-white/50 ${
                      isActive ? 'bg-ios-green/10 text-ios-green' : 'bg-black/5 text-black/40'
                    }`}>
                      {prestamo.estado}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-black/20 uppercase tracking-widest">Inyección Original</p>
                      <p className="text-xl font-[900] text-black tracking-tight">{formatCurrency(prestamo.monto)}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] font-black text-black/20 uppercase tracking-widest">Saldo de Liquidación</p>
                      <p className={`text-2xl font-[1000] tracking-tighter ${isActive ? 'text-ios-pink' : 'text-black/40'}`}>
                         {formatCurrency(prestamo.saldo_actual)}
                      </p>
                    </div>
                  </div>

                  {isActive && (
                    <Link 
                      href={`/cliente/solicitudes`}
                      className="flex items-center justify-center gap-3 w-full py-5 bg-black/[0.03] hover:bg-ios-blue hover:text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-sm"
                    >
                      Auditores de Cuotas
                      <CaretRight weight="bold" />
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="ios-glass border-dashed border-2 border-black/5 p-20 text-center rounded-[44px]">
             <div className="w-20 h-20 bg-black/5 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-black/10">
                <Cards weight="fill" size={40} />
             </div>
             <h3 className="text-xl font-[1000] text-black tracking-tight mb-2">Sin Operaciones</h3>
             <p className="text-[14px] font-bold text-black/30 max-w-xs mx-auto">Su matriz de créditos está vacía actualmente en el sistema central.</p>
          </div>
        )}
      </section>

      {/* System Security Footnote */}
      <section className="px-4 animate-fade-up" style={{ animationDelay: '0.4s' }}>
        <div className="ios-glass-alt p-8 rounded-[44px] border-none flex items-center gap-6 shadow-2xl shadow-black/5 bg-gradient-to-br from-white to-black/[0.01]">
           <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-ios-blue shadow-xl border border-black/[0.02]">
              <ShieldCheck weight="fill" size={32} />
           </div>
           <div className="space-y-1">
              <p className="text-[15px] font-[900] text-black tracking-tight">Arquitectura Zero Trust</p>
              <p className="text-[12px] font-semibold text-black/40 leading-relaxed">Su información cuenta con cifrado de grado militar y validación biométrica descentralizada.</p>
           </div>
        </div>
      </section>
    </div>
  );
}


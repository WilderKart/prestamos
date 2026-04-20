"use client";

import { useActionState } from "react";
import { registrarCliente } from "./actions";
import { 
  ShieldCheck, 
  Lightning, 
  EnvelopeSimple, 
  CaretLeft,
  User,
  LockSimple
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registrarCliente, null);

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-ios-blue selection:text-white">
      {/* Dynamic Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-ios-blue/10 rounded-full blur-[120px] animate-pulse-soft" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-ios-purple/10 rounded-full blur-[100px]" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm z-10"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: 3, scale: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-ios-blue rounded-[24px] shadow-2xl shadow-ios-blue/30 mb-6 text-white"
          >
             <ShieldCheck weight="fill" size={40} />
          </motion.div>
          <h1 className="text-4xl font-[900] text-black tracking-tighter leading-tight">
            Únete a <span className="text-ios-blue">Mivank</span>
          </h1>
          <p className="text-[11px] font-black text-black/30 tracking-[0.2em] uppercase mt-2">Personal Finance Enclave</p>
        </div>

        <div className="ios-glass-alt rounded-[40px] p-8 shadow-2xl shadow-black/[0.05] border border-white/50 backdrop-blur-2xl">
          {state?.success ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-6 py-4"
            >
              <div className="w-16 h-16 bg-ios-green/10 text-ios-green rounded-full flex items-center justify-center mx-auto">
                <EnvelopeSimple weight="fill" size={32} />
              </div>
              <h2 className="text-xl font-black text-black tracking-tight">Verifica tu Email</h2>
              <p className="text-sm text-black/60 font-medium leading-relaxed">
                {state.message}
              </p>
              <Link 
                href="/login" 
                className="flex items-center justify-center gap-2 text-[13px] font-black text-ios-blue hover:opacity-70 transition-opacity"
              >
                <CaretLeft weight="bold" size={16} /> Volver al Login
              </Link>
            </motion.div>
          ) : (
            <form className="space-y-5" action={formAction}>
              {state?.error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-ios-pink/10 border border-ios-pink/20 rounded-2xl text-ios-pink text-[11px] font-black uppercase tracking-wider text-center"
                >
                  {state.error}
                </motion.div>
              )}

              <div className="space-y-2">
                <label className="text-[11px] font-black text-black/30 uppercase tracking-widest ml-1">Nombre Completo</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" weight="bold" />
                  <input
                    name="nombre"
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez"
                    className="w-full rounded-2xl border-none bg-black/[0.03] px-11 py-3.5 text-sm font-bold text-black focus:ring-2 focus:ring-ios-blue/20 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-black/30 uppercase tracking-widest ml-1">Email Corporativo</label>
                <div className="relative">
                  <EnvelopeSimple size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" weight="bold" />
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="tu@email.com"
                    className="w-full rounded-2xl border-none bg-black/[0.03] px-11 py-3.5 text-sm font-bold text-black focus:ring-2 focus:ring-ios-blue/20 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-black/30 uppercase tracking-widest ml-1">Nueva Contraseña</label>
                <div className="relative">
                  <LockSimple size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" weight="bold" />
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full rounded-2xl border-none bg-black/[0.03] px-11 py-3.5 text-sm font-bold text-black focus:ring-2 focus:ring-ios-blue/20 transition-all outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-ios-blue text-white flex items-center justify-center gap-3 rounded-[20px] shadow-xl shadow-ios-blue/20 mt-4 h-14 disabled:opacity-50 transition-all active:scale-95 group"
              >
                <span className="font-black text-[15px] tracking-tight">
                  {isPending ? "Procesando..." : "Comenzar Ahora"}
                </span>
                <Lightning weight="fill" className="w-5 h-5 text-ios-yellow animate-pulse group-hover:scale-110 transition-transform" />
              </button>
              
              <div className="pt-4 text-center">
                <Link href="/login" className="text-[12px] font-bold text-black/30 hover:text-ios-blue transition-colors">
                  ¿Ya tienes cuenta? <span className="text-black/80 font-black">Inicia Sesión</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

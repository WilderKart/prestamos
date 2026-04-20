"use client";

import { useActionState, useEffect } from "react";
import { actualizarPassword } from "./actions";
import { useRouter } from "next/navigation";
import { 
  LockSimple, 
  ShieldCheck, 
  Key,
  CheckCircle,
  CaretRight
} from "@phosphor-icons/react";
import { motion } from "framer-motion";

export default function SetupPasswordPage() {
  const [state, formAction, isPending] = useActionState(actualizarPassword, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.push("/");
      router.refresh();
    }
  }, [state, router]);

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
            className="inline-flex items-center justify-center w-20 h-20 bg-black rounded-[24px] shadow-2xl shadow-black/30 mb-6 text-white"
          >
             <LockSimple weight="fill" size={40} />
          </motion.div>
          <h1 className="text-4xl font-[900] text-black tracking-tighter leading-tight">
            Establecer <span className="text-ios-blue">Acceso</span>
          </h1>
          <p className="text-[11px] font-black text-black/30 tracking-[0.2em] uppercase mt-2">Personal Security Protocol</p>
        </div>

        <div className="ios-glass-alt rounded-[40px] p-8 shadow-2xl shadow-black/[0.05] border border-white/50 backdrop-blur-2xl">
          <div className="mb-8 bg-black/5 p-4 rounded-2xl border border-black/5 flex items-start gap-3">
            <ShieldCheck weight="fill" size={20} className="text-ios-blue shrink-0 mt-0.5" />
            <p className="text-[13px] text-black/60 font-medium leading-relaxed italic">
              "Para proteger tu enclave financiero, debes establecer una contraseña antes de continuar."
            </p>
          </div>

          <form action={formAction} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-black/30 uppercase tracking-widest ml-1">Nueva Contraseña</label>
              <div className="relative">
                <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" weight="bold" />
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-2xl border-none bg-black/[0.03] px-11 py-3.5 text-sm font-bold text-black focus:ring-2 focus:ring-ios-blue/20 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-black/30 uppercase tracking-widest ml-1">Confirmar Contraseña</label>
              <div className="relative">
                <CheckCircle size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" weight="bold" />
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-2xl border-none bg-black/[0.03] px-11 py-3.5 text-sm font-bold text-black focus:ring-2 focus:ring-ios-blue/20 transition-all outline-none"
                />
              </div>
            </div>

            {state?.error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-ios-pink/10 border border-ios-pink/20 rounded-2xl text-ios-pink text-[11px] font-black uppercase tracking-wider text-center"
              >
                {state.error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-black text-white flex items-center justify-center gap-3 rounded-[20px] shadow-xl shadow-black/20 mt-4 h-14 disabled:opacity-50 transition-all active:scale-95 group"
            >
              <span className="font-black text-[15px] tracking-tight">
                {isPending ? "Asegurando..." : "Asegurar Acceso"}
              </span>
              <CaretRight weight="bold" className="w-4 h-4 text-ios-blue group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[9px] font-bold text-black/20 uppercase tracking-[0.4em]">
              Zero Trust Finance Protocol
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

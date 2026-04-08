"use client";

import { useActionState } from "react";
import { login } from "./actions";
import { ChevronRight, Loader2, ShieldCheck, Zap, Lock } from "lucide-react";
import { motion } from "framer-motion";

const initialState = {
  error: "",
};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Decorative Brand Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent-yellow/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-black/5 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#111111] rounded-[32px] shadow-2xl mb-6 transform -rotate-6">
             <ShieldCheck className="w-10 h-10 text-accent-yellow" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">
            Mivank <span className="text-accent-yellow">Ultra</span>
          </h1>
          <p className="text-[10px] font-black text-gray-400 tracking-[4px] uppercase mt-2">Fintech Intelligence</p>
        </div>

        {/* Login Card */}
        <div className="card-premium bg-white p-10 border-none shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]">
          <form className="space-y-6" action={formAction}>
            {state?.error && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-black uppercase"
              >
                <Lock className="w-4 h-4" />
                {state.error}
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Corporativo</label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="admin@mivank.com"
                  className="w-full rounded-2xl border-none bg-gray-50 px-5 py-4 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-accent-yellow/10 transition-all outline-none"
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contraseña</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-2xl border-none bg-gray-50 px-5 py-4 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-accent-yellow/10 transition-all outline-none"
                  disabled={isPending}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full btn-pill bg-[#111111] text-white flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 shadow-2xl shadow-black/20 mt-4 h-14 disabled:opacity-50 transition-all"
            >
              <span className="font-black text-sm tracking-widest uppercase">
                {isPending ? "Validando..." : "Acceder"}
              </span>
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 text-accent-yellow" />}
            </button>
          </form>

          <p className="text-center mt-10 text-[10px] font-black text-gray-300 uppercase tracking-[3px]">
            Zero Trust Finance
          </p>
        </div>
        
        {/* Support Section */}
        <div className="mt-12 text-center">
           <p className="text-xs font-bold text-gray-400">
             ¿No tienes una cuenta? <span className="text-gray-900 cursor-pointer hover:underline">Contactar soporte</span>
           </p>
        </div>
      </motion.div>
    </div>
  );
}

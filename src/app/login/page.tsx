"use client";

import { useActionState } from "react";
import { login } from "./actions";
import { 
  ShieldCheck, 
  Envelope, 
  Lock, 
  ArrowRight,
  Fingerprint
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import Link from "next/link";

const initialState = {
  error: "",
};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <div className="min-h-screen bg-ios-bg flex flex-col items-center justify-center p-6 font-sans antialiased">
      {/* Soft Background Accents */}
      <div className="fixed top-[-20%] left-[-10%] w-[80%] h-[60%] bg-ios-blue/5 rounded-full blur-[150px] -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[60%] h-[50%] bg-ios-purple/5 rounded-full blur-[120px] -z-10" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[400px]"
      >
        {/* Apple-style Logo Section */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-20 h-20 bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/[0.02] flex items-center justify-center mb-6">
            <ShieldCheck weight="fill" className="w-11 h-11 text-ios-blue" />
          </div>
          <h1 className="text-3xl font-[800] text-black tracking-tight mb-1">Mivank</h1>
          <p className="text-[13px] font-semibold text-ios-gray tracking-wide">Plataforma Financiera</p>
        </div>

        {/* Login Container */}
        <div className="bg-white rounded-[32px] p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)] border border-white/40">
          <form className="space-y-5" action={formAction}>
            {state?.error && (
              <motion.div 
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-ios-pink/5 border border-ios-pink/10 rounded-2xl flex items-center gap-3 text-ios-pink text-[14px] font-bold"
              >
                <Lock weight="fill" className="w-4 h-4" />
                {state.error}
              </motion.div>
            )}

            <div className="space-y-1">
              <label className="ios-section-title pl-0">E-mail</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ios-gray">
                  <Envelope weight="fill" size={20} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="nombre@empresa.com"
                  className="w-full ios-input pl-12"
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="ios-section-title pl-0">Contraseña</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ios-gray">
                  <Lock weight="fill" size={20} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full ios-input pl-12"
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="w-full ios-btn-primary h-[58px] group"
              >
                <span className="text-[16px]">
                  {isPending ? "Validando..." : "Iniciar Sesión"}
                </span>
                {!isPending && <ArrowRight weight="bold" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          </form>

          <div className="mt-8 flex items-center justify-center gap-2 text-ios-gray">
            <Fingerprint weight="fill" size={20} className="opacity-40" />
            <span className="text-[12px] font-bold uppercase tracking-widest opacity-60">Verified Secure System</span>
          </div>
        </div>
        
        {/* Footer / Register Link */}
        <div className="mt-10 text-center space-y-4">
           <Link href="/register" className="text-[14px] font-semibold text-ios-blue hover:opacity-70 transition-opacity">
              ¿Eres nuevo? Crea una cuenta corporativa
           </Link>
           <p className="text-[11px] font-medium text-ios-gray/60 px-10">
              Al entrar confirmas que posees autorización legal para gestionar datos financieros de terceros.
           </p>
        </div>
      </motion.div>
    </div>
  );
}

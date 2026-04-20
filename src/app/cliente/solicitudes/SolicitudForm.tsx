"use client";

import { useState } from "react";
import { usePersistentForm } from "@/hooks/usePersistentForm";
import { crearSolicitudPrestamo } from "./actions";
import { 
  CurrencyDollar, 
  Plus, 
  CircleNotch, 
  CheckCircle,
  Money,
  Lightning,
  Sparkle,
  ArrowRight,
  ShieldCheck,
  WarningCircle
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function SolicitudForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const { data: draft, setFieldValue, clearDraft } = usePersistentForm("nueva-solicitud", {
    monto: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const montoNum = parseFloat(draft.monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      setError("Monto no procesable");
      setLoading(false);
      return;
    }

    const result = await crearSolicitudPrestamo(montoNum);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      clearDraft();
      setTimeout(() => {
        setSuccess(false);
        router.refresh();
      }, 3000);
    }
    setLoading(false);
  };

  return (
    <section className="space-y-6">
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="ios-glass p-12 text-center rounded-[44px] border-none shadow-2xl flex flex-col items-center justify-center space-y-6"
          >
            <div className="w-20 h-20 bg-ios-green rounded-[28px] flex items-center justify-center text-white shadow-2xl shadow-ios-green/30 transform -rotate-3">
              <CheckCircle weight="fill" size={44} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-[1000] text-black tracking-tighter">Inyección Exitosa</h2>
              <p className="text-[14px] font-semibold text-black/30 max-w-xs mx-auto">
                Su solicitud de capital ha sido distribuida a la red de auditoría. Notificaremos el resultado en tiempo real.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="form"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="ios-glass border-none p-10 rounded-[44px] shadow-2xl shadow-black/5 relative overflow-hidden"
          >
            {/* Dynamic Accents */}
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-ios-blue/5 rounded-full blur-[100px]" />
            <Sparkle weight="fill" size={80} className="absolute -bottom-6 -left-6 text-ios-blue/5 -rotate-12" />
            
            <div className="relative z-10 space-y-10">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-ios-blue text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-ios-blue/20 transform rotate-3">
                  <Lightning weight="fill" size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-[1000] text-black tracking-tighter">Nueva Solicitud</h2>
                  <p className="text-[11px] font-black text-black/20 uppercase tracking-[0.3em]">Protocolo de Capital</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-5 bg-ios-pink/5 text-ios-pink text-[13px] font-black rounded-3xl border border-ios-pink/10 flex items-center gap-4"
                  >
                    <WarningCircle weight="fill" size={24} />
                    {error}
                  </motion.div>
                )}

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-black/20 uppercase tracking-[0.4em] ml-2">Monto Proyectado</label>
                  <div className="relative">
                    <CurrencyDollar size={28} className="absolute left-8 top-1/2 -translate-y-1/2 text-black/10" weight="fill" />
                    <input
                      type="number"
                      name="monto"
                      value={draft.monto}
                      onChange={(e) => setFieldValue("monto", e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-black/[0.03] rounded-[32px] pl-16 pr-8 py-10 text-5xl font-[1000] text-black tracking-tighter outline-none focus:ring-8 focus:ring-ios-blue/5 transition-all placeholder:text-black/5"
                      disabled={loading}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-20 bg-black text-white rounded-[28px] font-black text-[13px] uppercase tracking-[0.3em] shadow-2xl shadow-black/20 active:scale-[0.98] transition-all flex items-center justify-center gap-4 group disabled:opacity-50"
                  >
                    {loading ? (
                      <CircleNotch className="animate-spin" size={28} weight="bold" />
                    ) : (
                      <>
                        Sincronizar Solicitud
                        <ArrowRight weight="bold" className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                  <div className="flex items-center justify-center gap-3 opacity-20">
                     <ShieldCheck weight="fill" size={16} />
                     <span className="text-[9px] font-black uppercase tracking-[0.4em]">Auditado por Mivank Matrix</span>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

"use client";

import { useActionState, useState } from "react";
import { crearPrestamo } from "./actions";
import { Plus, Loader2, X, Wallet, Calendar, Percent, Hash, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const initialState: any = {
  error: "",
  success: false,
};

export default function PrestamoFormModal({ clienteId }: { clienteId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(crearPrestamo, initialState);

  if (state?.success && isOpen) {
    setIsOpen(false);
    state.success = false;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-pill bg-[#111111] text-white flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10 px-6 py-4"
      >
        <Plus className="w-5 h-5 text-accent-yellow" />
        <span className="font-black text-sm tracking-widest uppercase">Nuevo Crédito</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md" 
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#F8F9FB] rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden relative z-10 border border-white/20"
            >
              {/* Header */}
              <div className="bg-[#111111] p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-yellow/10 rounded-full blur-3xl" />
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                       <Wallet className="w-4 h-4 text-accent-yellow" />
                       <span className="text-[10px] font-black uppercase tracking-[3px] text-gray-400">Configuración</span>
                    </div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase">Nuevo Préstamo</h2>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form action={formAction} className="p-8 space-y-6">
                <input type="hidden" name="clienteId" value={clienteId} />

                {state?.error && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-black uppercase rounded-2xl flex items-center gap-3">
                    <X className="w-4 h-4" />
                    {state.error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Monto Solicitado</label>
                     <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</div>
                        <input
                           type="number"
                           name="monto"
                           required
                           className="w-full rounded-2xl border-none bg-white px-10 py-4 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-accent-yellow/10 transition-all outline-none shadow-sm"
                           placeholder="0.00"
                           disabled={isPending}
                        />
                     </div>
                   </div>

                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tasa Interés (%)</label>
                     <div className="relative">
                        <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                           type="number"
                           name="interes"
                           required
                           className="w-full rounded-2xl border-none bg-white px-10 py-4 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-accent-yellow/10 transition-all outline-none shadow-sm"
                           placeholder="20"
                           disabled={isPending}
                        />
                     </div>
                   </div>

                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Frecuencia Pago</label>
                     <select
                        name="frecuencia"
                        required
                        className="w-full rounded-2xl border-none bg-white px-5 py-4 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-accent-yellow/10 transition-all outline-none shadow-sm appearance-none"
                        disabled={isPending}
                     >
                        <option value="DIARIA">DIARIA</option>
                        <option value="SEMANAL">SEMANAL</option>
                        <option value="QUINCENAL">QUINCENAL</option>
                        <option value="MENSUAL">MENSUAL</option>
                     </select>
                   </div>

                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nº de Cuotas</label>
                     <div className="relative">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                           type="number"
                           name="numeroCuotas"
                           required
                           className="w-full rounded-2xl border-none bg-white px-10 py-4 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-accent-yellow/10 transition-all outline-none shadow-sm"
                           placeholder="30"
                           disabled={isPending}
                        />
                     </div>
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fecha de Inicio</label>
                  <div className="relative">
                     <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                     <input
                        type="date"
                        name="fechaInicio"
                        required
                        defaultValue={new Date().toISOString().split('T')[0]}
                        className="w-full rounded-2xl border-none bg-white px-10 py-4 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-accent-yellow/10 transition-all outline-none shadow-sm"
                        disabled={isPending}
                     />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full btn-pill bg-[#111111] text-white flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 shadow-2xl shadow-black/20 h-16 disabled:opacity-50 transition-all"
                  >
                    <span className="font-black text-sm tracking-widest uppercase">
                      {isPending ? "Procesando..." : "Emitir Crédito"}
                    </span>
                    {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 text-accent-yellow" />}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

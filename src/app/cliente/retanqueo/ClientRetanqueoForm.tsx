"use client";

import { useActionState, useEffect } from "react";
import { usePersistentForm } from "@/hooks/usePersistentForm";
import { solicitarRetanqueo } from "./actions";
import { 
  CheckCircle, 
  CircleNotch, 
  ArrowsClockwise, 
  CurrencyDollar, 
  ChatText,
  IdentificationCard,
  CaretRight,
  ShieldCheck,
  Lightning,
  PlusCircle,
  ArrowRight,
  WarningCircle
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/utils/format";

const initialState: any = {
  error: "",
  success: false,
};

export default function ClientRetanqueoForm({ prestamos, userId }: { prestamos: any[], userId?: string }) {
  const [state, formAction, isPending] = useActionState(solicitarRetanqueo, initialState);

  const { data: draft, setFieldValue, clearDraft } = usePersistentForm("solicitar-retanqueo", {
    prestamo_id: prestamos[0]?.id || "",
    monto_solicitado: "",
    motivo: "",
  }, userId);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFieldValue(e.target.name as any, e.target.value);
  };

  useEffect(() => {
    if (state?.success) {
      clearDraft();
    }
  }, [state?.success, clearDraft]);

  return (
    <div className="space-y-10 animate-fade-up pb-12">
      <AnimatePresence mode="wait">
        {state?.success ? (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="ios-glass p-12 text-center rounded-[44px] border-none shadow-2xl flex flex-col items-center justify-center space-y-6"
          >
            <div className="w-20 h-20 bg-ios-purple rounded-[28px] flex items-center justify-center text-white shadow-2xl shadow-ios-purple/30 transform -rotate-3">
              <CheckCircle weight="fill" size={48} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-[1000] text-black tracking-tighter">Retanqueo Solicitado</h2>
              <p className="text-[14px] font-semibold text-black/30 max-w-xs mx-auto">
                Su petición de expansión de capital ha sido registrada. El equipo de auditoría evaluará su perfil de riesgo.
              </p>
            </div>
            <button
              onClick={() => { window.location.reload(); }}
              className="mt-4 px-10 py-5 bg-black text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all"
            >
              Nueva Solicitud de Cupo
            </button>
          </motion.div>
        ) : (
          <motion.form 
            key="form"
            action={formAction} 
            className="space-y-8"
          >
            {/* Header */}
            <header className="px-4 text-center space-y-2">
               <div className="w-16 h-16 bg-ios-purple text-white rounded-[24px] flex items-center justify-center mx-auto shadow-2xl shadow-ios-purple/30 border-2 border-white mb-6 transform rotate-2">
                  <ArrowsClockwise weight="fill" size={32} />
               </div>
               <h1 className="text-3xl font-[1000] text-black tracking-tighter">Solicitud de <span className="text-ios-purple">Retanqueo</span></h1>
               <p className="text-[11px] font-black text-black/20 uppercase tracking-[0.4em]">Expansión Transaccional</p>
            </header>

            {state?.error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-4 p-5 bg-ios-pink/5 text-ios-pink text-[13px] font-black rounded-3xl border border-ios-pink/10 flex items-center gap-4"
              >
                <WarningCircle weight="fill" size={24} />
                {state.error}
              </motion.div>
            )}

            <div className="ios-glass p-8 rounded-[44px] border-none shadow-2xl shadow-black/5 space-y-10">
              {/* Reference Selector */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em] ml-2">Crédito de Referencia</label>
                <div className="relative">
                  <IdentificationCard weight="fill" size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20" />
                  <select
                    name="prestamo_id"
                    required
                    disabled={isPending || prestamos.length === 0}
                    value={draft.prestamo_id}
                    onChange={handleChange}
                    className="w-full bg-black/[0.03] rounded-[24px] pl-14 pr-12 py-6 text-black font-[800] text-[15px] outline-none focus:ring-4 focus:ring-ios-purple/5 transition-all appearance-none"
                  >
                    <option value="">Seleccione el préstamo actual...</option>
                    {prestamos.map((p) => (
                      <option key={p.id} value={p.id}>
                        HASH: #{p.id.slice(0, 8)} — Balance: {formatCurrency(p.saldo_actual)}
                      </option>
                    ))}
                  </select>
                  <CaretRight weight="bold" size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-black/10 pointer-events-none rotate-90" />
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-black/20 uppercase tracking-[0.4em] ml-2">Monto Adicional Proyectado</label>
                <div className="relative">
                  <CurrencyDollar weight="fill" size={24} className="absolute left-8 top-1/2 -translate-y-1/2 text-black/10" />
                  <input
                    type="number"
                    name="monto_solicitado"
                    min="1"
                    step="0.01"
                    required
                    disabled={isPending}
                    value={draft.monto_solicitado}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full bg-black/[0.03] rounded-[32px] pl-16 py-10 text-5xl font-[1000] text-black tracking-tighter outline-none focus:ring-8 focus:ring-ios-purple/5 transition-all placeholder:text-black/5"
                  />
                </div>
              </div>

              {/* Justification */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em] ml-2">Justificación de Ampliación</label>
                <div className="relative">
                  <ChatText weight="fill" size={20} className="absolute left-6 top-6 text-black/20" />
                  <textarea
                    name="motivo"
                    required
                    disabled={isPending}
                    value={draft.motivo}
                    onChange={handleChange}
                    placeholder="Describa el propósito de esta inyección de capital..."
                    rows={4}
                    className="w-full bg-black/[0.03] rounded-[24px] pl-14 pr-8 py-6 text-black font-[800] text-[15px] outline-none focus:ring-4 focus:ring-ios-purple/5 transition-all resize-none min-h-[140px]"
                  ></textarea>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isPending || prestamos.length === 0}
                  className="w-full h-20 bg-black text-white rounded-[28px] font-black text-[13px] uppercase tracking-[0.3em] shadow-2xl shadow-black/20 active:scale-[0.98] transition-all flex items-center justify-center gap-4 group disabled:opacity-50"
                >
                  {isPending ? (
                    <CircleNotch className="animate-spin" size={28} weight="bold" />
                  ) : (
                    <>
                       Sincronizar Solicitud
                       <ArrowRight weight="bold" className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>

              {/* Security Badge */}
              <div className="pt-4 flex items-center justify-center gap-3 opacity-20">
                 <ShieldCheck weight="fill" size={20} />
                 <span className="text-[9px] font-black uppercase tracking-[0.4em]">Auditado por Mivank Matrix Zero Trust</span>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { useActionState, useState, useEffect } from "react";
import { usePersistentForm } from "@/hooks/usePersistentForm";
import { reportarPago } from "./actions";
import { 
  CheckCircle, 
  CircleNotch, 
  CloudArrowUp, 
  FileText, 
  CurrencyDollar, 
  CreditCard,
  Bank,
  IdentificationCard,
  CaretRight,
  ShieldCheck,
  WarningCircle,
  XCircle,
  PlusCircle
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/utils/format";

const initialState: any = {
  error: "",
  success: false,
};

export default function ClientPagoForm({ prestamos, userId }: { prestamos: any[], userId?: string }) {
  const [state, formAction, isPending] = useActionState(reportarPago, initialState);
  const [fileName, setFileName] = useState("");

  const { data: draft, setFieldValue, clearDraft } = usePersistentForm("reportar-pago", {
    prestamo_id: prestamos[0]?.id || "",
    valor: "",
    metodo: "EFECTIVO",
  }, userId);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFieldValue(e.target.name as any, e.target.value);
  };

  useEffect(() => {
    if (state?.success) {
      clearDraft();
      setFileName("");
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
            <div className="w-20 h-20 bg-ios-green rounded-[28px] flex items-center justify-center text-white shadow-2xl shadow-ios-green/30 transform -rotate-3">
              <CheckCircle weight="fill" size={48} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-[1000] text-black tracking-tighter">Protocolo Exitoso</h2>
              <p className="text-[14px] font-semibold text-black/30 max-w-xs mx-auto">
                Su reporte de pago ha sido inyectado en la matriz. Un auditor validará la transacción en breve.
              </p>
            </div>
            <button
              onClick={() => { window.location.reload(); }}
              className="mt-4 px-10 py-5 bg-black text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all"
            >
              Reportar Nueva Transacción
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
               <div className="w-16 h-16 bg-ios-blue text-white rounded-[24px] flex items-center justify-center mx-auto shadow-2xl shadow-ios-blue/30 border-2 border-white mb-6">
                  <PlusCircle weight="fill" size={32} />
               </div>
               <h1 className="text-3xl font-[1000] text-black tracking-tighter">Reportar <span className="text-ios-blue">Abono</span></h1>
               <p className="text-[11px] font-black text-black/20 uppercase tracking-[0.4em]">Sincronización de Flujo</p>
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
              {/* Product Selector */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em] ml-2">Selección de Producto</label>
                <div className="relative">
                  <IdentificationCard weight="fill" size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20" />
                  <select
                    name="prestamo_id"
                    required
                    disabled={isPending || prestamos.length === 0}
                    value={draft.prestamo_id}
                    onChange={handleChange}
                    className="w-full bg-black/[0.03] rounded-[24px] pl-14 pr-12 py-6 text-black font-[800] text-[15px] outline-none focus:ring-4 focus:ring-ios-blue/5 transition-all appearance-none"
                  >
                    <option value="">Seleccionar crédito activo...</option>
                    {prestamos.map((p) => (
                      <option key={p.id} value={p.id}>
                        Ref: #{p.id.slice(0, 8)} — {formatCurrency(p.saldo_actual)} Pendiente
                      </option>
                    ))}
                  </select>
                  <CaretRight weight="bold" size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-black/10 pointer-events-none rotate-90" />
                </div>
              </div>

              {/* Amount and Method */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em] ml-2">Valor Transaccional</label>
                  <div className="relative">
                    <CurrencyDollar weight="fill" size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20" />
                    <input
                      type="number"
                      name="valor"
                      min="1"
                      step="0.01"
                      required
                      disabled={isPending}
                      value={draft.valor}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full bg-black/[0.03] rounded-[24px] pl-14 py-6 text-black font-[800] text-[15px] outline-none focus:ring-4 focus:ring-ios-blue/5 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em] ml-2">Canal de Transferencia</label>
                  <div className="relative">
                    <CreditCard weight="fill" size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20" />
                    <select
                      name="metodo"
                      required
                      disabled={isPending}
                      value={draft.metodo}
                      onChange={handleChange}
                      className="w-full bg-black/[0.03] rounded-[24px] pl-14 pr-12 py-6 text-black font-[800] text-[15px] outline-none focus:ring-4 focus:ring-ios-blue/5 transition-all appearance-none"
                    >
                      <option value="EFECTIVO">Dinero en Efectivo</option>
                      <option value="TRANSFERENCIA">Transferencia Digital</option>
                    </select>
                    <CaretRight weight="bold" size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-black/10 pointer-events-none rotate-90" />
                  </div>
                </div>
              </div>

              {/* Evidence Upload */}
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em] ml-2">Protocolo de Evidencia</label>
                 <div className="relative group">
                    <input
                      type="file"
                      name="comprobante"
                      accept="image/*,.pdf"
                      disabled={isPending}
                      onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />
                    <div className="ios-glass-alt border-dashed border-2 border-black/5 rounded-[32px] p-10 flex flex-col items-center justify-center space-y-4 group-hover:bg-ios-blue/[0.02] transition-colors border-spacing-4">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-black/20 shadow-xl group-hover:text-ios-blue transition-colors">
                        <CloudArrowUp weight="fill" size={32} />
                      </div>
                      <div className="text-center">
                        <p className="text-[14px] font-[1000] text-black">
                          {fileName ? <span className="text-ios-blue">Archivo: {fileName}</span> : "Cargar Comprobante Digital"}
                        </p>
                        <p className="text-[11px] font-bold text-black/30 mt-1 uppercase tracking-widest">Formatos: JPG / PNG / PDF</p>
                      </div>
                    </div>
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
                       Sincronizar Balance
                       <ArrowRight weight="bold" className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>

              {/* Security Badge */}
              <div className="pt-4 flex items-center justify-center gap-3 opacity-20">
                 <ShieldCheck weight="fill" size={20} />
                 <span className="text-[9px] font-black uppercase tracking-[0.4em]">Zero Trust Encryption Key Active</span>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

import { ArrowRight } from "@phosphor-icons/react";

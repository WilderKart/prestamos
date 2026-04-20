"use client";

import { useActionState, useState, useEffect } from "react";
import { usePersistentForm } from "@/hooks/usePersistentForm";
import { crearPrestamo } from "./actions";
import { 
  Plus, 
  CircleNotch, 
  X, 
  Wallet, 
  CalendarBlank, 
  Percent, 
  Hash, 
  Lightning,
  Money,
  Clock,
  CheckCircle,
  Sparkle,
  CurrencyDollar
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/utils/format";
import IosModal from "@/components/ui/IosModal";

const initialState: any = {
  error: "",
  success: false,
};

export default function PrestamoFormModal({ clienteId }: { clienteId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(crearPrestamo, initialState);

  const { data: draft, setFieldValue, clearDraft } = usePersistentForm(`crear-prestamo-${clienteId}`, {
    monto: "",
    interes: "20",
    frecuencia: "DIARIA",
    numeroCuotas: "30",
    fechaInicio: new Date().toISOString().split('T')[0],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFieldValue(e.target.name as any, e.target.value);
  };

  // Cálculos en tiempo real para el Resumen
  const capitalVal = parseFloat(draft.monto) || 0;
  const interesTasa = parseFloat(draft.interes) || 0;
  const nCuotas = parseInt(draft.numeroCuotas) || 0;

  const interesMonetario = Math.round(capitalVal * (interesTasa / 100) * 100) / 100;
  const totalPagar = capitalVal + interesMonetario;
  const cuotaValor = nCuotas > 0 ? Math.round((totalPagar / nCuotas) * 100) / 100 : 0;

  useEffect(() => {
    if (state?.success && isOpen) {
      const timer = setTimeout(() => {
        setIsOpen(false);
        clearDraft();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state?.success, isOpen, clearDraft]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-3 bg-ios-blue text-white px-8 py-4 rounded-[22px] font-[800] text-[13px] uppercase tracking-[2px] shadow-xl shadow-ios-blue/20 hover:scale-105 active:scale-95 transition-all"
      >
        <Plus weight="bold" size={20} />
        NUEVO CRÉDITO
      </button>

      <IosModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Estructurar Crédito"
        subtitle="Configuración de Cartera"
        icon={<Wallet weight="fill" size={24} />}
      >
        {state?.success ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 text-center"
          >
            <div className="w-20 h-20 bg-ios-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle weight="fill" className="w-12 h-12 text-ios-green" />
            </div>
            <h4 className="text-[22px] font-[900] text-black tracking-tight">¡Solicitud Emitida!</h4>
            <p className="text-[14px] font-semibold text-ios-gray mt-2">El crédito ha sido creado exitosamente en el sistema.</p>
          </motion.div>
        ) : (
          <form action={formAction} className="space-y-6">
            <input type="hidden" name="clienteId" value={clienteId} />

            {state?.error && (
              <div className="p-4 bg-ios-pink/5 border border-ios-pink/10 text-ios-pink text-[11px] font-black uppercase tracking-wider rounded-2xl flex items-center gap-3">
                <X weight="bold" size={16} />
                {state.error}
              </div>
            )}

            <div className="ios-card bg-white p-6 space-y-6 border-none shadow-sm">
              <div className="grid grid-cols-1 gap-6">
                 <div className="space-y-2">
                   <label className="ios-section-title pl-0 mb-1">Monto Capital</label>
                   <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ios-blue font-black text-lg">$</div>
                      <input
                         type="number"
                         name="monto"
                         value={draft.monto}
                         onChange={handleChange}
                         required
                         className="w-full ios-input pl-10 text-[18px] font-[900] text-black tracking-tight"
                         placeholder="0.00"
                         disabled={isPending}
                      />
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="ios-section-title pl-0 mb-1">Interés (%)</label>
                     <div className="relative">
                        <Percent weight="fill" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ios-gray opacity-30" />
                        <input
                           type="number"
                           name="interes"
                           value={draft.interes}
                           onChange={handleChange}
                           required
                           className="w-full ios-input pl-11 text-[18px] font-[900] text-black tracking-tight"
                           placeholder="20"
                           disabled={isPending}
                        />
                     </div>
                   </div>

                   <div className="space-y-2">
                     <label className="ios-section-title pl-0 mb-1">Nº Cuotas</label>
                     <div className="relative">
                        <Hash weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ios-gray opacity-30" />
                        <input
                           type="number"
                           name="numeroCuotas"
                           value={draft.numeroCuotas}
                           onChange={handleChange}
                           required
                           className="w-full ios-input pl-11 text-[18px] font-[900] text-black tracking-tight"
                           placeholder="30"
                           disabled={isPending}
                        />
                     </div>
                   </div>
                 </div>

                 <div className="space-y-2">
                   <label className="ios-section-title pl-0 mb-1">Frecuencia</label>
                    <div className="relative">
                      <Clock weight="fill" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ios-gray opacity-30 pointer-events-none" />
                      <select
                        name="frecuencia"
                        value={draft.frecuencia}
                        onChange={handleChange}
                        required
                        className="w-full ios-input pl-11 text-[15px] font-[900] text-black tracking-tight appearance-none bg-white"
                        disabled={isPending}
                     >
                        <option value="DIARIA">DIARIA</option>
                        <option value="SEMANAL">SEMANAL</option>
                        <option value="QUINCENAL">QUINCENAL</option>
                        <option value="MENSUAL">MENSUAL</option>
                     </select>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="ios-section-title pl-0 mb-1">Fecha de Desembolso</label>
                    <div className="relative">
                       <CalendarBlank weight="fill" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ios-gray opacity-30" />
                        <input
                          type="date"
                          name="fechaInicio"
                          required
                          value={draft.fechaInicio}
                          onChange={handleChange}
                          className="w-full ios-input pl-11 text-[15px] font-[900] text-black tracking-tight"
                          disabled={isPending}
                       />
                    </div>
                 </div>
              </div>
            </div>

            {/* Financial Summary */}
            {capitalVal > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="ios-glass bg-ios-blue/5 border-none p-6 rounded-[28px] space-y-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkle weight="fill" className="text-ios-blue" size={16} />
                  <span className="text-[11px] font-black uppercase tracking-widest text-ios-blue">Resumen del Plan</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-ios-gray uppercase tracking-wider">Interés Total</p>
                    <p className="text-[15px] font-[900] text-black tracking-tight">{formatCurrency(interesMonetario)}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-bold text-ios-gray uppercase tracking-wider">Total a Pagar</p>
                    <p className="text-[17px] font-[1000] text-ios-blue tracking-tighter">{formatCurrency(totalPagar)}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-ios-blue/10 flex justify-between items-center">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-ios-green animate-pulse" />
                     <p className="text-[11px] font-bold text-ios-gray uppercase tracking-wider">Valor por Cuota</p>
                   </div>
                   <p className="text-[18px] font-[1000] text-black tracking-tighter">{formatCurrency(cuotaValor)}</p>
                </div>
              </motion.div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="w-full ios-btn-primary h-[64px] shadow-2xl shadow-ios-blue/30 flex items-center justify-center gap-3"
              >
                {isPending ? (
                  <>
                    <CircleNotch weight="bold" className="w-5 h-5 animate-spin" />
                    PROCESANDO...
                  </>
                ) : (
                  <>
                    <Lightning weight="fill" size={22} className="text-ios-yellow" />
                    EMITIR CRÉDITO
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </IosModal>
    </>
  );
}

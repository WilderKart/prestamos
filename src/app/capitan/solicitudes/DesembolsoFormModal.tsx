"use client";

import { useState, useActionState, useEffect } from "react";
import { usePersistentForm } from "@/hooks/usePersistentForm";
import { registrarDesembolso } from "./desembolsoActions";
import { 
  Money, 
  UploadSimple, 
  X, 
  CheckCircle, 
  CircleNotch, 
  Receipt,
  Coin,
  DeviceMobile,
  Bank,
  User
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/utils/format";
import IosModal from "@/components/ui/IosModal";

interface DesembolsoFormModalProps {
  prestamoId: string;
  montoPrestamo: number;
  clienteNombre: string;
  onSuccess?: () => void;
}

export default function DesembolsoFormModal({
  prestamoId,
  montoPrestamo,
  clienteNombre,
  onSuccess,
}: DesembolsoFormModalProps) {
  const [open, setOpen] = useState(false);
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null);
  const [state, formAction, pending] = useActionState(registrarDesembolso, null);

  const { data: draft, setFieldValue, clearDraft } = usePersistentForm(`desembolso-${prestamoId}`, {
    monto: montoPrestamo.toString(),
    metodo: "efectivo",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(e.target.name as any, e.target.value);
  };

  const handleSubmit = async (formData: FormData) => {
    if (comprobanteFile) {
      formData.set("comprobante", comprobanteFile);
    }
    formAction(formData);
  };

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        setOpen(false);
        clearDraft();
        onSuccess?.();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state?.success, clearDraft, onSuccess]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-6 py-3 bg-ios-green/10 text-ios-green rounded-2xl hover:bg-ios-green/20 active:scale-95 transition-all font-[800] text-[13px] uppercase tracking-wider border border-ios-green/20 shadow-sm"
      >
        <Money weight="fill" size={18} />
        REGISTRAR DESEMBOLSO
      </button>

      <IosModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Confirmar Entrega"
        subtitle={clienteNombre}
        icon={<Money weight="fill" size={22} />}
      >
        {state?.success ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-ios-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle weight="fill" className="w-12 h-12 text-ios-green" />
            </div>
            <h4 className="text-[20px] font-[900] text-black tracking-tight">¡Éxito total!</h4>
            <p className="text-[14px] font-semibold text-ios-gray mt-2">El desembolso ha sido procesado y vinculado.</p>
          </motion.div>
        ) : (
          <form action={handleSubmit} className="space-y-6 pb-20">
            <input type="hidden" name="prestamoId" value={prestamoId} />

            <div className="ios-card bg-white p-6 space-y-4 shadow-sm">
              <div>
                <label className="ios-section-title pl-0 mb-2">Capital a entregar</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ios-green font-black text-xl">$</div>
                  <input
                    type="number"
                    name="monto"
                    value={draft.monto}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    required
                    className="w-full ios-input pl-10 text-[24px] font-[900] text-black tracking-tighter"
                    disabled={pending}
                  />
                </div>
              </div>

              <div>
                <label className="ios-section-title pl-0 mb-3">Método de Transferencia</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "efectivo", label: "Efectivo", icon: Coin, color: "text-ios-yellow" },
                    { value: "nequi", label: "Nequi", icon: DeviceMobile, color: "text-ios-pink" },
                    { value: "daviplata", label: "Daviplata", icon: DeviceMobile, color: "text-ios-pink" },
                    { value: "transferencia", label: "Banco", icon: Bank, color: "text-ios-blue" },
                  ].map((m) => {
                    const MIcon = m.icon;
                    const isSelected = draft.metodo === m.value;
                    return (
                      <label
                        key={m.value}
                        className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected 
                          ? 'bg-white border-ios-blue shadow-[0_4px_12px_rgba(0,122,255,0.1)]' 
                          : 'bg-ios-bg border-transparent opacity-60'
                        }`}
                      >
                        <input
                          type="radio"
                          name="metodo"
                          value={m.value}
                          className="sr-only"
                          checked={isSelected}
                          onChange={handleChange}
                        />
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-ios-blue/10' : 'bg-white'}`}>
                          <MIcon weight="fill" size={20} className={m.color} />
                        </div>
                        <span className="text-[13px] font-black text-black tracking-tight">{m.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="ios-card bg-white p-6 shadow-sm">
              <label className="ios-section-title pl-0 mb-2">Comprobante de Captura</label>
              <label className="flex flex-col items-center justify-center w-full h-[120px] rounded-2xl border-2 border-dashed border-black/5 bg-ios-bg/30 cursor-pointer hover:bg-ios-bg/50 transition-all group">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-transform group-hover:scale-110 ${comprobanteFile ? 'bg-ios-green/10' : 'bg-white shadow-sm'}`}>
                  {comprobanteFile ? <CheckCircle weight="fill" size={24} className="text-ios-green" /> : <UploadSimple weight="bold" size={24} className="text-ios-blue" />}
                </div>
                <span className="text-[11px] font-[800] text-ios-gray uppercase tracking-widest text-center px-4">
                  {comprobanteFile ? comprobanteFile.name : "Subir Foto o PDF"}
                </span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setComprobanteFile(e.target.files?.[0] || null)}
                  className="hidden"
                  disabled={pending}
                />
              </label>
            </div>

            {state?.error && (
              <div className="bg-ios-pink/5 border border-ios-pink/10 rounded-2xl p-4 text-[12px] font-black text-ios-pink uppercase tracking-wider">
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full ios-btn-primary h-[64px] flex items-center justify-center gap-3 shadow-2xl shadow-ios-blue/10"
            >
              {pending ? (
                <>
                  <CircleNotch weight="bold" className="w-5 h-5 animate-spin" />
                  PROCESANDO...
                </>
              ) : (
                <>
                  <Receipt weight="fill" size={22} />
                  REGISTRAR DESEMBOLSO
                </>
              )}
            </button>
          </form>
        )}
      </IosModal>
    </>
  );
}

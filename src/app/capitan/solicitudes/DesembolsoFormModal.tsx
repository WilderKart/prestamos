"use client";

import { useState, useActionState } from "react";
import { registrarDesembolso } from "./desembolsoActions";
import { Banknote, Upload, X, Check, Loader2, Receipt } from "lucide-react";

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

  const handleSubmit = async (formData: FormData) => {
    if (comprobanteFile) {
      formData.set("comprobante", comprobanteFile);
    }
    formAction(formData);
  };

  if (state?.success) {
    setTimeout(() => {
      setOpen(false);
      onSuccess?.();
    }, 1500);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-accent-yellow/10 text-accent-yellow rounded-xl hover:bg-accent-yellow/20 transition-all font-bold text-sm"
      >
        <Banknote className="w-4 h-4" />
        Registrar Desembolso
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-yellow rounded-xl flex items-center justify-center">
                  <Banknote className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Registrar Desembolso</h3>
                  <p className="text-xs text-gray-500">{clienteNombre}</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {state?.success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-lg font-bold text-gray-900">Desembolso Registrado</h4>
                <p className="text-sm text-gray-500 mt-1">El desembolso ha sido registrado exitosamente.</p>
              </div>
            ) : (
              <form action={handleSubmit} className="space-y-4">
                <input type="hidden" name="prestamoId" value={prestamoId} />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monto desembolsado</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                    <input
                      type="number"
                      name="monto"
                      defaultValue={montoPrestamo}
                      step="0.01"
                      min="0"
                      required
                      className="w-full pl-8 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-semibold focus:ring-2 focus:ring-accent-yellow/50 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Método de entrega</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "efectivo", label: "Efectivo", icon: "💵" },
                      { value: "nequi", label: "Nequi", icon: "📱" },
                      { value: "daviplata", label: "Daviplata", icon: "📲" },
                      { value: "transferencia", label: "Transferencia", icon: "🏦" },
                    ].map((m) => (
                      <label
                        key={m.value}
                        className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-accent-yellow hover:bg-accent-yellow/5 transition-all has-[:checked]:border-accent-yellow has-[:checked]:bg-accent-yellow/10"
                      >
                        <input
                          type="radio"
                          name="metodo"
                          value={m.value}
                          required
                          className="sr-only"
                          defaultChecked={m.value === "efectivo"}
                        />
                        <span className="text-lg">{m.icon}</span>
                        <span className="text-sm font-medium text-gray-700">{m.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comprobante (opcional)</label>
                  <label className="flex flex-col items-center justify-center w-full h-24 rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-accent-yellow hover:bg-accent-yellow/5 transition-all">
                    <Upload className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">
                      {comprobanteFile ? comprobanteFile.name : "Subir archivo"}
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setComprobanteFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>

                {state?.error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
                    {state.error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={pending}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent-yellow text-black rounded-xl hover:opacity-90 transition-all disabled:opacity-50 font-bold text-sm"
                >
                  {pending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <Receipt className="w-4 h-4" />
                      Registrar Desembolso
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

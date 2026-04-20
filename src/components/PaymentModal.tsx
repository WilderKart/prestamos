"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  Coins, 
  CreditCard, 
  Bank,
  CheckCircle,
  CircleNotch,
  Money,
  Receipt
} from "@phosphor-icons/react";
import IosModal from "@/components/ui/IosModal";
import { registerManualPaymentAction } from "@/app/actions/routes";

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  client 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  client: any;
}) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("EFECTIVO");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await registerManualPaymentAction({
      clienteId: client.id,
      monto: Number(amount),
      metodo: method
    });

    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setAmount("");
      }, 1500);
    } else {
      setError(result.error || "Error al registrar el pago");
    }
    setIsSubmitting(false);
  };

  return (
    <IosModal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Pago"
      subtitle={`Cliente: ${client?.usuarios?.nombre}`}
      icon={<Money weight="fill" size={32} />}
    >
      {isSuccess ? (
        <div className="py-12 flex flex-col items-center text-center space-y-6">
          <div className="w-24 h-24 bg-ios-green/10 rounded-full flex items-center justify-center text-ios-green">
            <CheckCircle weight="fill" size={64} />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-[1000] text-black tracking-tighter">Pago Exitoso</h2>
            <p className="text-black/40 font-bold uppercase tracking-widest text-[11px]">Sincronización de Cartera Completada</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 bg-ios-pink/10 border border-ios-pink/20 rounded-2xl text-ios-pink text-[13px] font-bold">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <label className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em] ml-2">Monto del Recaudo</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-black/20">$</span>
              <input
                required
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-black/[0.03] border-none rounded-[28px] py-6 pl-12 pr-6 text-4xl font-[1000] text-black outline-none focus:ring-4 focus:ring-ios-blue/5 transition-all tracking-tighter"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em] ml-2">Método de Pago</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "EFECTIVO", icon: Coins, label: "Efectivo" },
                { id: "NEQUI", icon: CreditCard, label: "Nequi" },
                { id: "BANCO", icon: Bank, label: "Banco" }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMethod(item.id)}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-[24px] border-2 transition-all ${
                    method === item.id 
                      ? "bg-black text-white border-black shadow-xl" 
                      : "bg-white border-black/5 text-black/40 hover:border-black/20"
                  }`}
                >
                  <item.icon weight={method === item.id ? "fill" : "bold"} size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={isSubmitting || !amount}
            type="submit"
            className="w-full h-16 bg-ios-blue text-white rounded-[24px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-ios-blue/30 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-3"
          >
            {isSubmitting ? <CircleNotch className="animate-spin" size={24} weight="bold" /> : <Receipt weight="fill" size={24} />}
            REGISTRAR PAGO
          </button>
        </form>
      )}
    </IosModal>
  );
}

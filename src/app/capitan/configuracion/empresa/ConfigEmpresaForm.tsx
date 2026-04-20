"use client";

import { useState } from "react";
import { updateCompanyConfigAction } from "@/app/actions/config";
import { 
  CurrencyDollar, 
  Camera, 
  CircleNotch, 
  CheckCircle,
  WarningCircle
} from "@phosphor-icons/react";
import { toast } from "react-hot-toast";

interface ConfigFormProps {
  initialConfig: {
    monto_minimo_comprobante: number;
    requiere_comprobante: boolean;
  };
}

export default function ConfigEmpresaForm({ initialConfig }: ConfigFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialConfig || {
    monto_minimo_comprobante: 50000,
    requiere_comprobante: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await updateCompanyConfigAction(formData);

    if (result.success) {
      toast.success("Configuración actualizada con éxito");
    } else {
      toast.error(result.error || "Error al actualizar");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="ios-glass p-8 rounded-[40px] border-none shadow-2xl space-y-8">
        <h3 className="text-xl font-[1000] text-black tracking-tight">Reglas de Recaudo</h3>
        
        <div className="space-y-6">
          {/* Monto Mínimo */}
          <div className="space-y-3">
             <div className="flex items-center gap-2">
                <CurrencyDollar weight="fill" className="text-ios-blue" size={20} />
                <label className="text-[12px] font-black text-black/40 uppercase tracking-widest">Monto Mínimo para Comprobante</label>
             </div>
             <input
                type="number"
                value={formData.monto_minimo_comprobante}
                onChange={(e) => setFormData({ ...formData, monto_minimo_comprobante: Number(e.target.value) })}
                className="w-full bg-black/[0.03] border-none rounded-2xl py-4 px-6 text-lg font-bold outline-none focus:ring-2 focus:ring-ios-blue transition-all"
                placeholder="Ej. 50000"
             />
             <p className="text-[10px] font-semibold text-ios-gray/40 px-2 italic">
               Los cobros mayores o iguales a este monto exigirán una foto de evidencia al cobrador.
             </p>
          </div>

          {/* Toggle Requiere Siempre */}
          <div 
            onClick={() => setFormData({ ...formData, requiere_comprobante: !formData.requiere_comprobante })}
            className="flex items-center justify-between p-6 bg-black/[0.02] rounded-3xl cursor-pointer hover:bg-black/[0.04] transition-all"
          >
             <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${formData.requiere_comprobante ? "bg-ios-green/10 text-ios-green" : "bg-black/5 text-black/20"}`}>
                   <Camera weight="fill" size={24} />
                </div>
                <div>
                   <p className="text-[13px] font-[1000] text-black tracking-tight">Evidencia Obligatoria</p>
                   <p className="text-[10px] font-bold text-ios-gray/40 uppercase tracking-tighter">Independiente del monto</p>
                </div>
             </div>
             
             <div className={`w-14 h-8 rounded-full relative transition-all duration-300 p-1 ${formData.requiere_comprobante ? "bg-ios-green" : "bg-black/10"}`}>
                <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 transform ${formData.requiere_comprobante ? "translate-x-6" : "translate-x-0"}`} />
             </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-6 bg-ios-blue text-white rounded-[28px] text-[13px] font-black uppercase tracking-[0.2em] shadow-xl shadow-ios-blue/30 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {loading ? (
            <CircleNotch className="animate-spin" size={24} weight="bold" />
          ) : (
            <>
              <CheckCircle weight="fill" size={24} />
              Guardar Configuración
            </>
          )}
        </button>
      </div>

      <div className="p-6 bg-ios-yellow/10 rounded-[32px] border border-ios-yellow/20 flex gap-4 items-start">
         <WarningCircle weight="fill" className="text-ios-yellow mt-1 shrink-0" size={24} />
         <div className="space-y-1">
            <p className="text-[13px] font-black text-black">Aviso de Seguridad</p>
            <p className="text-[11px] font-semibold text-black/60 leading-relaxed">
              Cualquier cambio en estas reglas se aplicará instantáneamente a todos los cobradores en campo. Asegúrate de comunicar los cambios operativos a tu equipo.
            </p>
         </div>
      </div>
    </form>
  );
}

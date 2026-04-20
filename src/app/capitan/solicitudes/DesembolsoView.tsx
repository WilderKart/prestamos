"use client";

import { useState } from "react";
import { CheckCircle, CaretRight } from "@phosphor-icons/react";
import ComprobanteModal from "./ComprobanteModal";

export default function DesembolsoView({ desembolso, monto, clienteNombre }: any) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className="ios-glass-alt p-6 flex items-center justify-between rounded-[32px] border-none bg-ios-green/[0.03] group/item cursor-pointer active:scale-[0.98] transition-all"
      >
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-ios-green text-white rounded-2xl flex items-center justify-center shadow-xl shadow-ios-green/20">
            <CheckCircle weight="fill" size={28} />
          </div>
          <div>
            <p className="text-[15px] font-[1000] text-black leading-none mb-1 uppercase tracking-tight">Impacto de Capital Completado</p>
            <p className="text-[11px] text-black/30 font-black uppercase tracking-[0.2em]">
              Metodo: {desembolso.metodo_desembolso} • {new Date(desembolso.fecha_desembolso).toLocaleDateString("es").toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           {desembolso.comprobante_url && (
             <div className="px-3 py-1 bg-ios-green/10 text-ios-green rounded-lg text-[9px] font-black uppercase tracking-widest">
                Evidencia Lista
             </div>
           )}
           <CaretRight weight="bold" size={20} className="text-black/10 group-hover/item:text-black group-hover/item:translate-x-2 transition-all" />
        </div>
      </div>

      {isOpen && (
        <ComprobanteModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          desembolso={desembolso}
          clienteNombre={clienteNombre}
          monto={monto}
        />
      )}
    </>
  );
}

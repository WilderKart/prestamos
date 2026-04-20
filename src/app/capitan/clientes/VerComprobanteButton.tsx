"use client";

import { useState } from "react";
import { Receipt, CircleNotch, WarningCircle } from "@phosphor-icons/react";
import { getSignedComprobanteUrl } from "@/app/capitan/solicitudes/desembolsoActions";
import ComprobanteModal from "@/app/capitan/solicitudes/ComprobanteModal";

interface VerComprobanteButtonProps {
  desembolso: any;
  monto: number;
  clienteNombre: string;
}

export default function VerComprobanteButton({ 
  desembolso, 
  monto, 
  clienteNombre 
}: VerComprobanteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // No renderizar si no hay comprobante
  if (!desembolso?.comprobante_url) return null;

  const handleOpen = async () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Validación previa en servidor via Server Action (Zero Trust)
      const res = await getSignedComprobanteUrl(desembolso.comprobante_url);
      
      if (res.error) {
        setError(res.error);
        // Desvanecer error tras 5 segundos
        setTimeout(() => setError(null), 5000);
      } else {
        // Abrir modal solo si la URL es válida
        setIsOpen(true);
      }
    } catch (err) {
      setError("Error de conexión con el nodo de seguridad.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative">
        <button 
          onClick={handleOpen}
          disabled={loading}
          className={`flex items-center justify-center gap-3 px-6 py-3 bg-white border border-black/[0.02] rounded-2xl text-[11px] font-black uppercase tracking-widest text-black hover:bg-black hover:text-white transition-all shadow-xl active:scale-95 group/link disabled:opacity-50 disabled:cursor-wait`}
        >
          {loading ? (
            <CircleNotch size={20} className="animate-spin" />
          ) : (
            <Receipt weight="fill" size={20} />
          )}
          VER COMPROBANTE
        </button>

        {/* Feedback de error flotante */}
        {error && (
          <div className="absolute bottom-full right-0 mb-3 p-4 bg-white/95 text-ios-pink rounded-2xl text-[10px] font-black uppercase tracking-tight flex items-center gap-3 animate-fade-in z-[60] w-64 shadow-2xl backdrop-blur-xl border border-ios-pink/10 ring-1 ring-ios-pink/20">
            <div className="w-8 h-8 rounded-lg bg-ios-pink/10 flex items-center justify-center shrink-0">
               <WarningCircle weight="fill" size={18} />
            </div>
            <p className="leading-tight">{error}</p>
          </div>
        )}
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

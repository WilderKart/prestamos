"use client";

import { useState } from "react";
import { Plus, CircleNotch, PaperPlaneTilt, Compass } from "@phosphor-icons/react";
import { generateDailyRoutesAction } from "@/app/actions/routes";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function GenerateRoutesButton() {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!confirm("¿Deseas generar las rutas para el día de hoy? Esto balanceará los clientes asignados entre los cobradores activos.")) {
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Balanceando Matriz de Cobro...", {
      style: {
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        fontWeight: '800',
        fontSize: '13px',
        border: '1px solid rgba(0,0,0,0.05)'
      }
    });

    try {
      const result = await generateDailyRoutesAction();
      
      if (result.success) {
        toast.success(result.message || "Rutas Optimizadas", { id: toastId });
      } else {
        toast.error(result.error || "Fallo en Sincronización", { id: toastId });
      }
    } catch (error) {
      toast.error("Error de conexión al Nodo Maestro", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGenerate}
      disabled={loading}
      className={`
        px-10 py-5 rounded-[28px] font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl transition-all 
        flex items-center gap-4 active:scale-95 border-none
        ${loading 
          ? "bg-black/5 text-black/20 cursor-not-allowed" 
          : "bg-black text-white hover:bg-ios-blue shadow-ios-blue/10 hover:shadow-ios-blue/30"
        }
      `}
    >
      {loading ? (
        <>
          <CircleNotch size={20} weight="bold" className="animate-spin" />
          Sincronizando...
        </>
      ) : (
        <>
          <Compass weight="fill" size={20} className="group-hover:rotate-45 transition-transform" />
          Generar Rutas Hoy
        </>
      )}
    </button>
  );
}

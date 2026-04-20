"use client";

import { useState } from "react";
import { processarPago } from "./actions";
import { 
  CheckCircle, 
  XCircle, 
  CircleNotch,
  HandsClapping,
  WarningCircle,
  ShieldCheck
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

export default function PagoActionButtons({ pagoId }: { pagoId: string }) {
  const [isPendingApprove, setIsPendingApprove] = useState(false);
  const [isPendingReject, setIsPendingReject] = useState(false);
  const [error, setError] = useState("");

  const handleAction = async (accion: "APROBAR" | "RECHAZAR") => {
    if (accion === "APROBAR") setIsPendingApprove(true);
    if (accion === "RECHAZAR") setIsPendingReject(true);
    setError("");

    try {
      const res = await processarPago(pagoId, accion);
      if (res.error) {
        setError(res.error);
      }
    } catch (e) {
      setError("Fallo en sincronización");
    } finally {
      if (accion === "APROBAR") setIsPendingApprove(false);
      if (accion === "RECHAZAR") setIsPendingReject(false);
    }
  };

  const isAnyPending = isPendingApprove || isPendingReject;

  return (
    <div className="flex flex-col items-end gap-3">
      <div className="flex gap-4 p-1.5 ios-glass border-none rounded-2xl shadow-sm">
        <button
          onClick={() => handleAction("RECHAZAR")}
          disabled={isAnyPending}
          className={`flex items-center gap-2.5 px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${
            isAnyPending
              ? "opacity-20 cursor-not-allowed"
              : "bg-black/[0.03] text-ios-pink hover:bg-ios-pink hover:text-white active:scale-90"
          }`}
        >
          {isPendingReject ? <CircleNotch className="w-4 h-4 animate-spin" weight="bold" /> : <XCircle weight="fill" size={18} />}
          Rechazar
        </button>

        <button
          onClick={() => handleAction("APROBAR")}
          disabled={isAnyPending}
          className={`flex items-center gap-2.5 px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg ${
            isAnyPending
              ? "opacity-20 cursor-not-allowed"
              : "bg-ios-blue text-white shadow-ios-blue/20 hover:scale-105 active:scale-95"
          }`}
        >
          {isPendingApprove ? <CircleNotch className="w-4 h-4 animate-spin" weight="bold" /> : <CheckCircle weight="fill" size={18} />}
          Sincronizar
        </button>
      </div>
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-3 py-1.5 bg-ios-pink/5 text-ios-pink text-[9px] font-black uppercase tracking-widest rounded-lg"
          >
             <WarningCircle weight="fill" size={12} />
             {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

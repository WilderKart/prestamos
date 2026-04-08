"use client";

import { useState } from "react";
import { processarPago } from "./actions";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

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
      setError("Error de conexión");
    } finally {
      if (accion === "APROBAR") setIsPendingApprove(false);
      if (accion === "RECHAZAR") setIsPendingReject(false);
    }
  };

  const isAnyPending = isPendingApprove || isPendingReject;

  return (
    <div className="flex flex-col items-end gap-3">
      <div className="flex gap-3">
        <button
          onClick={() => handleAction("RECHAZAR")}
          disabled={isAnyPending}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all border ${
            isAnyPending
              ? "bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed"
              : "bg-white text-red-500 border-red-50 hover:bg-red-50"
          }`}
        >
          {isPendingReject ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
          Rechazar
        </button>

        <button
          onClick={() => handleAction("APROBAR")}
          disabled={isAnyPending}
          className={`inline-flex items-center gap-2 px-5 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${
            isAnyPending
              ? "bg-gray-100 text-gray-300 cursor-not-allowed"
              : "bg-black text-[#F5C518] hover:scale-105 active:scale-95 shadow-xl shadow-black/20"
          }`}
        >
          {isPendingApprove ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
          Aprobar
        </button>
      </div>
      {error && <p className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg animate-shake">{error}</p>}
    </div>
  );
}

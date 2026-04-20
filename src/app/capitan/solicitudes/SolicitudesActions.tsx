"use client";

import { useState } from "react";
import { aprobarSolicitud, rechazarSolicitud, solicitarFiador } from "./actions";
import { 
  CheckCircle, 
  XCircle, 
  UserPlus, 
  CircleNotch,
  WarningCircle,
  ChatCircleText,
  CaretRight,
  ShieldCheck,
  X
} from "@phosphor-icons/react";
import DesembolsoFormModal from "./DesembolsoFormModal";
import { motion, AnimatePresence } from "framer-motion";

export default function SolicitudesActions({
  solicitudId,
  prestamoId,
  montoAprobado,
  clienteNombre,
}: {
  solicitudId: string;
  prestamoId?: string;
  montoAprobado?: number;
  clienteNombre?: string;
}) {
  const [action, setAction] = useState<string | null>(null);
  const [showFiadorModal, setShowFiadorModal] = useState(false);
  const [motivoFiador, setMotivoFiador] = useState("");
  const [showDesembolso, setShowDesembolso] = useState(false);
  const [aprobadoPrestamoId, setAprobadoPrestamoId] = useState<string | undefined>(prestamoId);
  const [aprobadoMonto, setAprobadoMonto] = useState<number | undefined>(montoAprobado);
  const [aprobadoNombre, setAprobadoNombre] = useState<string | undefined>(clienteNombre);

  const handleAprobar = async () => {
    setAction("aprobar");
    const result = await aprobarSolicitud(solicitudId);
    setAction(null);
    if (result?.success) {
      setAprobadoPrestamoId(result.prestamoId);
      setAprobadoMonto(result.monto);
      setAprobadoNombre(result.clienteNombre);
      setShowDesembolso(true);
    }
  };

  const handleRechazar = async () => {
    const motivo = prompt("Motivo del rechazo (opcional):");
    if (motivo === null) return;
    
    setAction("rechazar");
    await rechazarSolicitud(solicitudId, motivo || undefined);
    setAction(null);
  };

  const handleSolicitarFiador = async () => {
    setAction("fiador");
    await solicitarFiador(solicitudId, motivoFiador || undefined);
    setAction(null);
    setShowFiadorModal(false);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleAprobar}
          disabled={action !== null}
          className="flex-1 min-w-[120px] h-12 bg-ios-green text-white rounded-xl flex items-center justify-center gap-2 font-black text-[11px] uppercase tracking-widest shadow-lg shadow-ios-green/10 active:scale-95 transition-all disabled:opacity-50"
        >
          {action === "aprobar" ? (
            <CircleNotch className="w-5 h-5 animate-spin" weight="bold" />
          ) : (
            <CheckCircle className="w-5 h-5" weight="fill" />
          )}
          Aprobar
        </button>

        <button
          onClick={() => setShowFiadorModal(true)}
          disabled={action !== null}
          className="flex-1 min-w-[150px] h-12 bg-ios-blue/10 text-ios-blue rounded-xl flex items-center justify-center gap-2 font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50"
        >
          <UserPlus className="w-5 h-5" weight="fill" />
          Pedir Fiador
        </button>

        <button
          onClick={handleRechazar}
          disabled={action !== null}
          className="flex-1 min-w-[120px] h-12 bg-ios-pink/5 text-ios-pink rounded-xl flex items-center justify-center gap-2 font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50"
        >
          {action === "rechazar" ? (
            <CircleNotch className="w-5 h-5 animate-spin" weight="bold" />
          ) : (
            <XCircle className="w-5 h-5" weight="fill" />
          )}
          Rechazar
        </button>
      </div>

      <AnimatePresence>
        {showFiadorModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setShowFiadorModal(false)}
            />

            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden p-8"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <h3 className="text-2xl font-[900] text-black tracking-tighter">Garantía Requerida</h3>
                  <p className="text-[13px] font-medium text-black/40">Especifica por qué se necesita un fiador.</p>
                </div>
                <button 
                  onClick={() => setShowFiadorModal(false)}
                  className="w-10 h-10 bg-black/5 rounded-2xl flex items-center justify-center text-black/30 hover:text-black transition-colors"
                >
                  <X weight="bold" size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="relative">
                  <ChatCircleText weight="fill" size={20} className="absolute left-5 top-5 text-black/10" />
                  <textarea
                    value={motivoFiador}
                    onChange={(e) => setMotivoFiador(e.target.value)}
                    placeholder="Escribe el reporte técnico..."
                    className="w-full rounded-[24px] bg-black/[0.03] border-none px-14 py-5 text-[15px] font-bold text-black focus:ring-4 focus:ring-ios-blue/10 outline-none resize-none transition-all"
                    rows={4}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSolicitarFiador}
                    disabled={action === "fiador"}
                    className="flex-[2] h-14 bg-black text-white rounded-[20px] flex items-center justify-center gap-3 font-black text-[11px] uppercase tracking-widest shadow-xl active:scale-95 disabled:opacity-50"
                  >
                    {action === "fiador" ? (
                      <CircleNotch className="w-5 h-5 animate-spin" weight="bold" />
                    ) : (
                      <CheckCircle className="w-5 h-5" weight="fill" />
                    )}
                    Confirmar
                  </button>
                  <button
                    onClick={() => setShowFiadorModal(false)}
                    className="flex-1 h-14 bg-black/[0.03] text-black/30 rounded-[20px] font-black text-[11px] uppercase tracking-widest"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showDesembolso && aprobadoPrestamoId && (
        <DesembolsoFormModal
          prestamoId={aprobadoPrestamoId}
          montoPrestamo={aprobadoMonto || 0}
          clienteNombre={aprobadoNombre || "Cliente"}
          onSuccess={() => {
            setShowDesembolso(false);
            setAprobadoPrestamoId(undefined);
          }}
        />
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { aprobarSolicitud, rechazarSolicitud, solicitarFiador } from "./actions";
import { Check, X, UserPlus, Loader2 } from "lucide-react";
import DesembolsoFormModal from "./DesembolsoFormModal";

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
  const [motivoRechazo, setMotivoRechazo] = useState("");
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
    setAction("rechazar");
    await rechazarSolicitud(solicitudId, motivoRechazo || undefined);
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
      <div className="flex gap-2">
        <button
          onClick={handleAprobar}
          disabled={action !== null}
          className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500/20 transition-all disabled:opacity-50 font-bold text-sm"
        >
          {action === "aprobar" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          Aprobar
        </button>

        <button
          onClick={() => setShowFiadorModal(true)}
          disabled={action !== null}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 text-orange-500 rounded-xl hover:bg-orange-500/20 transition-all disabled:opacity-50 font-bold text-sm"
        >
          <UserPlus className="w-4 h-4" />
          Solicitar Fiador
        </button>

        <button
          onClick={async () => {
            const motivo = prompt("Motivo del rechazo (opcional):");
            if (motivo !== null) {
              setMotivoRechazo(motivo);
              await handleRechazar();
            }
          }}
          disabled={action !== null}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all disabled:opacity-50 font-bold text-sm"
        >
          {action === "rechazar" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <X className="w-4 h-4" />
          )}
          Rechazar
        </button>
      </div>

      {showFiadorModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-mivank-card border border-mivank-border rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-mivank-text mb-4">
              Solicitar Fiador
            </h3>
            <textarea
              value={motivoFiador}
              onChange={(e) => setMotivoFiador(e.target.value)}
              placeholder="Motivo por el que se requiere fiador (opcional)"
              className="w-full rounded-xl bg-mivank-elevated border border-mivank-border px-4 py-3 text-sm text-mivank-text focus:ring-2 focus:ring-mivank-accent/50 outline-none resize-none mb-4"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSolicitarFiador}
                disabled={action === "fiador"}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-mivank-accent text-mivank-bg rounded-xl hover:opacity-90 transition-all disabled:opacity-50 font-bold text-sm"
              >
                {action === "fiador" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                Confirmar
              </button>
              <button
                onClick={() => setShowFiadorModal(false)}
                className="px-4 py-2 bg-mivank-elevated text-mivank-text rounded-xl hover:bg-mivank-elevated/80 transition-all font-bold text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

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

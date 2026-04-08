"use client";

import { useState } from "react";
import { crearSolicitudPrestamo } from "./actions";
import { Wallet, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SolicitudForm() {
  const [monto, setMonto] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      setError("Ingresa un monto válido");
      setLoading(false);
      return;
    }

    const result = await crearSolicitudPrestamo(montoNum);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setMonto("");
      setTimeout(() => {
        setSuccess(false);
        router.refresh();
      }, 2000);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center">
        <p className="text-green-500 font-bold">
          Solicitud creada exitosamente
        </p>
        <p className="text-sm text-mivank-text-muted mt-1">
          Tu capitán revisará la solicitud pronto
        </p>
      </div>
    );
  }

  return (
    <div className="bg-mivank-card border border-mivank-border rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-mivank-accent/10 rounded-xl">
          <Wallet className="w-6 h-6 text-mivank-accent" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-mivank-text">
            Nueva Solicitud
          </h2>
          <p className="text-xs text-mivank-text-muted">
            Ingresa el monto que deseas solicitar
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
            {error}
          </div>
        )}

        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-mivank-text-muted font-bold text-lg">
            $
          </span>
          <input
            type="number"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-xl bg-mivank-elevated border border-mivank-border pl-10 pr-4 py-4 text-lg font-bold text-mivank-text focus:ring-2 focus:ring-mivank-accent/50 outline-none"
            disabled={loading}
            min="0"
            step="0.01"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-mivank-accent text-mivank-bg rounded-xl hover:opacity-90 transition-all disabled:opacity-50 font-black text-sm tracking-wider uppercase"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Solicitar Préstamo
            </>
          )}
        </button>
      </form>
    </div>
  );
}

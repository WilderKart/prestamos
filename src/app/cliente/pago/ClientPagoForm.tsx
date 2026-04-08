"use client";

import { useActionState, useState } from "react";
import { reportarPago } from "./actions";
import { Loader2, UploadCloud, CheckCircle } from "lucide-react";

const initialState: any = {
  error: "",
  success: false,
};

export default function ClientPagoForm({ prestamos }: { prestamos: any[] }) {
  const [state, formAction, isPending] = useActionState(reportarPago, initialState);
  const [fileName, setFileName] = useState("");

  if (state?.success) {
    return (
      <div className="bg-green-50 rounded-2xl p-8 text-center border border-green-100 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-xl font-bold text-green-900 mb-2">Pago Registrado</h2>
        <p className="text-green-700 text-sm max-w-sm">
          Tu pago ha sido enviado y se encuentra pendiente de validación por tu agente o el capitán.
        </p>
        <button
          onClick={() => { state.success = false; setFileName(""); }}
          className="mt-6 px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          Reportar otro pago
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
      {state?.error && (
        <div className="p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">Selecciona el Préstamo</label>
        <select
          name="prestamo_id"
          required
          disabled={isPending || prestamos.length === 0}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-900 font-medium"
        >
          {prestamos.length === 0 ? (
            <option value="">No tienes préstamos activos</option>
          ) : (
            prestamos.map((p) => (
              <option key={p.id} value={p.id}>
                Préstamo de ${p.monto.toLocaleString()} - Saldo: ${p.saldo_actual.toLocaleString()}
              </option>
            ))
          )}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Valor a Pagar ($)</label>
          <input
            type="number"
            name="valor"
            min="1"
            step="0.01"
            required
            disabled={isPending}
            placeholder="Ej. 150.00"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-900 font-medium"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Método de Pago</label>
          <select
            name="metodo"
            required
            disabled={isPending}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-900 font-medium"
          >
            <option value="EFECTIVO">Efectivo</option>
            <option value="TRANSFERENCIA">Transferencia</option>
          </select>
        </div>
      </div>

      <div>
         <label className="block text-sm font-bold text-gray-900 mb-2">Comprobante (Opcional)</label>
         <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-8 hover:bg-gray-50 transition-colors group">
            <input
              type="file"
              name="comprobante"
              accept="image/*,.pdf"
              disabled={isPending}
              onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="flex flex-col items-center justify-center text-gray-500 group-hover:text-blue-600 transition-colors">
              <UploadCloud className="w-8 h-8 mb-3" />
              <p className="text-sm font-medium">
                {fileName ? <span className="text-blue-600">{fileName}</span> : "Haz clic o arrastra tu comprobante aquí"}
              </p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG o PDF hasta 5MB</p>
            </div>
         </div>
      </div>

      <div className="pt-4 border-t border-gray-100 flex justify-end">
        <button
          type="submit"
          disabled={isPending || prestamos.length === 0}
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-sm shadow-blue-200 disabled:bg-blue-300 disabled:cursor-not-allowed focus:ring-4 focus:ring-blue-500/30"
        >
          {isPending && <Loader2 className="w-5 h-5 animate-spin" />}
          {isPending ? "Procesando pago..." : "Reportar Pago"}
        </button>
      </div>
    </form>
  );
}

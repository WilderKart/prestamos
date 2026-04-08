"use client";

import { useActionState } from "react";
import { solicitarRetanqueo } from "./actions";
import { Loader2, CheckCircle } from "lucide-react";

const initialState: any = {
  error: "",
  success: false,
};

export default function ClientRetanqueoForm({ prestamos }: { prestamos: any[] }) {
  const [state, formAction, isPending] = useActionState(solicitarRetanqueo, initialState);

  if (state?.success) {
    return (
      <div className="bg-green-50 rounded-2xl p-8 text-center border border-green-100 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-xl font-bold text-green-900 mb-2">Solicitud Enviada</h2>
        <p className="text-green-700 text-sm max-w-sm">
          Tu solicitud de retanqueo ha sido registrada exitosamente. Un capitán revisará tu información pronto.
        </p>
        <button
          onClick={() => { state.success = false; }}
          className="mt-6 px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          Solicitar otra revisión
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
        <label className="block text-sm font-bold text-gray-900 mb-2">Préstamo Base</label>
        <select
          name="prestamo_id"
          required
          disabled={isPending || prestamos.length === 0}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-900 font-medium"
        >
          {prestamos.length === 0 ? (
            <option value="">No tienes préstamos para retanquear</option>
          ) : (
            prestamos.map((p) => (
              <option key={p.id} value={p.id}>
                Préstamo de ${p.monto.toLocaleString()} - Saldo actual: ${p.saldo_actual.toLocaleString()}
              </option>
            ))
          )}
        </select>
        <p className="text-xs text-gray-500 mt-2">
          Selecciona el préstamo sobre el cual deseas solicitar fondos adicionales (retanqueo).
        </p>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">Monto Adicional Solicitado ($)</label>
        <input
          type="number"
          name="monto_solicitado"
          min="1"
          step="0.01"
          required
          disabled={isPending}
          placeholder="Ej. 500.00"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-900 font-medium"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">Motivo o Justificación</label>
        <textarea
          name="motivo"
          required
          disabled={isPending}
          placeholder="Explica brevemente para qué necesitas el dinero..."
          rows={3}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-900 font-medium resize-none"
        ></textarea>
      </div>

      <div className="pt-4 border-t border-gray-100 flex justify-end">
        <button
          type="submit"
          disabled={isPending || prestamos.length === 0}
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-sm shadow-blue-200 disabled:bg-blue-300 disabled:cursor-not-allowed focus:ring-4 focus:ring-blue-500/30"
        >
          {isPending && <Loader2 className="w-5 h-5 animate-spin" />}
          {isPending ? "Enviando Solicitud..." : "Solicitar Retanqueo"}
        </button>
      </div>
    </form>
  );
}

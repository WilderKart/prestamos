"use client";

import { Receipt, Calendar, CreditCard, ChevronRight } from "lucide-react";
import PagoActionButtons from "./PagoActionButtons";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function PagosPendientesList({ initialPagos }: { initialPagos: any[] }) {
  const [pagos, setPagos] = useState(initialPagos);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase.channel('pagos_pendientes_list')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pagos' }, (payload) => {
        setPagos(prev => {
          if (payload.new.estado !== 'PENDIENTE_VALIDACION') {
            return prev.filter(p => p.id !== payload.new.id);
          }
          return prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p);
        });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pagos' }, (payload) => {
        setPagos(prev => {
          if (prev.some(item => item.id === payload.new.id)) return prev;
          const newPago = {
            ...payload.new,
            prestamos: { monto: 0, consecutivo: null, clientes: { usuarios: { nombre: "Nuevo pago (recarga para detalles)" }, cedula: "N/A" } }
          };
          return [newPago, ...prev];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  if (!pagos || pagos.length === 0) {
    return (
      <div className="p-16 text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <Receipt className="w-10 h-10 text-gray-300" />
        </div>
        <h3 className="text-xl font-black text-gray-900">
          No hay pagos pendientes
        </h3>
        <p className="mt-2 text-sm text-gray-500 max-w-xs font-medium">
          Estás al día. Todos los reportes de pago han sido procesados correctamente.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-50">
      {pagos.map((pago: any) => {
        const cliente = pago.prestamos?.clientes;
        const nombre = cliente?.usuarios?.nombre || cliente?.nombre || "Sin nombre";
        const consecutivo = pago.prestamos?.consecutivo;
        
        return (
          <div key={pago.id} className="p-6 hover:bg-gray-50/80 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300 group">
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform">
                <Receipt className="w-6 h-6 text-[#F5C518]" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <p className="font-black text-gray-900 text-xl tracking-tight">
                    ${pago.valor?.toLocaleString()}
                  </p>
                  <span className="px-2 py-0.5 rounded-lg bg-[#F5C518]/10 text-[#F5C518] text-[10px] font-black uppercase tracking-widest">
                    {pago.metodo}
                  </span>
                </div>
                <p className="text-sm font-bold text-gray-600 mt-1 flex items-center gap-2">
                  {nombre}
                  <span className="w-1 h-1 bg-gray-300 rounded-full" />
                  <span className="text-gray-400 font-medium tracking-tight">CC: {cliente?.cedula}</span>
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
                    <Calendar className="w-3.5 h-3.5 text-gray-300" />
                    {new Date(pago.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
                    <CreditCard className="w-3.5 h-3.5 text-gray-300" />
                    {consecutivo ? `REF: CAP-${consecutivo}` : `Préstamo: $${pago.prestamos?.monto?.toLocaleString()}`}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 border-t md:border-t-0 border-gray-100 pt-5 md:pt-0">
              <PagoActionButtons pagoId={pago.id} />
              <div className="hidden md:block">
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-black transition-colors" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

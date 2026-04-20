"use client";

import { 
  Receipt, 
  CalendarBlank, 
  CreditCard, 
  CaretRight,
  UserCircle,
  CurrencyDollar,
  IdentificationCard,
  Hash
} from "@phosphor-icons/react";
import PagoActionButtons from "./PagoActionButtons";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { formatCurrency } from "@/utils/format";

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
      <div className="ios-card bg-white/50 border border-dashed border-black/5 p-20 flex flex-col items-center text-center">
        <div className="bg-ios-bg p-8 rounded-[40px] text-ios-gray/20 mb-6">
          <Receipt weight="fill" size={64} />
        </div>
        <h2 className="text-[20px] font-[900] text-black tracking-tight mb-2">No hay pagos pendientes</h2>
        <p className="text-ios-gray font-semibold max-w-sm text-[14px]">
          Estás al día. Todos los reportes han sido procesados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pagos.map((pago: any) => {
        const cliente = pago.prestamos?.clientes;
        const nombre = cliente?.usuarios?.nombre || cliente?.nombre || "Sin nombre";
        const consecutivo = pago.prestamos?.consecutivo;
        
        return (
          <div key={pago.id} className="ios-card bg-white p-7 transition-all hover:scale-[1.01] active:scale-[0.99] group overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex items-start gap-6">
                <div className="h-20 w-20 bg-ios-bg rounded-[28px] flex flex-col items-center justify-center text-ios-green border border-black/[0.03] shadow-inner">
                   <CurrencyDollar weight="fill" size={32} />
                   <span className="text-[10px] font-black uppercase mt-1 tracking-tighter">PAGO</span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-[26px] font-[900] text-black tracking-tighter leading-none">
                        {formatCurrency(pago.valor || 0)}
                      </p>
                      <span className="px-3 py-1 rounded-full bg-ios-green/10 text-ios-green text-[10px] font-[900] uppercase tracking-widest border border-ios-green/20">
                        {pago.metodo}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[15px] font-[800] text-black tracking-tight">
                      <UserCircle weight="fill" size={18} className="text-ios-gray/40" />
                      {nombre}
                      <span className="w-1 h-1 bg-ios-gray/30 rounded-full" />
                      <span className="text-ios-gray text-[13px] font-[700] flex items-center gap-1.5">
                        <IdentificationCard weight="bold" /> {cliente?.cedula}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-ios-gray/60 uppercase tracking-widest bg-ios-bg/50 px-3 py-1.5 rounded-xl border border-black/[0.02]">
                      <CalendarBlank weight="fill" size={14} className="text-ios-blue" />
                      {new Date(pago.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-ios-gray/60 uppercase tracking-widest bg-ios-bg/50 px-3 py-1.5 rounded-xl border border-black/[0.02]">
                      <Hash weight="fill" size={14} className="text-ios-blue" />
                      {consecutivo ? `CAP-${consecutivo}` : `PRÉSTAMO: $${pago.prestamos?.monto?.toLocaleString()}`}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-5 pt-6 md:pt-0 border-t md:border-t-0 border-black/[0.03]">
                <PagoActionButtons pagoId={pago.id} />
                <div className="bg-ios-bg p-3 rounded-2xl group-hover:bg-ios-blue/10 transition-colors">
                  <CaretRight weight="bold" size={20} className="text-ios-gray group-hover:text-ios-blue" />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

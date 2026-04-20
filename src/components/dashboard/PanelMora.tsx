"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { AlertCircle, User, TrendingDown, Calendar, ArrowRight, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function PanelMora() {
  const [clientesMora, setClientesMora] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMoraData();
  }, []);

  const loadMoraData = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('v_clientes_mora')
      .select('*')
      .order('dias_mora', { ascending: false });

    if (error) {
      console.error(error);
      toast.error('Error al cargar datos de mora');
    } else {
      setClientesMora(data || []);
    }
    setLoading(false);
  };

  if (loading) return <div className="p-10 text-center animate-pulse">Analizando Cartera Vencida...</div>;

  return (
    <div className="bg-white rounded-[32px] p-8 shadow-xl border border-gray-100 font-outfit">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <AlertCircle className="text-red-500" />
            CONTROL DE MORA CRÍTICA
          </h3>
          <p className="text-slate-400 text-sm font-medium mt-1">
            Clientes con pagos pendientes fuera de fecha hábil.
          </p>
        </div>
        <div className="bg-red-50 px-6 py-2 rounded-2xl border border-red-100">
           <span className="text-red-600 font-black text-xl">{clientesMora.length}</span>
           <span className="text-red-400 text-xs font-bold ml-2 uppercase">Casos</span>
        </div>
      </div>

      <div className="space-y-4">
        {clientesMora.length === 0 ? (
          <div className="p-12 text-center bg-green-50 rounded-3xl border border-dashed border-green-200">
            <p className="text-green-600 font-bold">🎉 ¡Cartera al día! No se detectaron clientes en mora.</p>
          </div>
        ) : (
          clientesMora.map((item) => (
            <div 
              key={item.cliente_id} 
              className="group bg-slate-50 hover:bg-white p-6 rounded-[24px] border border-transparent hover:border-slate-200 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex flex-wrap md:flex-nowrap gap-6 items-center">
                
                {/* Profile Pic Placeholder */}
                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shadow-inner">
                  <User size={28} />
                </div>

                {/* Cliente Info */}
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 text-lg uppercase tracking-tight">{item.nombre}</h4>
                  <div className="flex gap-4 mt-1">
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
                      <Calendar size={14} /> {new Date(item.fecha_proximo_pago).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-black text-red-500 uppercase">
                      <TrendingDown size={14} /> {item.dias_mora} DÍAS DE RETRASO
                    </span>
                  </div>
                </div>

                {/* Financial Breakdown */}
                <div className="flex gap-8 px-8 border-x border-slate-200">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Saldo Capital</p>
                    <p className="text-lg font-black text-slate-800">
                      ${Number(item.saldo_actual).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-red-400 uppercase">Interés Mora</p>
                    <p className="text-lg font-black text-red-600">
                      +${Math.floor(item.interes_mora_estimado).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Action */}
                <button 
                  onClick={() => toast.success('Cliente inyectado en secuencia IA')}
                  className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase flex items-center gap-2 hover:bg-black transition-all shadow-xl active:scale-95"
                >
                  Asignar a Ruta <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
          <DollarSign size={14} />
          SCORING CALCULADO SEGÚN PARÁMETROS DE EMPRESA
        </div>
        <button className="text-slate-900 font-black text-xs uppercase hover:underline">
          Ver historial completo
        </button>
      </div>
    </div>
  );
}

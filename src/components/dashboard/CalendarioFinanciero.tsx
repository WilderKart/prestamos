"use client";

import React, { useState, useEffect } from 'react';
import { getCalendarDataAction } from '@/app/actions/calendar';
import { 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  Lock, 
  AlertCircle, 
  TrendingUp, 
  CheckCircle2,
  Users,
  Route
} from 'lucide-react';

export default function CalendarioFinanciero() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [stats, setStats] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [currentDate]);

  const loadData = async () => {
    setLoading(true);
    const result = await getCalendarDataAction(currentDate.toISOString());
    if (result.success) {
      setStats(result.data);
    }
    setLoading(false);
  };

  const dayNames = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();
  
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="max-w-4xl mx-auto font-outfit p-4 lg:p-0">
      {/* Container Principal */}
      <div className="bg-white rounded-[40px] shadow-[0_20px_70px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-100 mb-8">
        
        {/* Header Superior - Estilo Octubre Reforzado */}
        <div className="bg-[#5c5cfc] p-6 text-white flex justify-between items-center bg-gradient-to-r from-[#5c5cfc] to-[#7c7cfc]">
          <button onClick={prevMonth} className="p-2 hover:bg-white/20 rounded-xl transition-all active:scale-90">
            <ChevronLeft size={22} strokeWidth={3} />
          </button>
          
          <div className="text-center">
            <h2 className="text-xl font-[1000] tracking-tight uppercase tracking-[0.1em]">
              {monthNames[month]} {year}
            </h2>
          </div>

          <div className="flex gap-2">
             <button className="p-2 hover:bg-white/20 rounded-xl transition-all">
               <Info size={18} />
             </button>
             <button onClick={nextMonth} className="p-2 hover:bg-white/20 rounded-xl transition-all active:scale-90">
               <ChevronRight size={22} strokeWidth={3} />
             </button>
          </div>
        </div>

        {/* Cuerpo del Calendario */}
        <div className="p-6 bg-[#fdfdfd]">
          {/* Días de la semana */}
          <div className="grid grid-cols-7 mb-2">
            {dayNames.map((day, i) => (
              <div key={day} className={`text-center text-[10px] font-[1000] uppercase tracking-widest pb-2 ${i === 0 || i === 6 ? 'text-[#ff7e5f]' : 'text-gray-300'}`}>
                {day}
              </div>
            ))}
          </div>

          {/* Grid de números */}
          <div className="grid grid-cols-7 gap-2">
            {[...Array(firstDay)].map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square"></div>
            ))}

            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayData = stats[dateStr];
              
              // Lógica de Prioridad de Color (Red > Orange > Green)
              let cellClass = "bg-[#f8f9fc] text-black hover:bg-gray-50";
              let statusIcon = null;

              if (dayData) {
                if (dayData.isFestivo || dayData.isDomingo) {
                  cellClass = "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50";
                } else if (dayData.moraCount > 0 || dayData.hasDiscrepancy) {
                  cellClass = "bg-red-500 text-white shadow-lg shadow-red-200 ring-2 ring-red-200 ring-offset-2";
                } else if (dayData.totalEsperado > 0 && dayData.totalRecaudado === 0) {
                  cellClass = "bg-orange-400 text-white shadow-lg shadow-orange-100";
                } else if (dayData.totalRecaudado > 0) {
                  cellClass = "bg-[#5c5cfc] text-white shadow-lg shadow-blue-200";
                }

                if (dayData.isClosed) statusIcon = <Lock size={10} className="absolute top-2 right-2 opacity-60" />;
                if (dayData.hasDiscrepancy) statusIcon = <AlertCircle size={10} className="absolute top-2 right-2 text-white animate-pulse" />;
              }

              // Hoy highlight
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
              if (isToday && (!dayData || (!dayData.totalEsperado && !dayData.totalRecaudado))) {
                cellClass = "bg-black text-white shadow-xl";
              }

              return (
                <div 
                  key={day}
                  onClick={() => dayData && setSelectedDay({ ...dayData, day })}
                  className={`aspect-square flex flex-col items-center justify-center rounded-[18px] transition-all cursor-pointer relative group overflow-hidden ${cellClass}`}
                >
                  {statusIcon}

                  <span className="text-base font-[1000] tracking-tighter mb-1">
                    {day}
                  </span>

                  {dayData && dayData.totalEsperado > 0 && !dayData.isFestivo && !dayData.isDomingo && (
                    <div className="flex flex-col items-center scale-75 lg:scale-90 -mt-1">
                       <span className={`text-[8px] font-bold ${dayData.moraCount > 0 ? 'text-white/90' : 'text-gray-400'}`}>
                         $ {(dayData.totalEsperado / 1000).toFixed(0)}k
                       </span>
                    </div>
                  )}

                  {/* Puntito de mora */}
                  {dayData && dayData.moraCount > 0 && (
                     <div className="w-1 h-1 rounded-full bg-white animate-bounce mt-0.5"></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer Auditoría */}
          <div className="mt-8 flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
             <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full text-[8px] font-[1000] text-gray-500 uppercase tracking-widest whitespace-nowrap border border-gray-100">
                <div className="w-1.5 h-1.5 rounded-full bg-[#5c5cfc]"></div> Liquidado
             </div>
             <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full text-[8px] font-[1000] text-gray-400 uppercase tracking-widest whitespace-nowrap border border-gray-100">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Mora / Descuadre
             </div>
             <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full text-[8px] font-[1000] text-gray-400 uppercase tracking-widest whitespace-nowrap border border-gray-100">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div> Por Cobrar
             </div>
             <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full text-[8px] font-[1000] text-gray-400 uppercase tracking-widest whitespace-nowrap border border-gray-100">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div> No Operativo
             </div>
          </div>
        </div>
      </div>

      {/* Panel Detalle Operativo (Solo si hay selección) */}
      {selectedDay && (
        <div className="bg-white rounded-[30px] p-6 shadow-xl border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-[1000] text-gray-800 flex items-center gap-2">
                Operación: {selectedDay.day} {monthNames[month]}
                {selectedDay.isClosed ? <Lock size={16} className="text-[#5c5cfc]" /> : <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />}
              </h3>
              <button 
                onClick={() => setSelectedDay(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                Cerrar
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-2xl">
                 <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Monto Esperado</div>
                 <div className="text-xl font-[1000] text-gray-800">{formatMoney(selectedDay.totalEsperado)}</div>
              </div>
              <div className="bg-[#5c5cfc]/5 p-4 rounded-2xl border border-[#5c5cfc]/10">
                 <div className="text-[10px] font-bold text-[#5c5cfc] uppercase mb-1">Recaudado (Caja)</div>
                 <div className="text-xl font-[1000] text-[#5c5cfc]">{formatMoney(selectedDay.totalRecaudado)}</div>
              </div>
              <div className={`p-4 rounded-2xl ${Math.abs(selectedDay.diferencia) > 0 ? 'bg-red-50 border border-red-100' : 'bg-green-50'}`}>
                 <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Diferencia</div>
                 <div className="text-xl font-[1000] text-gray-800">{formatMoney(selectedDay.diferencia)}</div>
              </div>
           </div>

           <div className="mt-6 flex gap-3">
              <button className="flex-1 bg-black text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all">
                 <Users size={18} /> Ver Clientes ({selectedDay.moraCount || 'Ver todos'})
              </button>
              <button className="flex-1 bg-white border border-gray-100 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
                 <Route size={18} /> Gestionar Rutas
              </button>
           </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";

interface ChartData {
  recoveryData: { name: string; value: number }[];
  statusData: { name: string; value: number; color: string }[];
}

export default function DashboardCharts({ recoveryData, statusData }: ChartData) {
  if (!recoveryData || recoveryData.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="card-premium p-6 bg-white border-none min-h-[300px] flex flex-col items-center justify-center">
          <p className="text-gray-500 font-bold">Información próximamente</p>
          <p className="text-gray-400 text-sm mt-1">Datos de recuperación semanal</p>
        </div>
        <div className="card-premium p-6 bg-[#111111] border-none min-h-[300px] flex flex-col items-center justify-center text-white">
          <p className="text-gray-500 font-bold">Información próximamente</p>
          <p className="text-gray-400 text-sm mt-1">Distribución de cartera</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      <div className="card-premium p-6 bg-white border-none min-h-[300px] flex flex-col">
        <div className="flex items-center justify-between mb-6">
           <h3 className="text-lg font-black tracking-tight text-gray-900 uppercase">Recuperación Semanal</h3>
        </div>
        
        <div className="flex-1 w-full min-h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={recoveryData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFD60A" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#FFD60A" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                  fontWeight: 'bold'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#FFD60A" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-premium p-6 bg-[#111111] border-none min-h-[300px] flex flex-col text-white">
        <div className="flex items-center justify-between mb-6">
           <h3 className="text-lg font-black tracking-tight uppercase">Distribución de Cartera</h3>
        </div>
        
        <div className="flex-1 w-full min-h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData}>
              <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1A1A1A', border: 'none', borderRadius: '12px' }} />
              <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                { statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

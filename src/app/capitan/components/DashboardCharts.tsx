"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { 
  ChartLineUp, 
  ChartPie, 
  TrendUp,
  PresentationChart
} from "@phosphor-icons/react";
import { motion } from "framer-motion";

interface DashboardChartsProps {
  recoveryData: { name: string; value: number }[];
  statusData: { name: string; value: number }[];
}

const COLORS = ["#007AFF", "#FF2D55", "#5856D6", "#FFCC00"];

export default function DashboardCharts({ recoveryData, statusData }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
      {/* Recovery Chart */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="ios-card bg-white p-6 md:p-8 space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-ios-blue/10 rounded-xl flex items-center justify-center text-ios-blue">
                <PresentationChart weight="fill" size={24} />
             </div>
             <div>
                <h3 className="text-xl font-[800] text-black tracking-tight">Recuperación</h3>
                <p className="text-[11px] font-bold text-black/30 uppercase tracking-[0.2em]">Semanas Actual</p>
             </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-ios-green/10 text-ios-green rounded-full text-[10px] font-black uppercase tracking-widest">
             <TrendUp weight="bold" />
             +12% vs Ant.
          </div>
        </div>

        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={recoveryData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000006" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#bcbcbc", fontSize: 11, fontWeight: 700 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#bcbcbc", fontSize: 11, fontWeight: 700 }}
              />
              <Tooltip 
                cursor={{ fill: "rgba(0,0,0,0.02)" }}
                contentStyle={{ 
                  borderRadius: "20px", 
                  border: "none", 
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  fontWeight: "bold"
                }}
              />
              <Bar 
                dataKey="value" 
                fill="#007AFF" 
                radius={[10, 10, 10, 10]} 
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Status Distribution */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="ios-card bg-white p-6 md:p-8 space-y-6"
      >
        <div className="flex items-center gap-3 mb-6">
           <div className="w-10 h-10 bg-ios-pink/10 rounded-xl flex items-center justify-center text-ios-pink">
              <ChartPie weight="fill" size={24} />
           </div>
           <div>
              <h3 className="text-xl font-[800] text-black tracking-tight">Distribución</h3>
              <p className="text-[11px] font-bold text-black/30 uppercase tracking-[0.2em]">Cartera por Riesgo</p>
           </div>
        </div>

        <div className="h-[300px] w-full flex flex-col md:flex-row items-center justify-center gap-8 px-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: "20px", 
                  border: "none", 
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  fontWeight: "bold"
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="space-y-4 w-full md:w-48">
            {statusData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-[12px] font-bold text-black/60">{item.name}</span>
                </div>
                <span className="text-[14px] font-[900] text-black">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

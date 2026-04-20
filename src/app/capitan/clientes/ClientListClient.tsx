"use client";

import { useMemo } from "react";
import { 
  User, 
  Phone, 
  MapPin, 
  CreditCard, 
  ShieldCheck, 
  CaretRight,
  MagnifyingGlass,
  IdentificationCard,
  Briefcase,
  EnvelopeSimple,
  House,
  ShieldChevron,
  WarningCircle,
  Clock,
  CircleNotch
} from "@phosphor-icons/react";
import Link from "next/link";
import { useSearch } from "@/components/SearchProvider";
import { motion, AnimatePresence } from "framer-motion";

interface Cliente {
  id: string;
  cedula: string;
  email: string;
  telefono: string;
  direccion: string | null;
  barrio: string | null;
  actividad_economica: string | null;
  lugar_trabajo: string | null;
  metodo_pago_principal: string | null;
  score: string | null;
  usuarios: any;
  fiadores: any;
}

export default function ClientListClient({ initialClientes }: { initialClientes: Cliente[] }) {
  const { searchQuery } = useSearch();

  const filteredClientes = useMemo(() => {
    if (!searchQuery) return initialClientes;
    const lowerSearch = searchQuery.toLowerCase();
    
    return initialClientes.filter((c) => {
      const usuario = Array.isArray(c.usuarios) ? c.usuarios[0] : c.usuarios;
      const nombre = (usuario?.nombre || "").toLowerCase();
      const cedula = (c.cedula || "").toLowerCase();
      const email = (c.email || "").toLowerCase();
      const telefono = (c.telefono || "").toLowerCase();
      const direccion = (c.direccion || "").toLowerCase();
      const barrio = (c.barrio || "").toLowerCase();
      const actividad = (c.actividad_economica || "").toLowerCase();
      const lugar_trabajo = (c.lugar_trabajo || "").toLowerCase();

      // Multicriterio search: matches any of the fields
      return (
        nombre.includes(lowerSearch) ||
        cedula.includes(lowerSearch) ||
        email.includes(lowerSearch) ||
        telefono.includes(lowerSearch) ||
        direccion.includes(lowerSearch) ||
        barrio.includes(lowerSearch) ||
        actividad.includes(lowerSearch) ||
        lugar_trabajo.includes(lowerSearch)
      );
    });
  }, [searchQuery, initialClientes]);

  return (
    <div className="space-y-10 pb-32">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
        <AnimatePresence mode="popLayout">
          {filteredClientes.map((cliente, i) => {
            const usuario = Array.isArray(cliente.usuarios) ? cliente.usuarios[0] : (cliente.usuarios as any);
            const nombre = usuario?.nombre || "NODO_SIN_ID";
            
            const scoreThemes: Record<string, { color: string, label: string, bg: string }> = {
              BUENO: { color: "text-ios-green", label: "CUMPLIMIENTO ALTO", bg: "bg-ios-green/10" },
              RIESGOSO: { color: "text-ios-yellow", label: "RIESGO MODERADO", bg: "bg-ios-yellow/10" },
              MOROSO: { color: "text-ios-pink", label: "CRÍTICO", bg: "bg-ios-pink/10" },
            };
            const theme = scoreThemes[cliente.score || "BUENO"] || scoreThemes.BUENO;

            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                key={cliente.id}
              >
                <Link 
                  href={`/capitan/clientes/${cliente.id}`}
                  className="ios-glass p-6 md:p-8 rounded-[40px] flex flex-col gap-6 group hover:bg-white transition-all relative overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-black/[0.05]"
                >
                  <div className="absolute top-[-20%] left-[-10%] opacity-[0.02] rotate-12 group-hover:scale-110 transition-transform pointer-events-none">
                     <User weight="fill" size={160} />
                  </div>

                  {/* Top Section: Avatar & Info */}
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-5">
                       <div className="relative">
                          <div className="w-16 h-16 rounded-[22px] bg-black text-white flex items-center justify-center shadow-xl group-hover:rotate-2 transition-transform">
                             <User weight="fill" size={24} />
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-lg border-4 border-white shadow-lg flex items-center justify-center ${theme.bg}`}>
                             <ShieldChevron weight="fill" size={14} className={theme.color} />
                          </div>
                       </div>
                       <div className="space-y-1">
                          <h3 className="text-xl font-[1000] text-black tracking-tighter leading-none group-hover:text-ios-blue transition-colors">
                            {nombre}
                          </h3>
                          <div className={`px-2 py-0.5 rounded-full ${theme.bg} ${theme.color} text-[8px] font-black uppercase tracking-[0.1em] inline-block`}>
                             {theme.label}
                          </div>
                       </div>
                    </div>
                    
                    <div className="w-12 h-12 bg-black/[0.03] rounded-2xl flex items-center justify-center text-black/20 group-hover:bg-ios-blue group-hover:text-white transition-all group-hover:rotate-12">
                       <CaretRight weight="bold" size={20} />
                    </div>
                  </div>

                  {/* Data Grid: Bento Style */}
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                     <div className="space-y-1 bg-black/[0.02] p-3 rounded-2xl border border-black/[0.01]">
                        <p className="text-[8px] font-black text-black/20 uppercase tracking-[0.2em]">Cédula</p>
                        <div className="flex items-center gap-2">
                           <IdentificationCard weight="bold" size={16} className="text-ios-blue/30" />
                           <span className="text-[13px] font-bold text-black/70">{cliente.cedula}</span>
                        </div>
                     </div>
                     <div className="space-y-1 bg-black/[0.02] p-3 rounded-2xl border border-black/[0.01]">
                        <p className="text-[8px] font-black text-black/20 uppercase tracking-[0.2em]">Teléfono</p>
                        <div className="flex items-center gap-2">
                           <Phone weight="bold" size={16} className="text-ios-blue/30" />
                           <span className="text-[13px] font-bold text-black/70">{cliente.telefono}</span>
                        </div>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[8px] font-black text-black/20 uppercase tracking-[0.2em]">Barrio</p>
                        <p className="text-[13px] font-bold text-black/60 truncate">{cliente.barrio || "---"}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[8px] font-black text-black/20 uppercase tracking-[0.2em]">Actividad</p>
                        <p className="text-[13px] font-bold text-black/60 truncate">{cliente.actividad_economica || "---"}</p>
                     </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Extreme Empty State */}
      {filteredClientes.length === 0 && (
         <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="ios-glass h-[300px] md:h-[400px] flex flex-col items-center justify-center text-center p-8 md:p-12 space-y-6 md:space-y-8 rounded-[40px] md:rounded-[60px] border-dashed border-2 border-black/5 mx-2"
         >
            <div className="w-16 h-16 md:w-24 md:h-24 bg-black/[0.03] rounded-[30px] md:rounded-[44px] flex items-center justify-center text-black/5 mx-auto relative overflow-hidden">
               <motion.div
                 animate={{ x: [-20, 20, -20] }}
                 transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
               >
                 <MagnifyingGlass weight="fill" size={32} className="md:w-12 md:h-12" />
               </motion.div>
            </div>
            <div className="space-y-2 md:space-y-3">
              <h3 className="text-lg md:text-2xl font-[1000] text-black/20 uppercase tracking-widest leading-none">Desincronizado</h3>
              <p className="text-[11px] md:text-[13px] font-bold text-black/10 uppercase tracking-tight max-w-[240px] md:max-w-xs mx-auto">
                Ninguna identidad en la matriz coincide con los parámetros de búsqueda actuales.
              </p>
            </div>
         </motion.div>
      )}
    </div>
  );
}

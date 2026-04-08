"use client";

import { useState, useEffect } from "react";
import { Search, UserPlus, UserCheck, Loader2 } from "lucide-react";
import { buscarFiador } from "./actions";

interface Fiador {
  id: string;
  nombre: string;
  cedula: string;
  telefono: string;
  direccion: string;
  actividad_economica: string;
}

export default function FiadorSection() {
  const [cedula, setCedula] = useState("");
  const [loading, setLoading] = useState(false);
  const [fiador, setFiador] = useState<Fiador | null>(null);
  const [isNew, setIsNew] = useState(false);

  const handleSearch = async () => {
    if (cedula.length < 5) return;
    setLoading(true);
    const result = await buscarFiador(cedula);
    if (result.fiador) {
      setFiador(result.fiador);
      setIsNew(false);
    } else {
      setFiador(null);
      setIsNew(true);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4 pt-4 border-t border-gray-100">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Información del Fiador</h3>
        {fiador && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase">
            <UserCheck className="w-3 h-3" /> Fiador Encontrado
          </span>
        )}
      </div>

      <div className="relative">
        <input
          type="text"
          name="fiador_cedula"
          placeholder="Cédula del fiador..."
          className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-accent-yellow transition-all"
          value={cedula}
          onChange={(e) => setCedula(e.target.value)}
          onBlur={handleSearch}
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-yellow animate-spin" />}
      </div>

      {(fiador || isNew) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-up">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Nombre Completo</label>
            <input
              type="text"
              name="fiador_nombre"
              defaultValue={fiador?.nombre || ""}
              required
              className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-medium"
              placeholder="Nombre del fiador"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Teléfono</label>
            <input
              type="text"
              name="fiador_telefono"
              defaultValue={fiador?.telefono || ""}
              className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-medium"
              placeholder="Celular"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Dirección Residencia</label>
            <input
              type="text"
              name="fiador_direccion"
              defaultValue={fiador?.direccion || ""}
              className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-medium"
              placeholder="Dirección completa"
            />
          </div>
        </div>
      )}
    </div>
  );
}

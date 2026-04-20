"use client";

import { useState, useEffect } from "react";
import { 
  MagnifyingGlass, 
  UserPlus, 
  CircleNotch, 
  Plus, 
  Minus, 
  X, 
  CheckCircle 
} from "@phosphor-icons/react";
import { buscarPersonasParaFiador } from "./actions";
import { motion, AnimatePresence } from "framer-motion";

interface Person {
  id: string;
  nombre: string;
  cedula: string;
  telefono: string;
  direccion: string;
  actividad: string;
  tipo: 'cliente' | 'fiador';
}

interface FiadorSectionProps {
  initialFields?: Record<string, string>;
}

export default function FiadorSection({ initialFields }: FiadorSectionProps) {
  const [isOpen, setIsOpen] = useState(!!(initialFields?.fiador_cedula || initialFields?.fiador_nombre));
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 3 && !selectedPerson) {
        setIsSearching(true);
        const data = await buscarPersonasParaFiador(query);
        setResults(data as Person[]);
        setIsSearching(false);
      } else {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, selectedPerson]);

  const handleSelect = (person: Person) => {
    setSelectedPerson(person);
    setQuery("");
    setResults([]);
  };

  return (
    <div className="pt-6 border-t border-black/[0.03]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${isOpen ? 'bg-ios-blue text-white shadow-lg shadow-ios-blue/20' : 'bg-ios-bg text-ios-gray'}`}>
            <UserPlus weight="fill" size={22} />
          </div>
          <div>
            <h3 className="text-[13px] font-[800] text-black uppercase tracking-widest leading-none">Datos del Fiador</h3>
            <p className="text-[10px] font-bold text-ios-gray uppercase mt-1.5 tracking-wider">Opcional • Respaldo Legal</p>
          </div>
        </div>
        
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isOpen ? 'bg-ios-pink/10 text-ios-pink' : 'bg-ios-bg text-ios-blue'}`}
        >
          {isOpen ? <Minus weight="bold" size={20} /> : <Plus weight="bold" size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-5 overflow-hidden"
          >
            {/* Buscador */}
            <div className="relative">
              {!selectedPerson ? (
                <>
                  <input
                    type="text"
                    placeholder="Buscar fiador (nombre o cédula)..."
                    className="w-full bg-ios-bg border-none rounded-[18px] py-4 pl-12 pr-4 text-[15px] font-semibold text-black placeholder:text-ios-gray/40 focus:ring-2 focus:ring-ios-blue/20"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <MagnifyingGlass weight="bold" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-ios-gray/40" />
                  {isSearching && <CircleNotch weight="bold" size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-ios-blue animate-spin" />}
                </>
              ) : (
                <div className="flex items-center justify-between bg-ios-green/10 border border-ios-green/10 p-4 rounded-[22px]">
                  <div className="flex items-center gap-3">
                    <CheckCircle weight="fill" className="w-8 h-8 text-ios-green" />
                    <div>
                      <p className="text-[11px] font-[800] text-ios-green uppercase tracking-widest">Fiador Vinculado</p>
                      <p className="text-[15px] font-bold text-black">{selectedPerson.nombre}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPerson(null)}
                    className="p-2 bg-white rounded-full text-ios-pink shadow-sm transition-transform active:scale-90"
                  >
                    <X weight="bold" size={16} />
                  </button>
                  <input type="hidden" name="fiador_id_existente" value={selectedPerson.tipo === 'fiador' ? selectedPerson.id : ""} />
                </div>
              )}

              {/* Resultados */}
              {results.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-xl rounded-[28px] shadow-2xl border border-black/[0.03] overflow-hidden max-h-60 overflow-y-auto">
                  {results.map((person) => (
                    <button
                      key={`${person.tipo}-${person.id}`}
                      type="button"
                      onClick={() => handleSelect(person)}
                      className="w-full text-left p-5 hover:bg-ios-bg flex items-center justify-between border-b border-black/[0.02] last:border-0 transition-colors"
                    >
                      <div>
                        <p className="font-bold text-black text-[14px]">{person.nombre}</p>
                        <p className="text-[11px] text-ios-gray font-bold uppercase tracking-wider mt-1">
                          {person.cedula} • {person.tipo === 'cliente' ? 'Cliente Actual' : 'Histórico'}
                        </p>
                      </div>
                      <Plus weight="bold" size={16} className="text-ios-blue" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Formulario Manual */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
              <ManualInput label="Cédula" name="fiador_cedula" readOnly={!!selectedPerson} value={selectedPerson?.cedula || initialFields?.fiador_cedula || ""} />
              <ManualInput label="Nombre" name="fiador_nombre" readOnly={!!selectedPerson} value={selectedPerson?.nombre || initialFields?.fiador_nombre || ""} />
              <ManualInput label="Teléfono" name="fiador_telefono" readOnly={!!selectedPerson} value={selectedPerson?.telefono || initialFields?.fiador_telefono || ""} />
              <ManualInput label="Actividad" name="fiador_actividad" readOnly={!!selectedPerson} value={selectedPerson?.actividad || initialFields?.fiador_actividad || ""} />
              <div className="md:col-span-2">
                <ManualInput label="Dirección" name="fiador_direccion" readOnly={!!selectedPerson} value={selectedPerson?.direccion || initialFields?.fiador_direccion || ""} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ManualInput({ label, name, readOnly, value }: { label: string, name: string, readOnly: boolean, value: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-ios-gray ml-2 uppercase tracking-widest">{label}</label>
      <input
        type="text"
        name={name}
        readOnly={readOnly}
        defaultValue={value}
        required
        className={`w-full bg-ios-bg border-none rounded-[18px] py-3.5 px-4 text-[14px] font-semibold ${readOnly ? 'text-ios-gray/40' : 'text-black focus:ring-2 focus:ring-ios-blue/10'}`}
        placeholder={`Ingresa ${label.toLowerCase()}`}
      />
    </div>
  );
}

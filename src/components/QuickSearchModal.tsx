"use client";

import { useState, useEffect, useRef } from "react";
import { 
  MagnifyingGlass, 
  X, 
  User, 
  IdentificationCard, 
  Phone,
  CaretRight,
  CircleNotch
} from "@phosphor-icons/react";
import IosModal from "@/components/ui/IosModal";
import { createClient } from "@/utils/supabase/client";

interface SearchResult {
  id: string;
  cedula: string;
  telefono: string;
  usuarios: { nombre: string };
}

export default function QuickSearchModal({ 
  isOpen, 
  onClose, 
  onSelect 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSelect: (client: any) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  // Debounced Search
  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("clientes")
          .select(`
            id,
            cedula,
            telefono,
            usuarios!clientes_usuario_id_fkey(nombre)
          `)
          .or(`cedula.ilike.%${query}%,telefono.ilike.%${query}%`)
          .limit(10);

        if (!error && data) {
          setResults(data as any);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <IosModal
      isOpen={isOpen}
      onClose={onClose}
      title="Búsqueda Rápida"
      subtitle="Localiza clientes y registros"
      icon={<MagnifyingGlass weight="fill" size={28} />}
    >
      <div className="space-y-6">
        {/* Input Bar Area */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            {isLoading ? (
              <CircleNotch weight="bold" size={20} className="animate-spin text-ios-blue" />
            ) : (
              <MagnifyingGlass weight="bold" size={20} className="text-ios-blue" />
            )}
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nombre, cédula o teléfono..."
            className="w-full ios-input pl-12 h-14 text-lg font-bold placeholder:text-black/10"
          />
          {query && !isLoading && (
            <button 
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-black/5 rounded-full"
            >
              <X weight="bold" size={12} />
            </button>
          )}
        </div>

        {/* Results Area */}
        <div className="min-h-[200px]">
          {results.length > 0 ? (
            <div className="space-y-2">
              {results.map((client) => (
                <button
                  key={client.id}
                  onClick={() => onSelect(client)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-black/[0.03] active:scale-[0.98] transition-all text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center shrink-0">
                      <User weight="fill" size={20} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-black text-black tracking-tight truncate">
                        {client.usuarios.nombre}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] font-bold text-black/30 uppercase tracking-widest">
                         <span className="flex items-center gap-1"><IdentificationCard weight="bold" /> {client.cedula}</span>
                         <span className="flex items-center gap-1"><Phone weight="bold" /> {client.telefono}</span>
                      </div>
                    </div>
                  </div>
                  <CaretRight weight="bold" size={18} className="text-black/10" />
                </button>
              ))}
            </div>
          ) : query.length >= 3 && !isLoading ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mx-auto text-black/10">
                 <MagnifyingGlass size={32} weight="fill" />
              </div>
              <p className="text-[11px] font-black text-black/20 uppercase tracking-widest">Sin coincidencias</p>
            </div>
          ) : !query && (
            <div className="py-12 text-center text-black/20 font-bold uppercase tracking-widest text-[10px]">
              Escribe algo para comenzar...
            </div>
          )}
        </div>

        <div className="flex justify-center">
           <span className="text-[9px] font-black text-black/10 uppercase tracking-[0.3em]">Mivank Search Engine v2.0</span>
        </div>
      </div>
    </IosModal>
  );
}

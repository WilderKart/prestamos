import { createClient } from "@/utils/supabase/server";
import {
  Users,
  Phone,
  CreditCard,
  Shield,
  MapPin,
  UserCircle2,
  ChevronRight,
  Search,
  Plus
} from "lucide-react";
import ClientFormModal from "./ClientFormModal";

export default async function CapitanClientesPage() {
  const supabase = await createClient();

  const { data: clientes, error } = await supabase
    .from("clientes")
    .select(`
      id, 
      cedula, 
      email,
      telefono,
      direccion,
      actividad_economica,
      metodo_pago_principal,
      numero_cuenta,
      score, 
      estado,
      fiador_id,
      usuarios!clientes_usuario_id_fkey(nombre),
      fiadores(nombre, cedula)
    `)
    .order("cedula", { ascending: true });

  return (
    <div className="space-y-10 animate-fade-up px-2 py-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-[40px] shadow-sm">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-accent-yellow rounded-xl text-black">
                 <Users className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[4px] text-gray-400">Directorio VIP</span>
           </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
            Mis <span className="text-accent-yellow drop-shadow-sm">Clientes</span>
          </h1>
          <p className="mt-3 text-sm font-bold text-gray-400 max-w-md leading-relaxed">
            Gestión de perfiles, documentos y análisis de riesgo en tiempo real.
          </p>
        </div>
        <div className="w-full md:w-auto">
           <ClientFormModal />
        </div>
      </div>

      {/* Search Bar (Simulated for now) */}
      <div className="relative group">
         <input 
            type="text" 
            placeholder="Buscar por nombre o cédula..." 
            className="w-full bg-white border-none rounded-[32px] py-6 pl-14 pr-6 text-sm font-bold text-gray-900 shadow-sm focus:ring-4 focus:ring-accent-yellow/10 transition-all outline-none"
         />
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-300 group-focus-within:text-accent-yellow transition-colors" />
      </div>

      {/* Error State */}
      {error && (
        <div className="card-premium p-12 text-center bg-red-50/30 border-red-100/50">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-sm font-black text-red-600 uppercase tracking-widest">Error al sincronizar datos</p>
          <button className="mt-4 text-xs font-bold underline text-red-400">Reintentar conexión</button>
        </div>
      )}

      {/* Empty State */}
      {!error && (!clientes || clientes.length === 0) && (
        <div className="card-premium p-20 text-center bg-white border-none">
          <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner">
            <UserCircle2 className="w-12 h-12 text-gray-200" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Cartera Vacía</h3>
          <p className="mt-3 text-sm font-bold text-gray-400 max-w-sm mx-auto">
            Aún no has registrado clientes. Comienza expandiendo tu red financiera hoy mismo.
          </p>
          <div className="mt-10">
             <ClientFormModal />
          </div>
        </div>
      )}

      {/* Client Grid */}
      {clientes && clientes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {clientes.map((cliente, i) => {
              // Supabase joins often return arrays
              const usuario = Array.isArray(cliente.usuarios) ? cliente.usuarios[0] : (cliente.usuarios as any);
              const fiador = Array.isArray(cliente.fiadores) ? cliente.fiadores[0] : (cliente.fiadores as any);
              
              const nombre = usuario?.nombre || "Sin nombre";
              const scoreStyles: Record<string, { bg: string, text: string, dot: string }> = {
                BUENO: { bg: "bg-green-50", text: "text-green-600", dot: "bg-green-500" },
                RIESGOSO: { bg: "bg-orange-50", text: "text-orange-600", dot: "bg-orange-500" },
                MOROSO: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" },
              };
              const theme = scoreStyles[cliente.score || "BUENO"];

              return (
                <div
                  key={cliente.id}
                  className="card-premium p-8 flex flex-col group hover:scale-[1.03] active:scale-95 transition-all duration-500 bg-white border-none shadow-xl"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {/* Header Card */}
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                         <div className="w-16 h-16 rounded-[24px] bg-gray-50 flex items-center justify-center group-hover:bg-[#111111] transition-all duration-500 shadow-inner">
                           <UserCircle2 className="w-8 h-8 text-gray-300 group-hover:text-accent-yellow transition-all duration-500" />
                         </div>
                         <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white ${theme.dot}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-gray-900 group-hover:text-black leading-tight">
                          {nombre.toUpperCase()}
                        </h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mt-1">ID: {cliente.cedula}</p>
                      </div>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="space-y-4 mb-8 flex-1">
                    <DetailItem icon={Phone} text={cliente.telefono || "Sin teléfono"} />
                    <DetailItem icon={MapPin} text={cliente.direccion || "Sin dirección"} />
                    <DetailItem icon={CreditCard} text={`${cliente.metodo_pago_principal || 'N/A'}`} />
                    { fiador?.nombre && (
                       <div className="pt-3 border-t border-gray-50 mt-4">
                          <div className="flex items-center gap-2 text-[10px] font-black text-accent-yellow uppercase tracking-widest">
                             <Shield className="w-3.5 h-3.5" /> Fiador Asignado
                          </div>
                          <p className="text-xs font-bold text-gray-500 mt-1">{fiador.nombre}</p>
                       </div>
                    )}
                  </div>

                {/* Action Footer */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                   <div className={`${theme.bg} ${theme.text} px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest`}>
                      Score {cliente.score || "BUENO"}
                   </div>
                   <button className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-[#111111] group-hover:text-accent-yellow transition-all duration-500 shadow-sm">
                      <ChevronRight className="w-5 h-5" />
                   </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DetailItem({ icon: Icon, text }: { icon: any, text: string }) {
   return (
      <div className="flex items-center gap-3">
         <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:text-[#111111] transition-colors">
            <Icon className="w-4 h-4" />
         </div>
         <span className="text-sm font-bold text-gray-500 group-hover:text-gray-900 transition-colors truncate">{text}</span>
      </div>
   );
}

function AlertCircle({ className }: { className?: string }) {
   return (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
         <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
      </svg>
   );
}

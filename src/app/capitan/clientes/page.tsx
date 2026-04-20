import { requireAuth } from "@/utils/supabase/server";
import { Users } from "@phosphor-icons/react/dist/ssr";
import ClientFormModal from "./ClientFormModal";
import ClientListClient from "./ClientListClient";

export default async function CapitanClientesPage() {
  const { supabase, userData: sessionUser } = await requireAuth("CAPITAN");

  const { data: clientes, error } = await supabase
    .from("clientes")
    .select(`
      id, 
      cedula, 
      email,
      telefono,
      direccion,
      barrio,
      actividad_economica,
      lugar_trabajo,
      metodo_pago_principal,
      numero_cuenta,
      score, 
      estado,
      fiador_id,
      usuarios!clientes_usuario_id_fkey(nombre),
      fiadores(nombre, cedula)
    `)
    .eq("empresa_id", sessionUser.empresa_id)
    .order("cedula", { ascending: true });

  return (
    <div className="space-y-10 animate-fade-up px-2 py-6 pt-0 font-sans antialiased">
      {/* Hero Header Section - iOS Style */}
      <div className="relative h-[200px] md:h-[280px] rounded-[32px] md:rounded-[44px] bg-gradient-to-br from-ios-blue via-ios-purple to-ios-purple shadow-2xl shadow-ios-blue/20 overflow-hidden flex items-center justify-center text-center px-4 md:px-6 mx-2 md:mx-4 transition-all">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
        <div className="absolute -top-12 -left-12 md:-top-24 md:-left-24 w-40 md:w-64 h-40 md:h-64 bg-white/10 rounded-full blur-2xl md:blur-3xl" />
        <div className="absolute -bottom-12 -right-12 md:-bottom-24 md:-right-24 w-40 md:w-80 h-40 md:h-80 bg-ios-pink/10 rounded-full blur-2xl md:blur-3xl" />
        
        <div className="relative z-10 space-y-2 md:space-y-4">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-1">
            <div className="p-2 md:p-3 bg-white/20 backdrop-blur-md rounded-xl md:rounded-2xl text-white border border-white/20">
              <Users weight="fill" className="w-4 h-4 md:w-6 md:h-6" />
            </div>
            <span className="text-[10px] md:text-[12px] font-[800] uppercase tracking-[2px] md:tracking-[4px] text-white/80">Directorio de Cartera</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-[900] text-white tracking-tighter">
            Mis <span className="opacity-90">Clientes</span>
          </h1>
          <p className="hidden md:block text-white/70 font-semibold max-w-lg mx-auto leading-relaxed text-[15px]">
            Gestión inteligente con perfiles de riesgo y búsqueda multicriterio en tiempo real.
          </p>
          <div className="pt-2 md:pt-4">
            <ClientFormModal />
          </div>
        </div>
      </div>

      {/* Main List & Search Logic */}
      <div className="max-w-7xl mx-auto">
        {error ? (
          <div className="ios-card p-12 text-center bg-white border-ios-pink/20">
            <p className="text-sm font-bold text-ios-pink uppercase tracking-widest">Error al sincronizar datos</p>
          </div>
        ) : (
          <ClientListClient initialClientes={clientes || []} />
        )}
      </div>
    </div>
  );
}

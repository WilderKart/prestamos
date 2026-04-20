import { requireAuth } from "@/utils/supabase/server";
import { 
  UserPlus, 
  ShieldCheck, 
} from "@phosphor-icons/react/dist/ssr";
import CobradorFormModal from "./CobradorFormModal";
import { getCobradores } from "./actions";
import CobradorCard from "./CobradorCard";

export default async function CobradoresPage() {
  const cobradores = await getCobradores();

  return (
    <div className="ios-page space-y-10 selection:bg-ios-blue selection:text-white pb-32">
      {/* Hero Header Section - iOS Premium */}
      <section className="animate-fade-up px-4 pt-4">
        <div className="relative p-10 rounded-[44px] bg-white shadow-xl shadow-black/[0.02] border border-black/[0.03] overflow-hidden">
          {/* Subtle backgrounds */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-ios-blue/5 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-ios-purple/5 rounded-full blur-[80px] -ml-24 -mb-24" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-4 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="w-10 h-10 bg-ios-blue text-white rounded-xl flex items-center justify-center shadow-lg shadow-ios-blue/20">
                  <ShieldCheck weight="fill" size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/20">Operations Enclave</span>
              </div>
              
              <div className="space-y-1">
                <h1 className="text-4xl font-[1000] text-black tracking-tighter leading-none">
                  Cobranzas
                </h1>
                <p className="text-black/40 font-bold max-w-sm leading-tight text-[15px]">
                  Visualizando {cobradores?.length || 0} identidades tácticas sincronizadas.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
               <div className="ios-glass p-5 rounded-3xl border-none shadow-sm flex flex-col items-center justify-center min-w-[120px]">
                  <p className="text-[9px] font-black text-black/20 uppercase tracking-widest mb-1">Capacidad</p>
                  <p className="text-2xl font-[1000] text-black">{cobradores?.length || 0}</p>
               </div>
               <CobradorFormModal />
            </div>
          </div>
        </div>
      </section>

      {/* List / Grid */}
      <section className="px-4 pb-32 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        {cobradores && cobradores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cobradores.map((cobrador, i) => (
              <CobradorCard key={cobrador.id} cobrador={cobrador} index={i} />
            ))}
          </div>
        ) : (
          <div className="ios-glass border-dashed border-2 border-black/5 p-20 flex flex-col items-center text-center rounded-[60px] mx-2">
            <div className="bg-black/5 p-10 rounded-[44px] text-black/10 mb-6">
              <UserPlus weight="fill" size={80} />
            </div>
            <h2 className="text-2xl font-[1000] text-black/20 uppercase tracking-widest mb-2">Escuadrón Vacío</h2>
            <p className="text-black/10 font-bold max-w-sm text-[13px] uppercase tracking-tight">Despliega a tu primer integrante para iniciar sincronía.</p>
          </div>
        )}
      </section>

    </div>
  );
}

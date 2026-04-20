import { createClient, requireAuth } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { 
  Gear, 
  ShieldWarning, 
  Key, 
  ListBullets, 
  IdentificationCard,
  ShieldCheck,
  Sparkle,
  SignOut,
  Hash
} from "@phosphor-icons/react/dist/ssr";
import ConfigForm from "./ConfigForm";

export default async function AdminConfiguracionPage() {
  const { userData: sessionUser, supabase } = await requireAuth("ADMIN");

  let configs: any[] = [];
  let error: any = null;

  try {
    const result = await supabase
      .from("configuracion_sistema")
      .select("clave, valor, descripcion")
      .order("clave", { ascending: true });
    
    configs = result.data || [];
    error = result.error;
  } catch (e) {
    console.error("Error cargando configuración:", e);
    error = e;
  }

  if (error) {
    return (
      <div className="ios-page flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 bg-ios-pink/10 rounded-[32px] flex items-center justify-center text-ios-pink shadow-inner border border-white">
          <ShieldWarning weight="fill" size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-[1000] text-black tracking-tighter">Acceso Denegado</h3>
          <p className="text-[14px] font-bold text-black/30 max-w-xs">No se pudo recuperar el mapa de configuración del sistema.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-up">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-black text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-black/20 transform rotate-2 border-2 border-white/10">
              <Gear weight="fill" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-[1000] text-black tracking-tighter leading-none">
                Ajustes del <span className="text-ios-blue">Sistema</span>
              </h1>
              <p className="text-[11px] font-black text-black/20 uppercase tracking-[0.4em] mt-1">
                Matriz de Control Maestro
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Table - iOS Style */}
      <div className="ios-glass border-none rounded-[44px] shadow-2xl shadow-black/[0.03] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-black/[0.03] bg-black/[0.01]">
                <th className="px-8 py-6 text-left text-[10px] font-black text-black/20 uppercase tracking-[0.4em]">Parámetro / Clave</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-black/20 uppercase tracking-[0.4em]">Propósito de Auditoría</th>
                <th className="px-8 py-6 text-right text-[10px] font-black text-black/20 uppercase tracking-[0.4em]">Estado / Valor Actual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.02]">
              {configs?.map((config) => (
                <ConfigForm key={config.clave} config={config} />
              ))}
              {(!configs || configs.length === 0) && (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-6 opacity-20">
                      <ListBullets weight="fill" size={60} />
                      <div className="space-y-1">
                        <h3 className="text-xl font-[1000] tracking-tight uppercase">Sin Configuraciones Redundantes</h3>
                        <p className="text-[12px] font-black tracking-widest uppercase">Protocolo Base No Inicializado</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Banner */}
      <footer className="ios-glass-alt p-8 rounded-[44px] border-none flex items-start gap-6 shadow-2xl shadow-black/5 bg-gradient-to-br from-white to-black/[0.01]">
        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-ios-blue shadow-xl border border-black/[0.02] shrink-0">
          <ShieldCheck weight="fill" size={32} />
        </div>
        <div className="space-y-2 pt-1">
          <h4 className="text-[15px] font-[1000] text-black tracking-tight uppercase">Seguridad de Nivel Maestro</h4>
          <p className="text-[13px] font-semibold text-black/40 leading-relaxed italic">
            "Cualquier modificación en estos parámetros altera la lógica de inyección y recaudo en toda la red de Mivank. Proceda con autorización de auditoría nivel 1."
          </p>
        </div>
      </footer>
    </div>
  );
}

import { requireAuth } from "@/utils/supabase/server";
import { Gear, ShieldCheck, Receipt, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import ConfigEmpresaForm from "./ConfigEmpresaForm";

export default async function ConfigEmpresaPage() {
  const { supabase, userData: session } = await requireAuth("CAPITAN");

  const { data: config } = await supabase
    .from("configuracion_empresa")
    .select("*")
    .eq("empresa_id", session.empresa_id)
    .single();

  const defaultConfig = {
    monto_minimo_comprobante: 50000,
    requiere_comprobante: false,
    empresa_id: session.empresa_id
  };

  return (
    <div className="space-y-10 animate-fade-up px-2 py-6 pt-0 font-sans antialiased pb-32">
      {/* Hero Header */}
      <div className="relative h-[220px] rounded-[44px] bg-gradient-to-br from-black to-ios-blue shadow-2xl shadow-ios-blue/10 overflow-hidden flex items-center justify-center text-center px-6 mx-4">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white border border-white/10">
              <Gear weight="fill" className="w-6 h-6" />
            </div>
            <span className="text-[12px] font-[800] uppercase tracking-[4px] text-white/50">Reglas de Negocio</span>
          </div>
          <h1 className="text-5xl font-[900] text-white tracking-tighter">
            Control <span className="text-ios-blue">Operativo</span>
          </h1>
          <p className="text-white/40 font-semibold max-w-lg mx-auto leading-relaxed text-[15px]">
            Define las políticas de validación y seguridad para todos tus cobradores.
          </p>
        </div>
      </div>

      <div className="px-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="ios-glass p-6 rounded-[32px] border-none shadow-xl flex items-center gap-4">
              <div className="w-12 h-12 bg-ios-blue/10 rounded-2xl flex items-center justify-center text-ios-blue">
                 <ShieldCheck weight="fill" size={24} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-ios-gray/30 uppercase tracking-widest">Estado</p>
                 <p className="text-sm font-black text-black uppercase tracking-tight">Zero Trust Activo</p>
              </div>
           </div>
           {/* Mas stats operativas si se requiere */}
        </div>

        <ConfigEmpresaForm initialConfig={config || defaultConfig} />
      </div>
    </div>
  );
}

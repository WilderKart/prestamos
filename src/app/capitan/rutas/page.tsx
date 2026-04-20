import { requireAuth } from "@/utils/supabase/server";
import { MapTrifold } from "@phosphor-icons/react/dist/ssr";
import RutasClient from "./RutasClient";

export default async function RutasCapitanPage() {
  const { supabase, userData: session } = await requireAuth("CAPITAN");
  const empresa_id = session.empresa_id;
  const hoy = new Date().toISOString().split('T')[0];

  const { data: rutas } = await supabase
    .from("rutas")
    .select(`
      *,
      usuarios!rutas_cobrador_id_fkey(nombre),
      visitas(id, estado)
    `)
    .eq("empresa_id", empresa_id)
    .eq("fecha", hoy);

  return (
    <div className="min-h-screen bg-ios-bg pb-24">
      {/* Header Estilo iOS Pro */}
      <header className="sticky top-0 z-30 bg-ios-bg/80 backdrop-blur-xl border-b border-black/5 px-6 pt-12 pb-6">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[11px] font-black text-ios-blue uppercase tracking-[0.2em] mb-1">
              Logística Inteligente
            </p>
            <h1 className="text-4xl font-[1000] text-black tracking-tight leading-none">
              Rutas <span className="text-ios-gray/20">Hoy</span>
            </h1>
          </div>
          <div className="bg-white/50 p-2 rounded-2xl border border-white shadow-sm">
             <MapTrifold weight="fill" size={28} className="text-ios-blue" />
          </div>
        </div>
      </header>

      <RutasClient initialRutas={rutas || []} empresaId={empresa_id!} />
    </div>
  );
}

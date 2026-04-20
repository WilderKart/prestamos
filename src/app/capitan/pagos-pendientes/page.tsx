import { createClient } from "@/utils/supabase/server";
import { Receipt, Info } from "@phosphor-icons/react/dist/ssr";
import PagosPendientesList from "./PagosPendientesList";

export default async function PagosPendientesPage() {
  const supabase = await createClient();

  const { data: pagos, error } = await supabase
    .from("pagos")
    .select(`
      *,
      prestamos!inner (
        id,
        monto,
        consecutivo,
        clientes!inner (
          cedula,
          usuarios!clientes_usuario_id_fkey(nombre)
        )
      )
    `)
    .eq("estado", "PENDIENTE_VALIDACION")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error cargando pagos:", error);
  }

  return (
    <div className="space-y-10 animate-fade-up px-2 py-6 pt-0 font-sans antialiased">
      {/* Hero Header - iOS Style (Using Green gradient for Payments/Success feel) */}
      <div className="relative h-[220px] rounded-[44px] bg-gradient-to-br from-ios-green to-emerald-500 shadow-2xl shadow-ios-green/20 overflow-hidden flex items-center justify-center text-center px-6 mx-4">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl opacity-50" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white border border-white/20">
              <Receipt weight="fill" className="w-6 h-6" />
            </div>
            <span className="text-[12px] font-[800] uppercase tracking-[4px] text-white/80">Gestión de Cobros</span>
          </div>
          <h1 className="text-5xl font-[900] text-white tracking-tighter">
            Validar <span className="opacity-90">Pagos</span>
          </h1>
          <p className="text-white/70 font-semibold max-w-lg mx-auto leading-relaxed text-[15px]">
            Audita los reportes de pago para mantener el flujo de caja actualizado y verificado.
          </p>
        </div>
      </div>

      <div className="px-4 pb-32">
        <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-ios-blue/5 rounded-2xl border border-ios-blue/10">
          <Info weight="fill" className="text-ios-blue" size={20} />
          <p className="text-[12px] font-bold text-ios-blue uppercase tracking-wider">
            Solo visualizas pagos marcados como "Pendiente de Validación"
          </p>
        </div>
        
        <PagosPendientesList initialPagos={pagos || []} />
      </div>
    </div>
  );
}

import { createClient } from "@/utils/supabase/server";
import { ArrowsCounterClockwise, Info, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import ClientRetanqueoForm from "./ClientRetanqueoForm";

export default async function RetanqueoPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Obtenemos préstamos elegibles para retanqueo (usualmente activos)
  const { data: prestamos, error } = await supabase
    .from("prestamos")
    .select("id, monto, saldo_actual")
    .eq("estado", "ACTIVO")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error cargando prestamos para retanqueo:", error);
  }

  return (
    <div className="space-y-12 animate-fade-up">
      {/* Header Premium */}
      <div className="space-y-2">
         <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-ios-blue text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-ios-blue/20 transform -rotate-3 border-2 border-white">
               <ArrowsCounterClockwise weight="fill" size={32} />
            </div>
            <div>
               <h1 className="text-4xl font-[1000] text-black tracking-tighter leading-none">
                 Retanqueo
               </h1>
               <p className="text-[11px] font-black text-black/20 uppercase tracking-[0.4em] mt-1">
                 Expansión de Capital
               </p>
            </div>
         </div>
      </div>

      <div className="ios-glass border-none p-10 rounded-[44px] shadow-2xl shadow-black/5 flex items-start gap-6 bg-gradient-to-r from-ios-blue/[0.03] to-transparent">
         <div className="w-14 h-14 bg-white rounded-3xl flex items-center justify-center text-ios-blue shadow-xl border border-black/[0.02] shrink-0">
            <ShieldCheck weight="fill" size={28} />
         </div>
         <div className="space-y-1 pt-1">
            <p className="text-[13px] font-black text-black/30 uppercase tracking-[0.1em]">Protocolo de Crédito</p>
            <p className="text-[14px] font-[800] text-black/60 leading-snug">
              "Solicite una reinyección de liquidez sobre sus nodos activos. Nuestro motor de riesgo validará su historial de sincronización."
            </p>
         </div>
      </div>

      <ClientRetanqueoForm prestamos={prestamos || []} userId={user?.id} />
    </div>
  );
}

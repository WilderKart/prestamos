import { createClient } from "@/utils/supabase/server";
import { Bell, Info, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import ClientNotificacionesList from "./ClientNotificacionesList";

export default async function NotificacionesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: notificaciones, error } = await supabase
    .from("notificaciones")
    .select("*")
    .eq("usuario_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error cargando notificaciones:", error);
  }

  return (
    <div className="space-y-12 animate-fade-up">
      {/* Premium Header */}
      <div className="space-y-2">
         <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-ios-blue text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-ios-blue/20 transform -rotate-2 border-2 border-white/5">
               <Bell weight="fill" size={32} />
            </div>
            <div>
               <h1 className="text-4xl font-[1000] text-black tracking-tighter leading-none">
                 Notificaciones
               </h1>
               <p className="text-[11px] font-black text-black/20 uppercase tracking-[0.4em] mt-1">
                 Centro de Control Operativo
               </p>
            </div>
         </div>
      </div>

      <div className="ios-glass border-none p-10 rounded-[44px] shadow-2xl shadow-black/5 flex items-start gap-6 bg-gradient-to-r from-ios-blue/[0.03] to-transparent">
         <div className="w-14 h-14 bg-white rounded-3xl flex items-center justify-center text-ios-blue shadow-xl border border-black/[0.02] shrink-0">
            <ShieldCheck weight="fill" size={28} />
         </div>
         <div className="space-y-1 pt-1">
            <p className="text-[13px] font-black text-black/30 uppercase tracking-[0.1em]">Protocolo Mivank</p>
            <p className="text-[14px] font-[800] text-black/60 leading-snug">
              "Manténgase sincronizado con las actualizaciones de su matriz financiera. Verificamos cada flujo en tiempo real."
            </p>
         </div>
      </div>

      <ClientNotificacionesList notificaciones={notificaciones || []} />
    </div>
  );
}

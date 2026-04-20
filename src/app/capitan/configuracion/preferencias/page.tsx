import { requireAuth } from "@/utils/supabase/server";
import { Bell, Info } from "@phosphor-icons/react/dist/ssr";
import NotificationPrefsForm from "./NotificationPrefsForm";

export default async function PreferenciasPage() {
  const { userData: session } = await requireAuth();

  const prefs = session.config_notificaciones || {
    in_app: true,
    email: false,
    push: true
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 md:py-20 animate-fade-up">
      <header className="mb-12">
        <h1 className="text-4xl font-[1000] text-black tracking-tighter mb-2 italic">Notificaciones</h1>
        <p className="text-[13px] font-bold text-black/30 uppercase tracking-[0.2em]">Centro de Control de Alertas</p>
      </header>

      <NotificationPrefsForm initialPrefs={prefs} />

      <footer className="mt-12 p-6 bg-black/[0.02] rounded-[32px] flex gap-4 items-start">
         <Info weight="bold" className="text-black/20 mt-1 shrink-0" size={20} />
         <div className="space-y-1">
            <p className="text-[12px] font-black text-black/40 uppercase tracking-widest leading-none">Canales Desactualizados</p>
            <p className="text-[11px] font-semibold text-black/20 leading-relaxed">
              La activación de Email y Push requiere que tu perfil tenga un correo verificado y que permitas permisos de navegador en este dispositivo.
            </p>
         </div>
      </footer>
    </div>
  );
}

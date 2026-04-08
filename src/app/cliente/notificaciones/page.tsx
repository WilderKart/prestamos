import { createClient } from "@/utils/supabase/server";
import { Bell } from "lucide-react";
import ClientNotificacionesList from "./ClientNotificacionesList";

export default async function NotificacionesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Las notificaciones están atadas al usuario_id
  const { data: notificaciones, error } = await supabase
    .from("notificaciones")
    .select("*")
    .eq("usuario_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error cargando notificaciones:", error);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl flex items-center">
          <Bell className="w-8 h-8 mr-3 text-blue-600" />
          Notificaciones
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Revisa las actualizaciones sobre tus pagos y solicitudes de retanqueo.
        </p>
      </div>

      <ClientNotificacionesList notificaciones={notificaciones || []} />
    </div>
  );
}

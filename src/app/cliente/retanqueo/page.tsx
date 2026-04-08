import { createClient } from "@/utils/supabase/server";
import { RefreshCcw } from "lucide-react";
import ClientRetanqueoForm from "./ClientRetanqueoForm";

export default async function RetanqueoPage() {
  const supabase = await createClient();

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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl flex items-center">
          <RefreshCcw className="w-8 h-8 mr-3 text-blue-600" />
          Solicitar Retanqueo
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          ¿Necesitas más capital? Solicita un refinanciamiento o monto adicional sobre uno de tus préstamos activos.
        </p>
      </div>

      <ClientRetanqueoForm prestamos={prestamos || []} />
    </div>
  );
}

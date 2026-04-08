import { createClient } from "@/utils/supabase/server";
import { CreditCard } from "lucide-react";
import ClientPagoForm from "./ClientPagoForm";

export default async function PagoPage() {
  const supabase = await createClient();

  // Obtenemos solo los préstamos activos del cliente logueado
  const { data: prestamos, error } = await supabase
    .from("prestamos")
    .select("id, monto, saldo_actual")
    .eq("estado", "ACTIVO")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error cargando prestamos para pago:", error);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl flex items-center">
          <CreditCard className="w-8 h-8 mr-3 text-blue-600" />
          Reportar Pago
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Registra un pago para alguno de tus préstamos activos. Tu agente o capitán lo validará en breve.
        </p>
      </div>

      <ClientPagoForm prestamos={prestamos || []} />
    </div>
  );
}

import { createClient } from "@/utils/supabase/server";
import { Receipt } from "lucide-react";
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
    <div className="space-y-8 animate-fade-in px-4 py-8">
      {/* Header Estilo Chation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4">
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 text-[#F5C518]">
              <Receipt className="w-6 h-6" />
            </div>
            Validación de Pagos
          </h1>
          <p className="mt-2 text-sm font-medium text-gray-500 max-w-lg">
            Revisa, aprueba o rechaza los reportes de pago realizados por tus clientes.
          </p>
        </div>
      </div>

      <div className="glass-card overflow-hidden border-none shadow-premium">
        <PagosPendientesList initialPagos={pagos || []} />
      </div>
    </div>
  );
}

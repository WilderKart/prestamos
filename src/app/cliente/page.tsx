import { createClient } from "@/utils/supabase/server";
import ClientDashboard from "./ClientDashboard";

export default async function ClienteDashboardPage() {
  const supabase = await createClient();

  const { data: prestamos, error } = await supabase
    .from("prestamos")
    .select(`
      *,
      cuotas (
        id,
        numero_cuota,
        valor_cuota,
        fecha_vencimiento,
        estado,
        saldo_cuota
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error trayendo datos del dashboard:", error);
  }

  const prestamosActivos = prestamos?.filter(p => p.estado === "ACTIVO") || [];
  const saldoPorPagar = prestamos?.reduce((acc, curr) => acc + curr.saldo_actual, 0) || 0;

  return (
    <ClientDashboard 
      prestamos={prestamos || []} 
      saldoPorPagar={saldoPorPagar} 
      prestamosActivos={prestamosActivos} 
    />
  );
}

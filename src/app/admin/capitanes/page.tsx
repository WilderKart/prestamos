import { createClient, requireAuth } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { UserSquare2, Search, ShieldAlert, Users } from "lucide-react";

export default async function AdminCapitanesPage() {
  try {
    await requireAuth("ADMIN");
  } catch {
    redirect("/login");
  }

  const supabase = await createClient();

  let capitanes: any[] = [];
  let error: any = null;

  try {
    const result = await supabase
      .from("usuarios")
      .select("id, nombre, email, created_at")
      .eq("rol", "CAPITAN")
      .order("created_at", { ascending: false });
    
    capitanes = result.data || [];
    error = result.error;
  } catch (e) {
    console.error("Error cargando capitanes:", e);
    error = e;
  }

  if (error) {
    return (
      <div className="p-12 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Ocurrió un error al cargar la información</h3>
        <p className="mt-2 text-sm text-gray-500">Intenta nuevamente.</p>
      </div>
    );
  }

  // Fetch stats for these capitanes
  const capitanIds = capitanes?.map((c) => c.id) || [];
  
  let clientesStats: Record<string, number> = {};
  let prestamosStats: Record<string, { count: number; cartera: number }> = {};

  if (capitanIds.length > 0) {
    const { data: clientesData } = await supabase
      .from("clientes")
      .select("capitan_id");
    
    if (clientesData) {
      clientesData.forEach((c) => {
        if (!clientesStats[c.capitan_id]) clientesStats[c.capitan_id] = 0;
        clientesStats[c.capitan_id]++;
      });
    }

    const { data: prestamosData } = await supabase
      .from("prestamos")
      .select("capitan_id, saldo_actual");
      
    if (prestamosData) {
      prestamosData.forEach((p) => {
        if (!prestamosStats[p.capitan_id]) {
          prestamosStats[p.capitan_id] = { count: 0, cartera: 0 };
        }
        prestamosStats[p.capitan_id].count++;
        prestamosStats[p.capitan_id].cartera += Number(p.saldo_actual || 0);
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserSquare2 className="w-7 h-7 text-indigo-600" />
            Gestión de Capitanes
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Visualiza el rendimiento y métricas de cada capitán asignado.
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Capitán
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Clientes
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Préstamos Totales
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Cartera Activa
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {capitanes?.map((capitan) => {
                const numClientes = clientesStats[capitan.id] || 0;
                const pStats = prestamosStats[capitan.id] || { count: 0, cartera: 0 };
                
                return (
                  <tr key={capitan.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
                            <span className="text-indigo-700 font-medium text-sm">
                              {capitan.nombre ? capitan.nombre.substring(0, 2).toUpperCase() : "CA"}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{capitan.nombre || "Capitán"}</div>
                          <div className="text-sm text-gray-500">{capitan.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {numClientes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pStats.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      ${pStats.cartera.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
              {(!capitanes || capitanes.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <UserSquare2 className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">Aún no hay registros disponibles</h3>
                      <p className="mt-2 text-sm text-gray-500">La información aparecerá aquí próximamente.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

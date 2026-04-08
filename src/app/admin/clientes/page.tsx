import { createClient, requireAuth } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { UserCircle2, ShieldAlert } from "lucide-react";

export default async function AdminClientesPage() {
  try {
    await requireAuth("ADMIN");
  } catch {
    redirect("/login");
  }

  const supabase = await createClient();

  let clientes: any[] = [];
  let error: any = null;

  try {
    const result = await supabase
      .from("clientes")
      .select(`
        id, 
        cedula, 
        telefono, 
        score, 
        capitan_id, 
        usuarios!clientes_usuario_id_fkey(nombre, email)
      `)
      .order("cedula", { ascending: true });
    
    clientes = result.data || [];
    error = result.error;
  } catch (e) {
    console.error("Error cargando clientes:", e);
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

  // To display Captain names, we need a map
  const capitanIds = Array.from(new Set(clientes?.map((c) => c.capitan_id).filter(Boolean)));
  let capitanesMap: Record<string, string> = {};
  
  if (capitanIds.length > 0) {
    const { data: capitanesData } = await supabase
      .from("usuarios")
      .select("id, nombre")
      .in("id", capitanIds as string[]);
      
    if (capitanesData) {
       capitanesData.forEach(c => capitanesMap[c.id] = c.nombre);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserCircle2 className="w-7 h-7 text-indigo-600" />
            Directorio de Clientes
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Base de datos global de todos los clientes vinculados al sistema.
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Cliente (Cédula)
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Capitán Asociado
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Score Crediticio
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientes?.map((cliente) => {
                const usuario = Array.isArray(cliente.usuarios) ? cliente.usuarios[0] : (cliente.usuarios as any);
                return (
                  <tr key={cliente.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{usuario?.nombre || "N/A"}</div>
                      <div className="text-sm text-gray-500">CC: {cliente.cedula}</div>
                    </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cliente.telefono || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {capitanesMap[cliente.capitan_id] || "No asignado"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      cliente.score === 'BUENO' ? 'bg-green-50 text-green-700 border-green-200' :
                      cliente.score === 'RIESGOSO' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {cliente.score}
                    </span>
                    </td>
                  </tr>
                );
              })}
              {(!clientes || clientes.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <UserCircle2 className="w-8 h-8 text-gray-400" />
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

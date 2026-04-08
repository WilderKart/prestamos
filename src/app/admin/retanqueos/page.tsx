import { createClient } from "@/utils/supabase/server";
import { RefreshCcw, ShieldAlert } from "lucide-react";

export default async function AdminRetanqueosPage() {
  const supabase = await createClient();

  const { data: retanqueos, error } = await supabase
    .from("solicitudes_retanqueo")
    .select(`
      id,
      cliente_id,
      prestamo_origen_id,
      monto_solicitado,
      estado,
      created_at,
      clientes (
        cedula,
        usuarios!clientes_usuario_id_fkey(nombre)
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    // Es posible que la tabla solicitudes_retanqueo no exista aún o tenga un problema de estructura
    // Graceful error fallback
    return (
      <div className="p-12 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Ocurrió un error al cargar la información</h3>
        <p className="mt-2 text-sm text-gray-500">Intenta nuevamente. {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <RefreshCcw className="w-7 h-7 text-indigo-600" />
            Solicitudes de Retanqueo
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Administración de renovaciones y refinanciamientos de crédito.
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Préstamo Origen
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Fecha Solicitud
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {retanqueos?.map((solicitud) => {
                const cliente = solicitud.clientes as any;
                const isAprobado = solicitud.estado === 'APROBADO';
                const isRechazado = solicitud.estado === 'RECHAZADO';

                return (
                  <tr key={solicitud.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{cliente?.usuarios?.nombre || "N/A"}</div>
                      <div className="text-sm text-gray-500">CC: {cliente?.cedula}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ID: {solicitud.prestamo_origen_id ? solicitud.prestamo_origen_id.split('-')[0] + '...' : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                      ${(solicitud.monto_solicitado || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        isAprobado ? 'bg-green-50 text-green-700 border-green-200' :
                        isRechazado ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}>
                        {solicitud.estado || 'PENDIENTE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(solicitud.created_at).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
              {(!retanqueos || retanqueos.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <RefreshCcw className="w-8 h-8 text-gray-400" />
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

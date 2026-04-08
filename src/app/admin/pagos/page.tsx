import { createClient, requireAuth } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Receipt, ShieldAlert } from "lucide-react";

export default async function AdminPagosPage() {
  try {
    await requireAuth("ADMIN");
  } catch {
    redirect("/login");
  }

  const supabase = await createClient();

  let pagos: any[] = [];
  let error: any = null;

  try {
    const result = await supabase
      .from("pagos")
      .select(`
        id,
        valor,
        metodo,
        estado,
        created_at,
        prestamo_id,
        prestamos (
          clientes (
            cedula,
            usuarios!clientes_usuario_id_fkey(nombre)
          )
        )
      `)
      .order("created_at", { ascending: false });

    pagos = result.data || [];
    error = result.error;
  } catch (e) {
    console.error("Error cargando pagos:", e);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Receipt className="w-7 h-7 text-indigo-600" />
            Historial de Pagos
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Registro global de abonos realizados al sistema.
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Cliente (Préstamo)
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Método
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pagos?.map((pago) => {
                const isAprobado = pago.estado === 'APROBADO';
                const isRechazado = pago.estado === 'RECHAZADO';
                
                // Supabase joins often return arrays
                const prestamo = Array.isArray(pago.prestamos) ? pago.prestamos[0] : (pago.prestamos as any);
                const cliente = Array.isArray(prestamo?.clientes) ? prestamo?.clientes[0] : (prestamo?.clientes as any);
                const usuario = Array.isArray(cliente?.usuarios) ? cliente?.usuarios[0] : (cliente?.usuarios as any);
                
                return (
                  <tr key={pago.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{usuario?.nombre || "N/A"}</div>
                      <div className="text-sm text-gray-500">ID: {pago.prestamo_id.split('-')[0]}... ({cliente?.cedula})</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      +${pago.valor.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {pago.metodo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        isAprobado ? 'bg-green-50 text-green-700 border-green-200' :
                        isRechazado ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}>
                        {pago.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(pago.created_at).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
              {(!pagos || pagos.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Receipt className="w-8 h-8 text-gray-400" />
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

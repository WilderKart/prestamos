import { createClient, requireAuth } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Wallet, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default async function AdminPrestamosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  try {
    await requireAuth("ADMIN");
  } catch {
    redirect("/login");
  }

  const supabase = await createClient();
  const sp = await searchParams;
  const filtroEstado = sp.estado || "todos";

  let query = supabase
    .from("prestamos")
    .select(`
      id, 
      cliente_id, 
      monto, 
      saldo_actual, 
      estado, 
      fecha_inicio,
      clientes!inner ( 
        cedula,
        usuarios!clientes_usuario_id_fkey(nombre)
      )
    `)
    .order("fecha_inicio", { ascending: false });

  if (filtroEstado !== "todos") {
    query = query.eq("estado", filtroEstado.toUpperCase());
  }

  const { data: prestamos, error } = await query;

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
            <Wallet className="w-7 h-7 text-indigo-600" />
            Gestión de Préstamos
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitoreo global de cartera y créditos otorgados.
          </p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl">
          <Link
            href="/admin/prestamos"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filtroEstado === "todos" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Todos
          </Link>
          <Link
            href="/admin/prestamos?estado=activo"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filtroEstado === "activo" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Activos
          </Link>
          <Link
            href="/admin/prestamos?estado=en_mora"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filtroEstado === "en_mora" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Mora
          </Link>
          <Link
            href="/admin/prestamos?estado=finalizado"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filtroEstado === "finalizado" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Finalizados
          </Link>
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
                  Monto Original
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Saldo Actual
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Fecha Inicio
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {prestamos?.map((prestamo) => {
                const isMora = prestamo.estado === 'EN_MORA';
                const isActivo = prestamo.estado === 'ACTIVO';
                const isFinalizado = prestamo.estado === 'FINALIZADO';
                
                // Supabase joins often return arrays
                const cliente = Array.isArray(prestamo.clientes) ? prestamo.clientes[0] : (prestamo.clientes as any);
                const usuario = Array.isArray(cliente?.usuarios) ? cliente?.usuarios[0] : (cliente?.usuarios as any);

                return (
                  <tr key={prestamo.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{usuario?.nombre || "N/A"}</div>
                      <div className="text-sm text-gray-500">CC: {cliente?.cedula}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      ${prestamo.monto.toLocaleString()}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${isMora ? 'text-red-600' : 'text-gray-900'}`}>
                      ${prestamo.saldo_actual.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        isActivo ? 'bg-green-50 text-green-700 border-green-200' :
                        isMora ? 'bg-red-50 text-red-700 border-red-200' :
                        isFinalizado ? 'bg-gray-100 text-gray-700 border-gray-300' :
                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}>
                        {prestamo.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(prestamo.fecha_inicio).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
              {(!prestamos || prestamos.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Wallet className="w-8 h-8 text-gray-400" />
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

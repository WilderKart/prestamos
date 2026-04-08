import { createClient } from "@/utils/supabase/server";
import { CreditCard, CalendarDays, Wallet, Banknote, Receipt, ExternalLink } from "lucide-react";
import Link from "next/link";

export default async function ClienteDashboardPage() {
  const supabase = await createClient();

  // Traer préstamos y cuotas atadas (el RLS filtra todo automáticamente)
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

  // Fetch disbursement info for each loan
  const prestamosWithDesembolso = await Promise.all(
    (prestamos || []).map(async (prestamo) => {
      const { data: desembolso } = await supabase
        .from("desembolsos")
        .select("*")
        .eq("prestamo_id", prestamo.id)
        .maybeSingle();
      return { ...prestamo, desembolso };
    })
  );

  const prestamosActivos = prestamos?.filter(p => p.estado === "ACTIVO") || [];
  const saldoTotalDepositado = prestamos?.reduce((acc, curr) => acc + curr.monto, 0) || 0;
  const saldoPorPagar = prestamos?.reduce((acc, curr) => acc + curr.saldo_actual, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl">
          Mi Resumen
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Hola, bienvenido(a) a tu panel de control de Mivank.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl mr-4">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Saldo por pagar</p>
            <p className="text-2xl font-bold text-gray-900">${saldoPorPagar.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center">
          <div className="p-4 bg-green-50 text-green-600 rounded-xl mr-4">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Préstamos activos</p>
            <p className="text-2xl font-bold text-gray-900">{prestamosActivos.length}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-lg font-bold text-gray-900">Tus Préstamos</h2>
        
        {prestamosWithDesembolso && prestamosWithDesembolso.length > 0 ? (
          <div className="space-y-6">
            {prestamosWithDesembolso.map((prestamo) => {
              // Ordenamos las cuotas por numero_cuota para mostrarlas bien
              const cuotas = (prestamo.cuotas || []).sort((a: any, b: any) => a.numero_cuota - b.numero_cuota);
              
              return (
                <div key={prestamo.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 flex items-center">
                        <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                        Préstamo inicial: ${prestamo.monto?.toLocaleString()}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Saldo Actual: <span className="font-semibold text-gray-900">${prestamo.saldo_actual?.toLocaleString()}</span>
                      </p>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-2">
                       <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          prestamo.estado === "ACTIVO"
                            ? "bg-green-100 text-green-800"
                            : prestamo.estado === "FINALIZADO"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {prestamo.estado}
                      </span>
                      {prestamo.estado === "ACTIVO" && (
                        <Link 
                          href="/cliente/pago"
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Realizar pago →
                        </Link>
                      )}
                    </div>
                  </div>

                  {prestamo.desembolso && (
                    <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                          <Banknote className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="text-sm font-bold text-green-800">Desembolso Registrado</h4>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-green-600 mb-1">Monto desembolsado</p>
                          <p className="text-lg font-bold text-green-900">${prestamo.desembolso.monto?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-green-600 mb-1">Método</p>
                          <p className="text-sm font-bold text-green-900 capitalize">{prestamo.desembolso.metodo_desembolso?.toLowerCase()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-green-600 mb-1">Fecha</p>
                          <p className="text-sm font-bold text-green-900">{new Date(prestamo.desembolso.fecha_desembolso).toLocaleDateString("es")}</p>
                        </div>
                        {prestamo.desembolso.comprobante_url && (
                          <div>
                            <p className="text-xs text-green-600 mb-1">Comprobante</p>
                            <a 
                              href={prestamo.desembolso.comprobante_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <Receipt className="w-4 h-4" />
                              Ver comprobante
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {!prestamo.desembolso && prestamo.estado === "ACTIVO" && (
                    <div className="p-4 bg-yellow-50 border-b border-yellow-100">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-yellow-600" />
                        <p className="text-sm font-medium text-yellow-700">Desembolso pendiente de registro por tu capitán</p>
                      </div>
                    </div>
                  )}

                  <div className="p-0 overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                      <thead className="bg-gray-50 text-xs text-gray-700 uppercase border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-3">Cuota</th>
                          <th className="px-6 py-3">Vencimiento</th>
                          <th className="px-6 py-3">Valor</th>
                          <th className="px-6 py-3">Saldo</th>
                          <th className="px-6 py-3">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cuotas.map((cuota: any) => (
                          <tr key={cuota.id} className="border-b border-gray-50 last:border-none hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900">
                              #{cuota.numero_cuota}
                            </td>
                            <td className="px-6 py-4">
                              <span className="flex items-center">
                                <CalendarDays className="w-3 h-3 mr-1 text-gray-400" />
                                {new Date(cuota.fecha_vencimiento).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="px-6 py-4">${cuota.valor_cuota?.toLocaleString()}</td>
                            <td className="px-6 py-4">${cuota.saldo_cuota?.toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                                cuota.estado === "PAGADO" ? "bg-green-100 text-green-700" :
                                cuota.estado === "ABONO" ? "bg-yellow-100 text-yellow-700" :
                                cuota.estado === "EN_MORA" ? "bg-red-100 text-red-700" :
                                "bg-gray-100 text-gray-700"
                              }`}>
                                {cuota.estado.replace("_", " ")}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-900 font-medium">Aún no tienes préstamos registrados</p>
            <p className="text-gray-500 text-sm mt-1">Comunícate con tu agente para aperturar uno.</p>
          </div>
        )}
      </div>
    </div>
  );
}

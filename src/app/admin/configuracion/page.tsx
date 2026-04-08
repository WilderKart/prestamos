import { createClient, requireAuth } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Settings, ShieldAlert, Edit2 } from "lucide-react";
import ConfigForm from "./ConfigForm";

export default async function AdminConfiguracionPage() {
  try {
    await requireAuth("ADMIN");
  } catch {
    redirect("/login");
  }

  const supabase = await createClient();

  let configs: any[] = [];
  let error: any = null;

  try {
    const result = await supabase
      .from("configuracion_sistema")
      .select("clave, valor, descripcion")
      .order("clave", { ascending: true });
    
    configs = result.data || [];
    error = result.error;
  } catch (e) {
    console.error("Error cargando configuración:", e);
    error = e;
  }

  if (error) {
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
            <Settings className="w-7 h-7 text-indigo-600" />
            Configuración Global
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Ajustes, reglas de negocio y parámetros de la plataforma.
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th scope="col" className="w-1/4 px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Clave
                </th>
                <th scope="col" className="w-2/4 px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th scope="col" className="w-1/4 px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Valor Actual
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {configs?.map((config) => (
                <ConfigForm key={config.clave} config={config} />
              ))}
              {(!configs || configs.length === 0) && (
                <tr>
                  <td colSpan={3} className="px-6 py-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Settings className="w-8 h-8 text-gray-400" />
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

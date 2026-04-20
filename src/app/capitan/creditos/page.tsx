import { requireAuth } from "@/utils/supabase/server";
import { 
  CurrencyDollar, 
  ChartLineUp, 
  Clock, 
  WarningCircle,
  Plus
} from "@phosphor-icons/react/dist/ssr";
import { formatCurrency } from "@/utils/format";
import Link from "next/link";

export default async function CreditosPage() {
  const { supabase, userData: sessionUser } = await requireAuth("CAPITAN");
  
  // Obtener préstamos de la empresa
  const { data: prestamos } = await supabase
    .from("prestamos")
    .select("*, clientes(nombre)")
    .eq("empresa_id", sessionUser.empresa_id)
    .order("created_at", { ascending: false });

  const totalPrestado = prestamos?.reduce((acc, p) => acc + (p.monto || 0), 0) || 0;
  const prestamosActivos = prestamos?.filter(p => p.estado === 'ACTIVO').length || 0;

  return (
    <div className="ios-page space-y-10 selection:bg-ios-blue selection:text-white pb-32">
      {/* Header Premium */}
      <section className="animate-fade-up px-4 pt-4">
        <div className="relative p-10 rounded-[44px] bg-white shadow-xl shadow-black/[0.02] border border-black/[0.03] overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-ios-green/5 rounded-full blur-[100px] -mr-32 -mt-32" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-4 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="w-10 h-10 bg-ios-green text-white rounded-xl flex items-center justify-center shadow-lg shadow-ios-green/20">
                  <CurrencyDollar weight="fill" size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/20">Capital Enclave</span>
              </div>
              
              <div className="space-y-1">
                <h1 className="text-4xl font-[1000] text-black tracking-tighter leading-none">
                  Gestión de <span className="text-ios-green">Créditos</span>
                </h1>
                <p className="text-black/40 font-bold max-w-sm leading-tight text-[15px]">
                  Monitoreo de activos y flujo de capital en tiempo real.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="ios-glass p-5 rounded-3xl border-none shadow-sm flex flex-col items-center justify-center min-w-[140px]">
                <p className="text-[9px] font-black text-black/20 uppercase tracking-widest mb-1">Total Colocado</p>
                <p className="text-xl font-[1000] text-black">{formatCurrency(totalPrestado)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Listado de Créditos */}
      <section className="px-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="ios-glass overflow-hidden border-none rounded-[40px] p-2">
          {prestamos && prestamos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-0">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-widest text-black/30">
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Monto</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.03]">
                  {prestamos.map((p) => (
                    <tr key={p.id} className="group hover:bg-black/[0.01] transition-colors">
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-black">{p.clientes?.nombre}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-[900] text-black">{formatCurrency(p.monto)}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-full ${
                          p.estado === 'ACTIVO' ? 'bg-ios-green/10 text-ios-green' : 'bg-ios-gray/10 text-ios-gray'
                        }`}>
                          {p.estado}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-[11px] font-bold text-black/30">{new Date(p.created_at).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="text-ios-blue font-black text-[10px] uppercase tracking-widest hover:underline">
                          Detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-20 flex flex-col items-center text-center">
              <div className="bg-black/5 p-10 rounded-[44px] text-black/10 mb-6">
                <CurrencyDollar weight="fill" size={80} />
              </div>
              <h2 className="text-2xl font-[1000] text-black/20 uppercase tracking-widest mb-2">Sin Créditos</h2>
              <p className="text-black/10 font-bold max-w-sm text-[13px] uppercase tracking-tight">No hay préstamos registrados en el sistema bajo su jurisdicción.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

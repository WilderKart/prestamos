import { createClient, requireAuth } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { 
  UserCircle, 
  ShieldWarning, 
  IdentificationCard,
  Phone,
  User,
  Star,
  CaretRight,
  ShieldCheck,
  UserGear,
  ChartBar
} from "@phosphor-icons/react/dist/ssr";

export default async function AdminClientesPage() {
  const { userData: sessionUser, supabase } = await requireAuth("ADMIN");

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
      <div className="p-20 text-center flex flex-col items-center ios-page">
        <div className="w-20 h-20 bg-ios-pink/10 rounded-full flex items-center justify-center mb-6">
          <ShieldWarning className="w-10 h-10 text-ios-pink" weight="fill" />
        </div>
        <h3 className="text-2xl font-[1000] text-black tracking-tighter">Fallo en Sincronización</h3>
        <p className="mt-2 text-[15px] font-semibold text-black/40">No se pudo recuperar el directorio maestro de clientes.</p>
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
    <div className="ios-page space-y-10 selection:bg-ios-blue selection:text-white pb-32 pt-4">
      {/* Header Section */}
      <section className="animate-fade-up">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-4">
          <div className="space-y-1">
             <div className="flex items-center gap-3 text-ios-blue mb-2">
                <UserCircle weight="fill" size={32} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20">Client Directory</span>
             </div>
             <h1 className="text-4xl font-[1000] text-black tracking-tighter leading-none">
               Directorio <span className="text-ios-blue">Global</span>
             </h1>
             <p className="text-[14px] font-bold text-black/40 tracking-tight leading-loose max-w-xl">
               Base de datos centralizada de identidades vinculadas al sistema crediticio y sus perfiles de riesgo.
             </p>
          </div>
          
          <div className="px-6 py-3 bg-ios-blue text-white rounded-2xl flex items-center gap-2 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-ios-blue/20">
             <ShieldCheck weight="fill" size={18} /> Administrative Access
          </div>
        </div>
      </section>

      {/* Table Section */}
      <section className="px-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="ios-glass border-none shadow-2xl shadow-black/5 rounded-[44px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-black/[0.03]">
                  <th className="px-8 py-6 text-left text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">Identidad Cliente</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">Contacto</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">Mando Asociado</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">Scoring</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">Expediente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.02]">
                {clientes?.map((cliente) => {
                  const usuario = Array.isArray(cliente.usuarios) ? cliente.usuarios[0] : (cliente.usuarios as any);
                  const isGood = cliente.score === 'BUENO';
                  const isRisky = cliente.score === 'RIESGOSO';

                  return (
                    <tr key={cliente.id} className="group hover:bg-black/[0.01] transition-colors">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-5">
                          <div className="h-14 w-14 bg-black/[0.03] rounded-2xl flex items-center justify-center text-black border border-white shadow-inner group-hover:bg-ios-blue/5 transition-colors">
                             <User weight="fill" size={24} className="text-black/10 group-hover:text-ios-blue transition-colors" />
                          </div>
                          <div>
                            <div className="text-[17px] font-[900] text-black tracking-tight leading-none mb-1 group-hover:text-ios-blue transition-colors">
                              {usuario?.nombre || "Sin Nombre"}
                            </div>
                            <div className="text-[12px] font-bold text-black/30 flex items-center gap-1 uppercase">
                               <IdentificationCard weight="fill" />
                               {cliente.cedula}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                         <div className="flex items-center gap-2 text-[14px] font-bold text-black/60">
                            <Phone weight="fill" size={16} className="text-black/10" />
                            {cliente.telefono || "N/A"}
                         </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                         <div className="flex items-center gap-2 text-[14px] font-bold text-black/60">
                            <UserGear weight="fill" size={16} className="text-ios-purple/40" />
                            {capitanesMap[cliente.capitan_id] || "Sin Asignar"}
                         </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          isGood ? 'bg-ios-green/10 text-ios-green' :
                          isRisky ? 'bg-ios-yellow/10 text-ios-yellow' :
                          'bg-ios-pink/10 text-ios-pink'
                        }`}>
                          <Star weight="fill" size={14} />
                          {cliente.score}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-right">
                         <div className="flex items-center justify-end gap-2 text-[10px] font-black text-black/10 group-hover:text-ios-blue transition-colors cursor-pointer">
                            PERFIL <CaretRight weight="bold" />
                         </div>
                      </td>
                    </tr>
                  ))}
                
                {(!clientes || clientes.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-8 py-32">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-black/5 rounded-[32px] flex items-center justify-center text-black/10 mb-6 border border-dashed border-black/10">
                           <UserCircle weight="fill" size={40} />
                        </div>
                        <h3 className="text-xl font-[1000] text-black tracking-tight mb-2">Directorio Vacío</h3>
                        <p className="text-[14px] font-semibold text-black/40 max-w-xs">No hay clientes registrados en la matriz global compartida.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

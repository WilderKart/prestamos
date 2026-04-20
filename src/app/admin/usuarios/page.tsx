import { createClient, requireAuth } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import UserActionClient from "./UserActionClient";
import CrearCapitanModal from "./CrearCapitanModal";
import { 
  Users, 
  MagnifyingGlass, 
  ShieldWarning, 
  CheckCircle, 
  Prohibit,
  IdentificationCard,
  UserGear,
  ShieldCheck,
  CaretRight,
  Plus
} from "@phosphor-icons/react/dist/ssr";

export default async function AdminUsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { userData: sessionUser, supabase } = await requireAuth("ADMIN");

  const rawQ = await searchParams;
  const q = rawQ?.q || "";

  let query = supabase
    .from("usuarios")
    .select("id, email, nombre, rol, created_at, estado, motivo_bloqueo")
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(`nombre.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const { data: usuarios, error } = await query;

  if (error) {
    return (
      <div className="p-20 text-center flex flex-col items-center ios-page">
        <div className="w-20 h-20 bg-ios-pink/10 rounded-full flex items-center justify-center mb-6">
          <ShieldWarning className="w-10 h-10 text-ios-pink" weight="fill" />
        </div>
        <h3 className="text-2xl font-[1000] text-black tracking-tighter">Error de Red Interna</h3>
        <p className="mt-2 text-[15px] font-semibold text-black/40">No se pudo sincronizar la base de datos de identidades.</p>
      </div>
    );
  }

  return (
    <div className="ios-page space-y-10 selection:bg-ios-blue selection:text-white pb-32 pt-4">
      {/* Header Section */}
      <section className="animate-fade-up">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-4">
          <div className="space-y-1">
             <div className="flex items-center gap-3 text-ios-blue mb-2">
                <Users weight="fill" size={32} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20">Identity Management</span>
             </div>
             <h1 className="text-4xl font-[1000] text-black tracking-tighter leading-none">
               Base de <span className="text-ios-blue">Usuarios</span>
             </h1>
             <p className="text-[14px] font-bold text-black/40 tracking-tight leading-loose">
               Administra el acceso estructural y el ciclo de vida de cada identidad en el sistema.
             </p>
          </div>
          
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
             <form className="relative flex-1 group min-w-[300px]">
                <MagnifyingGlass weight="bold" size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-ios-blue transition-colors" />
                <input
                  type="text"
                  name="q"
                  defaultValue={q}
                  placeholder="Buscar credencial..."
                  className="w-full pl-14 pr-6 py-4 bg-black/[0.03] border-none rounded-2xl text-[15px] font-[800] text-black outline-none focus:ring-4 focus:ring-ios-blue/10 transition-all placeholder:text-black/10"
                />
             </form>
             <CrearCapitanModal />
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
                  <th className="px-8 py-6 text-left text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">Identidad Operativa</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">Puntaje / Rol</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">Estatus Sistema</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">Registro</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.02]">
                {usuarios?.map((usuario) => (
                  <tr key={usuario.id} className="group hover:bg-black/[0.01] transition-colors">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-5">
                        <div className="h-14 w-14 bg-black/[0.03] rounded-2xl flex items-center justify-center text-black border border-white shadow-inner group-hover:bg-ios-blue/5 transition-colors">
                           <span className="text-lg font-[1000] tracking-tighter">
                             {usuario.nombre ? usuario.nombre.substring(0, 2).toUpperCase() : "US"}
                           </span>
                        </div>
                        <div>
                          <div className="text-[17px] font-[900] text-black tracking-tight leading-none mb-1">{usuario.nombre || "Usuario"}</div>
                          <div className="text-[12px] font-bold text-black/30 flex items-center gap-1">
                             <IdentificationCard weight="fill" />
                             {usuario.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        usuario.rol === 'ADMIN' ? 'bg-ios-purple/10 text-ios-purple' :
                        usuario.rol === 'CAPITAN' ? 'bg-ios-blue/10 text-ios-blue' :
                        'bg-black/5 text-black/40'
                      }`}>
                        {usuario.rol === 'ADMIN' ? <ShieldCheck weight="fill" size={14} /> : <UserGear weight="fill" size={14} />}
                        {usuario.rol}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      {usuario.estado === 'BLOQUEADO' ? (
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-ios-pink/10 text-ios-pink">
                            <Prohibit weight="fill" size={14} /> Bloqueado
                          </span>
                          <span className="text-[10px] text-black/30 font-bold max-w-[150px] truncate ml-3">
                            {usuario.motivo_bloqueo}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-ios-green/10 text-ios-green">
                          <CheckCircle weight="fill" size={14} /> Operativo
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-[13px] font-bold text-black/40">
                      {new Date(usuario.created_at).toLocaleDateString("es", { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-right relative">
                      <UserActionClient usuario={usuario} />
                    </td>
                  </tr>
                ))}
                
                {(!usuarios || usuarios.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-8 py-32">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-black/5 rounded-[32px] flex items-center justify-center text-black/10 mb-6 border border-dashed border-black/10">
                           <Users weight="fill" size={40} />
                        </div>
                        <h3 className="text-xl font-[1000] text-black tracking-tight mb-2">Sin Conexiones Activas</h3>
                        <p className="text-[14px] font-semibold text-black/40 max-w-xs">No se encontraron registros para el parámetro: <span className="text-ios-blue">"{q}"</span></p>
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

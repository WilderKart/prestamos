import { createClient } from "@/utils/supabase/server";
import SolicitudForm from "./SolicitudForm";
import SolicitudesList from "./SolicitudesList";

export default async function ClienteSolicitudes() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="ios-page">
        <p className="text-black/40 font-bold">No autenticado</p>
      </div>
    );
  }

  const { data: cliente } = await supabase
    .from("clientes")
    .select("id")
    .eq("usuario_id", user.id)
    .single();

  if (!cliente) {
    return (
      <div className="ios-page">
        <div className="ios-card p-12 text-center border-ios-pink/20">
          <p className="text-ios-pink font-black uppercase tracking-widest text-[11px]">Perfil Extraviado</p>
          <p className="text-sm text-black/60 font-medium mt-1">No se encontró perfil de cliente vinculado.</p>
        </div>
      </div>
    );
  }

  const { data: solicitudes } = await supabase
    .from("solicitudes_prestamo")
    .select(`
      *,
      fiadores (
        id,
        nombre,
        cedula,
        telefono
      )
    `)
    .eq("cliente_id", cliente.id)
    .order("created_at", { ascending: false });

  return (
    <div className="ios-page space-y-10">
      <div className="px-2">
        <h1 className="ios-title">Mis Trámites</h1>
        <p className="text-[13px] font-medium text-black/40 mt-1">
          Solicita un nuevo préstamo o revisa el estado de tus aplicaciones.
        </p>
      </div>

      <SolicitudForm />

      <SolicitudesList solicitudes={solicitudes || []} />
    </div>
  );
}

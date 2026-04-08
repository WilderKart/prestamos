import { createClient } from "@/utils/supabase/server";
import SolicitudForm from "./SolicitudForm";
import { formatCurrency } from "@/utils/format";
import { Wallet, Clock, Check, X, UserPlus } from "lucide-react";

export default async function ClienteSolicitudes() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="pb-32">
        <p className="text-mivank-text-muted">No autenticado</p>
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
      <div className="pb-32">
        <p className="text-mivank-text-muted">No se encontró perfil de cliente</p>
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

  const estadoBadge = (estado: string) => {
    const styles: Record<string, string> = {
      PENDIENTE: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      APROBADO: "bg-green-500/10 text-green-500 border-green-500/20",
      RECHAZADO: "bg-red-500/10 text-red-500 border-red-500/20",
      FIADOR_REQUERIDO: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    };
    return styles[estado] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
  };

  const estadoIcon = (estado: string) => {
    switch (estado) {
      case "PENDIENTE":
        return <Clock className="w-4 h-4" />;
      case "APROBADO":
        return <Check className="w-4 h-4" />;
      case "RECHAZADO":
        return <X className="w-4 h-4" />;
      case "FIADOR_REQUERIDO":
        return <UserPlus className="w-4 h-4" />;
      default:
        return <Wallet className="w-4 h-4" />;
    }
  };

  return (
    <div className="pb-32">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-mivank-text tracking-tight">
          Mis Solicitudes
        </h1>
        <p className="text-mivank-text-muted mt-1">
          Solicita un nuevo préstamo o revisa el estado de tus solicitudes
        </p>
      </div>

      <SolicitudForm />

      {!solicitudes || solicitudes.length === 0 ? (
        <div className="bg-mivank-card border border-mivank-border rounded-2xl p-12 text-center mt-8">
          <Clock className="w-12 h-12 text-mivank-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-bold text-mivank-text">
            Información próximamente
          </h3>
          <p className="text-mivank-text-muted mt-2">
            No tienes solicitudes registradas aún
          </p>
        </div>
      ) : (
        <div className="space-y-4 mt-8">
          {solicitudes.map((solicitud) => (
            <div
              key={solicitud.id}
              className="bg-mivank-card border border-mivank-border rounded-2xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-mivank-text-muted mb-1">
                    Monto solicitado
                  </p>
                  <p className="text-2xl font-black text-mivank-accent">
                    {formatCurrency(solicitud.monto_solicitado || 0)}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${estadoBadge(solicitud.estado)}`}
                >
                  {estadoIcon(solicitud.estado)}
                  {solicitud.estado.replace("_", " ")}
                </span>
              </div>

              <p className="text-xs text-mivank-text-muted">
                {solicitud.created_at
                  ? new Date(solicitud.created_at).toLocaleDateString("es", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Fecha desconocida"}
              </p>

              {solicitud.estado === "FIADOR_REQUERIDO" && (
                <div className="mt-4 bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                  <p className="text-sm text-orange-500 font-bold mb-2">
                    Se requiere fiador para continuar
                  </p>
                  {solicitud.fiadores ? (
                    <p className="text-xs text-mivank-text-muted">
                      Fiador registrado: {solicitud.fiadores.nombre} (
                      {solicitud.fiadores.cedula})
                    </p>
                  ) : (
                    <a
                      href={`/cliente/solicitudes/${solicitud.id}/fiador`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all font-bold text-sm"
                    >
                      <UserPlus className="w-4 h-4" />
                      Agregar fiador
                    </a>
                  )}
                </div>
              )}

              {solicitud.estado === "RECHAZADO" && solicitud.motivo_rechazo && (
                <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-xs text-red-500">
                    Motivo: {solicitud.motivo_rechazo}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

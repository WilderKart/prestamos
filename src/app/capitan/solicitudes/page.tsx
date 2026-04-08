import { createClient } from "@/utils/supabase/server";
import { formatCurrency } from "@/utils/format";
import { Check, X, UserPlus, Clock, AlertTriangle, Banknote } from "lucide-react";
import SolicitudesActions from "./SolicitudesActions";
import { getDesembolsoByPrestamo } from "./desembolsoActions";

export default async function CapitanSolicitudes() {
  const supabase = await createClient();

  const { data: solicitudes } = await supabase
    .from("solicitudes_prestamo")
    .select(`
      *,
      clientes (
        usuario_id,
        cedula,
        telefono,
        score,
        usuarios (
          nombre,
          email
        )
      ),
      fiadores (
        id,
        nombre,
        cedula,
        telefono
      )
    `)
    .order("created_at", { ascending: false });

  // Fetch disbursement status for approved loans
  const solicitudesWithDesembolso = await Promise.all(
    (solicitudes || []).map(async (solicitud) => {
      let desembolso = null;
      if (solicitud.estado === "APROBADO" && solicitud.prestamo_id) {
        const result = await getDesembolsoByPrestamo(solicitud.prestamo_id);
        desembolso = result.desembolso;
      }
      return { ...solicitud, desembolso };
    })
  );

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
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="pb-32">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-mivank-text tracking-tight">
          Solicitudes de Crédito
        </h1>
        <p className="text-mivank-text-muted mt-1">
          Gestiona las solicitudes de préstamo de tus clientes
        </p>
      </div>

      {!solicitudesWithDesembolso || solicitudesWithDesembolso.length === 0 ? (
        <div className="bg-mivank-card border border-mivank-border rounded-2xl p-12 text-center">
          <Clock className="w-12 h-12 text-mivank-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-bold text-mivank-text">
            Información próximamente
          </h3>
          <p className="text-mivank-text-muted mt-2">
            No hay solicitudes de préstamo registradas aún
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {solicitudesWithDesembolso.map((solicitud) => (
            <div
              key={solicitud.id}
              className="bg-mivank-card border border-mivank-border rounded-2xl p-6 hover:border-mivank-accent/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-mivank-text">
                    {solicitud.clientes?.usuarios?.nombre || "Sin nombre"}
                  </h3>
                  <p className="text-sm text-mivank-text-muted">
                    Cédula: {solicitud.clientes?.cedula || "N/A"}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${estadoBadge(solicitud.estado)}`}
                >
                  {estadoIcon(solicitud.estado)}
                  {solicitud.estado.replace("_", " ")}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-mivank-text-muted mb-1">Monto</p>
                  <p className="text-lg font-black text-mivank-accent">
                    {formatCurrency(solicitud.monto_solicitado || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-mivank-text-muted mb-1">Score</p>
                  <p className="text-lg font-bold text-mivank-text">
                    {solicitud.clientes?.score || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-mivank-text-muted mb-1">Fecha</p>
                  <p className="text-sm font-bold text-mivank-text">
                    {solicitud.created_at
                      ? new Date(solicitud.created_at).toLocaleDateString("es")
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-mivank-text-muted mb-1">Fiador</p>
                  <p className="text-sm font-bold text-mivank-text">
                    {solicitud.fiadores
                      ? solicitud.fiadores.nombre
                      : "Pendiente"}
                  </p>
                </div>
              </div>

              {solicitud.estado === "PENDIENTE" && (
                <SolicitudesActions 
                  solicitudId={solicitud.id}
                  clienteNombre={solicitud.clientes?.usuarios?.nombre}
                />
              )}

              {solicitud.estado === "APROBADO" && solicitud.desembolso && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Banknote className="w-4 h-4 text-green-500" />
                    <p className="text-sm text-green-500 font-bold">Desembolso Registrado</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-mivank-text-muted">Método:</span>
                      <span className="ml-2 font-bold text-mivank-text capitalize">{solicitud.desembolso.metodo_desembolso?.toLowerCase()}</span>
                    </div>
                    <div>
                      <span className="text-mivank-text-muted">Fecha:</span>
                      <span className="ml-2 font-bold text-mivank-text">{new Date(solicitud.desembolso.fecha_desembolso).toLocaleDateString("es")}</span>
                    </div>
                    {solicitud.desembolso.comprobante_url && (
                      <div>
                        <a 
                          href={solicitud.desembolso.comprobante_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 font-bold"
                        >
                          Ver comprobante →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {solicitud.estado === "APROBADO" && !solicitud.desembolso && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                  <p className="text-sm text-yellow-500 font-bold">
                    ⚠️ Préstamo aprobado pero sin desembolso registrado
                  </p>
                  <p className="text-xs text-yellow-500/70 mt-1">
                    El préstamo no se considera completo hasta registrar el desembolso.
                  </p>
                </div>
              )}

              {solicitud.estado === "FIADOR_REQUERIDO" && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                  <p className="text-sm text-orange-500 font-bold">
                    ⏳ Esperando que el cliente agregue un fiador
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

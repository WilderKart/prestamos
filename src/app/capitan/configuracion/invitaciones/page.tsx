"use client";

import { useState } from "react";
import { 
  Plus, 
  Copy, 
  Check, 
  Ticket, 
  ShareNetwork, 
  Info,
  Clock,
  Users
} from "@phosphor-icons/react";
import { crearCodigoInvitacionAction } from "@/app/actions/user_management";
import { toast } from "sonner";

export default function InvitationsPage() {
  const [codigo, setCodigo] = useState<string | "">("");
  const [isPending, setIsPending] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const handleGenerar = async () => {
    setIsPending(true);
    try {
      const res = await crearCodigoInvitacionAction();
      if (res.success && res.codigo) {
        setCodigo(res.codigo);
        toast.success("Código generado con éxito");
      } else {
        toast.error(res.error || "Error al generar código");
      }
    } catch (error) {
      toast.error("Error inesperado en el servidor");
    } finally {
      setIsPending(false);
    }
  };

  const copyToClipboard = (text: string) => {
    const registrationLink = `${window.location.origin}/registro?codigo=${text}`;
    navigator.clipboard.writeText(registrationLink);
    setHasCopied(true);
    toast.success("Link de registro copiado");
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Táctico */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Ticket className="w-8 h-8 text-blue-600" weight="fill" />
            ONBOARDING PRO
          </h1>
          <p className="text-gray-500 font-medium ml-11">
            Gestión táctica de registros operativos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Panel Principal de Generación */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border-2 border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-start justify-between mb-8">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900">Generar Invitación</h2>
                <p className="text-sm text-slate-500">
                  Crea un código único para que tus clientes se registren automáticamente en tu empresa.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={handleGenerar}
                disabled={isPending}
                className="w-full flex items-center justify-center gap-3 bg-black text-white py-4 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                {isPending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="w-5 h-5" weight="bold" />
                    GENERAR CÓDIGO MAESTRO
                  </>
                )}
              </button>

              {codigo && (
                <div className="mt-4 p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 animate-in zoom-in-95 duration-300">
                  <div className="flex flex-col items-center gap-4">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Código Activo</span>
                    <div className="text-4xl font-mono font-black text-black tracking-tighter">
                      {codigo}
                    </div>
                    <button
                      onClick={() => copyToClipboard(codigo)}
                      className="mt-2 w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 py-3 rounded-xl font-bold hover:bg-blue-100 transition-colors"
                    >
                      {hasCopied ? (
                        <>
                          <Check className="w-5 h-5" weight="bold" />
                          ¡COPIADO!
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5" weight="bold" />
                          COPIAR LINK DE REGISTRO
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-slate-400 text-center uppercase font-bold tracking-tight">
                      El link incluye el token de vinculación automática
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex gap-4">
            <div className="bg-blue-600 p-2 rounded-xl h-fit">
              <Info className="w-5 h-5 text-white" weight="fill" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-blue-900">Segurización Multi-tenant</h4>
              <p className="text-sm text-blue-700/80 leading-relaxed">
                Este sistema utiliza <span className="font-black">Soberanía de Datos</span>. 
                Los clientes registrados con este código quedarán anclados físicamente a tu infraestructura y no podrán ser vistos por otras empresas.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar de Estadísticas/Info */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-8 space-y-6">
            <h3 className="font-bold text-lg border-b border-white/10 pb-4">Detalles Técnicos</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Clock className="w-6 h-6 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold">Validez</p>
                  <p className="font-medium">24 Horas / Indefinido</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Users className="w-6 h-6 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold">Capacidad</p>
                  <p className="font-medium">Hasta 100 Registros</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <ShareNetwork className="w-6 h-6 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold">Distribución</p>
                  <p className="font-medium">Link Directo</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-1 border-2 border-slate-100 rounded-3xl overflow-hidden">
             <div className="p-6 space-y-2">
                <h4 className="font-bold text-slate-900">¿Cómo usar?</h4>
                <ol className="text-xs text-slate-500 space-y-3 list-decimal list-inside">
                  <li>Genera un código maestro arriba.</li>
                  <li>Copia el link personalizado.</li>
                  <li>Compártelo vía WhatsApp a tus clientes.</li>
                  <li>Los clientes aparecerán en tu lista.</li>
                </ol>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

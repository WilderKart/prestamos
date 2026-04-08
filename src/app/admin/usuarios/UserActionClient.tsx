"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { bloquearUsuario, desbloquearUsuario, cambiarRolUsuario } from "./actions";
import { Ban, CheckCircle, ShieldAlert, MoreVertical, Loader2 } from "lucide-react";

type Rol = 'CLIENTE' | 'CAPITAN' | 'ADMIN';

export default function UserActionClient({ usuario }: { usuario: any }) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const handleBloquear = async () => {
    const motivo = prompt("Ingrese el motivo de bloqueo:");
    if (!motivo) return;

    setLoadingAction("bloquear");
    toast.loading("Procesando...", { id: "bloquear" });

    try {
      await bloquearUsuario(usuario.id, motivo);
      toast.success("Usuario bloqueado exitosamente", { id: "bloquear" });
    } catch (e: any) {
      toast.error(e.message || "Error al ejecutar operación", { id: "bloquear" });
    } finally {
      setLoadingAction(null);
      setShowMenu(false);
    }
  };

  const handleDesbloquear = async () => {
    if (!confirm("¿Seguro que deseas desbloquear a este usuario?")) return;

    setLoadingAction("desbloquear");
    toast.loading("Procesando...", { id: "desbloquear" });

    try {
      await desbloquearUsuario(usuario.id);
      toast.success("Usuario desbloqueado", { id: "desbloquear" });
    } catch (e: any) {
      toast.error(e.message || "Error al ejecutar operación", { id: "desbloquear" });
    } finally {
      setLoadingAction(null);
      setShowMenu(false);
    }
  };

  const handleCambiarRol = async (nuevoRol: Rol) => {
    if (usuario.rol === nuevoRol) return;
    if (!confirm(`¿Atención: Estás a punto de convertir a este usuario en ${nuevoRol}? Esto cambiará drásticamente sus permisos.`)) return;

    setLoadingAction(`rol-${nuevoRol}`);
    toast.loading("Cargando información...", { id: "rol" });

    try {
      await cambiarRolUsuario(usuario.id, nuevoRol);
      toast.success(`Rol cambiado a ${nuevoRol}`, { id: "rol" });
    } catch (e: any) {
      // Devolver error según reglas obligatorias: "No tienes permisos para acceder a esta sección", "Acción no permitida", etc.
      if (e.message.includes("permission denied")) {
        toast.error("Acción no permitida", { id: "rol" });
      } else {
        toast.error(e.message || "Error al ejecutar operación", { id: "rol" });
      }
    } finally {
      setLoadingAction(null);
      setShowMenu(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button 
        onClick={() => setShowMenu(!showMenu)}
        disabled={!!loadingAction}
        className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
      >
        {loadingAction ? <Loader2 className="w-5 h-5 animate-spin text-indigo-600" /> : <MoreVertical className="w-5 h-5 text-gray-500" />}
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>
          <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
            <div className="py-1" role="menu">
              
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</p>
              </div>

              {usuario.estado !== 'BLOQUEADO' ? (
                <button
                  onClick={handleBloquear}
                  disabled={!!loadingAction}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Ban className="w-4 h-4" /> Bloquear Usuario
                </button>
              ) : (
                <button
                  onClick={handleDesbloquear}
                  disabled={!!loadingAction}
                  className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Desbloquear Usuario
                </button>
              )}

              <div className="px-4 py-2 border-y border-gray-100 bg-gray-50 mt-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Cambiar Rol</p>
              </div>

              {(['CLIENTE', 'CAPITAN', 'ADMIN'] as Rol[]).map((r) => (
                <button
                  key={r}
                  onClick={() => handleCambiarRol(r)}
                  disabled={!!loadingAction || usuario.rol === r}
                  className={`w-full text-left px-4 py-2 text-sm ${usuario.rol === r ? 'text-gray-400 cursor-not-allowed bg-gray-50' : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'} flex items-center gap-2`}
                >
                  <ShieldAlert className={`w-4 h-4 ${usuario.rol === r ? 'opacity-50' : ''}`} /> Hacer {r}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

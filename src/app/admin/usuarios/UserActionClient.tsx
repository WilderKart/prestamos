"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { bloquearUsuario, desbloquearUsuario, cambiarRolUsuario } from "./actions";
import { 
  DotsThreeOutlineVertical, 
  CircleNotch, 
  HandBlock, 
  ShieldCheck, 
  UserGear,
  PencilSimple,
  CaretRight,
  UserCircle,
  ShieldWarning,
  CheckCircle,
  X
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

type Rol = 'CLIENTE' | 'CAPITAN' | 'ADMIN';

export default function UserActionClient({ usuario }: { usuario: any }) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const handleBloquear = async () => {
    const motivo = prompt("Indique el motivo de la suspensión de seguridad:");
    if (!motivo) return;

    setLoadingAction("bloquear");
    const toastId = toast.loading("Aplicando protocolo de bloqueo...");

    try {
      await bloquearUsuario(usuario.id, motivo);
      toast.success("Identidad suspendida correctamente", { id: toastId });
    } catch (e: any) {
      toast.error(e.message || "Fallo en la operación de red", { id: toastId });
    } finally {
      setLoadingAction(null);
      setShowMenu(false);
    }
  };

  const handleDesbloquear = async () => {
    if (!confirm("¿Autorizar el rstablecimiento de acceso para este usuario?")) return;

    setLoadingAction("desbloquear");
    const toastId = toast.loading("Restableciendo credenciales...");

    try {
      await desbloquearUsuario(usuario.id);
      toast.success("Acceso restaurado con éxito", { id: toastId });
    } catch (e: any) {
      toast.error(e.message || "Fallo en la sincronización", { id: toastId });
    } finally {
      setLoadingAction(null);
      setShowMenu(false);
    }
  };

  const handleCambiarRol = async (nuevoRol: Rol) => {
    if (usuario.rol === nuevoRol) return;
    if (!confirm(`MODIFICACIÓN DE NIVEL DE ACCESO: ¿Establecer rol ${nuevoRol} para este usuario?`)) return;

    setLoadingAction(`rol-${nuevoRol}`);
    const toastId = toast.loading("Actualizando matriz de permisos...");

    try {
      await cambiarRolUsuario(usuario.id, nuevoRol);
      toast.success(`Nivel de acceso actualizado a ${nuevoRol}`, { id: toastId });
    } catch (e: any) {
      if (e.message.includes("permission denied")) {
        toast.error("Acción no autorizada por protocolo", { id: toastId });
      } else {
        toast.error(e.message || "Fallo en la base de datos", { id: toastId });
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
        className="w-10 h-10 bg-black/[0.03] rounded-xl hover:bg-black hover:text-white transition-all flex items-center justify-center text-black/20 disabled:opacity-50 active:scale-95"
      >
        {loadingAction ? (
          <CircleNotch className="w-5 h-5 animate-spin" weight="bold" />
        ) : (
          <DotsThreeOutlineVertical className="w-5 h-5" weight="fill" />
        )}
      </button>

      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100]" 
              onClick={() => setShowMenu(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 mt-3 w-64 rounded-[28px] bg-white shadow-2xl z-[110] overflow-hidden border border-black/[0.03] p-2"
            >
              <div className="flex flex-col gap-1">
                <div className="px-4 py-3 text-[10px] font-black text-black/20 uppercase tracking-[0.2em]">Protocolo de Acción</div>
                
                {usuario.estado !== 'BLOQUEADO' ? (
                  <button
                    onClick={handleBloquear}
                    disabled={!!loadingAction}
                    className="w-full text-left px-4 py-3 text-[14px] font-bold text-ios-pink hover:bg-ios-pink/5 rounded-2xl flex items-center gap-3 transition-colors"
                  >
                    <HandBlock weight="fill" size={18} /> Bloquear Acceso
                  </button>
                ) : (
                  <button
                    onClick={handleDesbloquear}
                    disabled={!!loadingAction}
                    className="w-full text-left px-4 py-3 text-[14px] font-bold text-ios-green hover:bg-ios-green/5 rounded-2xl flex items-center gap-3 transition-colors"
                  >
                    <CheckCircle weight="fill" size={18} /> Restaurar Acceso
                  </button>
                )}

                <div className="h-[1px] bg-black/[0.03] my-2 mx-4" />
                <div className="px-4 py-3 text-[10px] font-black text-black/20 uppercase tracking-[0.2em]">Matriz de Permisos</div>

                {(['CLIENTE', 'CAPITAN', 'ADMIN'] as Rol[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => handleCambiarRol(r)}
                    disabled={!!loadingAction || usuario.rol === r}
                    className={`w-full text-left px-4 py-3 text-[14px] font-bold rounded-2xl flex items-center justify-between transition-all ${
                      usuario.rol === r 
                      ? 'text-black/10 bg-black/[0.01] cursor-default' 
                      : 'text-black/60 hover:bg-ios-blue/5 hover:text-ios-blue'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                       <ShieldCheck weight={usuario.rol === r ? "fill" : "bold"} size={18} />
                       <span>{r}</span>
                    </div>
                    {usuario.rol === r && <CaretRight weight="bold" size={12} />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

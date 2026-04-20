"use client";

import { useState } from "react";
import { 
  DotsThreeVertical, 
  PencilSimple, 
  UserCircleGear, 
  Prohibit, 
  Sun, 
  Coffee, 
  Warning,
  CircleNotch,
  Gear
} from "@phosphor-icons/react";
import { cambiarEstadoCobrador } from "./actions";
import CobradorFormModal from "./CobradorFormModal";
import { toast } from "react-hot-toast";
import IosModal from "@/components/ui/IosModal";

interface CobradorCardActionsProps {
  cobrador: any;
  fullWidth?: boolean;
}

export default function CobradorCardActions({ cobrador, fullWidth }: CobradorCardActionsProps) {
  const [showModal, setShowModal] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const toggleModal = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setShowModal(!showModal);
  };

  const handleStatusChange = async (nuevoEstado: string) => {
    setShowModal(false);
    setIsPending(true);
    const result = await cambiarEstadoCobrador(cobrador.id, nuevoEstado);
    setIsPending(false);
    
    if (result.success) {
      toast.success(`Estado actualizado a ${nuevoEstado}`);
    } else {
      toast.error("Error al actualizar estado");
    }
  };

  const statusOptions = [
    { id: "ACTIVO", label: "Activar Integrante", icon: UserCircleGear, color: "text-ios-green", bg: "bg-ios-green/10" },
    { id: "VACACIONES", label: "Marcar Vacaciones", icon: Sun, color: "text-ios-blue", bg: "bg-ios-blue/10" },
    { id: "LICENCIA", label: "Permiso / Licencia", icon: Coffee, color: "text-ios-purple", bg: "bg-ios-purple/10" },
    { id: "PENALIZADO", label: "Aplicar Penalización", icon: Warning, color: "text-ios-yellow", bg: "bg-ios-yellow/10" },
    { id: "BLOQUEADO", label: "Bloqueo Total del Enclave", icon: Prohibit, color: "text-ios-pink", bg: "bg-ios-pink/10" },
  ];

  return (
    <div className={`${fullWidth ? "w-full" : "relative"}`}>
      <div className="flex gap-2">
        <button 
          onClick={toggleModal}
          disabled={isPending}
          className={`${fullWidth ? "w-full" : "w-auto"} text-black/20 hover:text-black py-4 px-6 bg-black/[0.02] rounded-2xl transition-all active:scale-90 disabled:opacity-50 border border-black/[0.03] shadow-sm flex items-center justify-center gap-3`}
        >
          {isPending ? (
            <CircleNotch className="animate-spin" size={24} />
          ) : (
            <>
              <DotsThreeVertical weight="bold" size={24} />
              {fullWidth && <span className="text-[10px] font-black uppercase tracking-widest text-black/40">Gestionar Estado</span>}
            </>
          )}
        </button>
      </div>

      <IosModal
        isOpen={showModal}
        onClose={toggleModal}
        title="Gestión de Integrante"
        subtitle={cobrador.nombre}
        icon={<Gear weight="fill" size={28} />}
      >
        <div className="space-y-8 pb-10">
          <div className="space-y-4">
            <p className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em] ml-2">Configuración de Perfil</p>
            <CobradorFormModal 
              cobrador={cobrador} 
              trigger={
                <button className="w-full h-16 bg-black text-white rounded-[24px] flex items-center justify-between px-8 group active:scale-[0.98] transition-all">
                  <div className="flex items-center gap-4">
                    <PencilSimple weight="fill" size={22} className="text-white/40" />
                    <span className="text-[15px] font-black uppercase tracking-widest">Editar Credenciales</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20">
                     <DotsThreeVertical weight="bold" size={16} />
                  </div>
                </button>
              }
            />
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em] ml-2">Cambios de Estado Operativo</p>
            <div className="grid grid-cols-1 gap-3">
              {statusOptions.filter(opt => opt.id !== cobrador.estado).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    if (opt.id === 'BLOQUEADO' && !confirm('¿Confirma el BLOQUEO TOTAL de este integrante? Esta acción revocará todo acceso operativo inmediatamente.')) return;
                    handleStatusChange(opt.id);
                  }}
                  className="w-full h-16 bg-black/[0.03] hover:bg-black group rounded-[24px] flex items-center gap-5 px-6 transition-all active:scale-[0.98]"
                >
                  <div className={`w-10 h-10 rounded-xl ${opt.bg} group-hover:bg-white/10 flex items-center justify-center ${opt.color}`}>
                    <opt.icon weight="fill" size={20} />
                  </div>
                  <span className="text-[13px] font-black text-black group-hover:text-white uppercase tracking-widest">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </IosModal>
    </div>
  );
}

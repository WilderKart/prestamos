"use client";

import { useState, useActionState, useEffect } from "react";
import { 
  UserPlus, 
  X, 
  Envelope, 
  Phone, 
  IdentificationCard, 
  CaretRight, 
  CircleNotch,
  WarningCircle,
  PlusCircle,
  ShieldCheck
} from "@phosphor-icons/react";
import { crearCobrador, actualizarCobrador } from "./actions";
import IosModal from "@/components/ui/IosModal";
import { MivankResponse } from "@/app/actions/user_management";

interface CobradorFormModalProps {
  cobrador?: any;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function CobradorFormModal({ 
  cobrador, 
  trigger,
  isOpen: externalOpen,
  onClose: externalClose
}: CobradorFormModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  
  const toggleModal = () => {
    if (externalOpen !== undefined) {
      externalClose?.();
    } else {
      setInternalOpen(!internalOpen);
    }
  };

  const isEditing = !!cobrador;
  const actionWithId = isEditing 
    ? actualizarCobrador.bind(null, cobrador.id)
    : crearCobrador;

  const [state, formAction, isPending] = useActionState<MivankResponse | null, FormData>(actionWithId as any, null);

  useEffect(() => {
    if (state?.success && isOpen) {
      const timer = setTimeout(() => {
        if (externalOpen !== undefined) {
          externalClose?.();
        } else {
          setInternalOpen(false);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state?.success, isOpen, externalOpen, externalClose]);

  return (
    <>
      {externalOpen === undefined && (
        <div onClick={toggleModal}>
          {trigger || (
            <button
              className="w-full h-14 bg-ios-blue text-white rounded-[22px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center shadow-2xl shadow-ios-blue/30 active:scale-95 transition-all group lg:w-auto lg:px-10"
            >
              <span>Nuevo Integrante</span>
            </button>
          )}
        </div>
      )}

      <IosModal
        isOpen={isOpen}
        onClose={toggleModal}
        title={isEditing ? "Editar Integrante" : "Ficha de Equipo"}
        subtitle={isEditing ? "Actualización de Credenciales" : "Nuevo Registro Operativo"}
        icon={<UserPlus weight="fill" size={28} />}
      >
        <div className="space-y-6 pb-20">
          {state?.error && (
            <div className="p-4 bg-ios-pink/5 border border-ios-pink/10 rounded-[24px] flex gap-3 items-center">
               <WarningCircle weight="fill" size={18} className="text-ios-pink" />
               <p className="text-[12px] font-bold text-ios-pink">
                 {state.error || "Verifique los datos de acceso."}
               </p>
            </div>
          )}

          <form action={formAction} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em] ml-2">Identidad Operativa</label>
                <input
                  name="nombre"
                  type="text"
                  required
                  defaultValue={state?.inputs?.nombre || cobrador?.nombre || ""}
                  placeholder="Nombre Completo"
                  className="w-full ios-input font-[800] text-[17px]"
                  disabled={isPending}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em] ml-2">Documento CC</label>
                  <div className="relative">
                    <IdentificationCard weight="fill" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/10" />
                    <input
                      name="cedula"
                      type="text"
                      required
                      disabled={isEditing || isPending}
                      defaultValue={state?.inputs?.cedula || cobrador?.cedula || ""}
                      placeholder="Cédula"
                      className="w-full ios-input pl-12 font-[800] text-[17px] disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em] ml-2">WhatsApp</label>
                  <div className="relative">
                    <Phone weight="fill" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/10" />
                    <input
                      name="telefono"
                      type="tel"
                      defaultValue={state?.inputs?.telefono || cobrador?.telefono || ""}
                      placeholder="Número de contacto"
                      className="w-full ios-input pl-12 font-[800] text-[17px]"
                      disabled={isPending}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em] ml-2">Credencial Acceso</label>
                <div className="relative">
                  <Envelope weight="fill" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/10" />
                  <input
                    name="email"
                    type="email"
                    required
                    defaultValue={state?.inputs?.email || cobrador?.email || ""}
                    placeholder="Correo Corporativo"
                    className="w-full ios-input pl-12 font-[800] text-[17px]"
                    disabled={isPending}
                  />
                </div>
                <p className="text-[9px] text-black/20 font-black uppercase tracking-widest ml-4 mt-2 flex items-center gap-2">
                  <ShieldCheck weight="fill" className="text-ios-green" />
                  Sincronización Auth Enclave
                </p>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isPending}
                className="w-full h-16 bg-black text-white rounded-[24px] flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-black/10 active:scale-95 transition-all disabled:opacity-50"
              >
                {isPending ? (
                  <CircleNotch size={24} weight="bold" className="animate-spin" />
                ) : (
                  <>
                    <span>{isEditing ? "Guardar Cambios" : "Desplegar Integrante"}</span>
                    <CaretRight weight="bold" size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </IosModal>
    </>
  );
}

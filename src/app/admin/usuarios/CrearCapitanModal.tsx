"use client";

import { useState, useActionState } from "react";
import { 
  UserPlus, 
  X, 
  Envelope, 
  IdentificationCard, 
  CaretRight, 
  CircleNotch,
  WarningCircle,
  ShieldCheck,
  PlusCircle,
  Buildings
} from "@phosphor-icons/react";
import { crearCapitan } from "./actions";
import { motion, AnimatePresence } from "framer-motion";

export default function CrearCapitanModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(crearCapitan, null);

  const toggleModal = () => setIsOpen(!isOpen);

  if (state?.success && isOpen) {
    setIsOpen(false);
  }

  return (
    <>
      <button
        onClick={toggleModal}
        className="w-full h-14 bg-ios-blue text-white rounded-[22px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl shadow-ios-blue/30 active:scale-95 transition-all group lg:w-auto lg:px-10"
      >
        <PlusCircle weight="fill" size={24} className="group-hover:rotate-90 transition-transform" />
        <span>Registrar Capitán</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-6 overflow-hidden">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={toggleModal}
            />

            {/* Modal Content */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative bg-white w-full max-w-xl rounded-t-[44px] md:rounded-[44px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 md:p-10 overflow-y-auto">
                <div className="flex justify-between items-start mb-8">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-[1000] text-black tracking-tighter">Asignar Capitán</h2>
                    <p className="text-[13px] font-medium text-black/40">Crea una nueva cédula de mando para el ecosistema.</p>
                  </div>
                  <button 
                    onClick={toggleModal}
                    className="w-12 h-12 bg-black/5 hover:bg-ios-pink/10 hover:text-ios-pink rounded-2xl transition-all flex items-center justify-center text-black/30"
                  >
                    <X weight="bold" size={24} />
                  </button>
                </div>

                {state?.error && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8 p-6 bg-ios-pink/5 border border-ios-pink/10 rounded-[28px] flex gap-4 items-center"
                  >
                    <div className="h-10 w-10 bg-ios-pink/10 rounded-xl flex items-center justify-center text-ios-pink shrink-0">
                       <WarningCircle weight="fill" size={20} />
                    </div>
                    <p className="text-[13px] font-bold text-ios-pink italic">
                      {state.message || "Verifique los datos de seguridad."}
                    </p>
                  </motion.div>
                )}

                <form action={formAction} className="space-y-8">
                  <div className="space-y-5">
                    {/* Nombre */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em] ml-2">Nombre del Mando</label>
                      <input
                        name="nombre"
                        type="text"
                        required
                        placeholder="Ej. Alexander Mivank"
                        className="w-full bg-black/[0.03] rounded-[24px] px-8 py-5 outline-none transition-all placeholder:text-black/20 font-[800] text-[17px] focus:ring-4 focus:ring-ios-blue/10 border-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Email */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em] ml-2">Correo Corporativo</label>
                        <div className="relative">
                          <Envelope weight="fill" size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20" />
                          <input
                            name="email"
                            type="email"
                            required
                            placeholder="admin@mivank.com"
                            className="w-full bg-black/[0.03] rounded-[24px] pl-16 pr-8 py-5 outline-none transition-all placeholder:text-black/20 font-[800] text-[17px] focus:ring-4 focus:ring-ios-blue/10 border-none"
                          />
                        </div>
                      </div>

                      {/* Empresa */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em] ml-2">ID Operadora</label>
                        <div className="relative">
                          <Buildings weight="fill" size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20" />
                          <input
                            name="nombre_empresa"
                            type="text"
                            required
                            placeholder="Nombre Empresa"
                            className="w-full bg-black/[0.03] rounded-[24px] pl-16 pr-8 py-5 outline-none transition-all placeholder:text-black/20 font-[800] text-[17px] focus:ring-4 focus:ring-ios-blue/10 border-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-ios-blue/5 rounded-[32px] border border-ios-blue/10 space-y-3">
                       <div className="flex items-center gap-3">
                          <ShieldCheck weight="fill" size={24} className="text-ios-blue" />
                          <span className="text-[14px] font-[1000] text-black">Protocolo de Alta</span>
                       </div>
                       <p className="text-[12px] font-bold text-black/40 leading-relaxed">
                         Al proceder, el sistema creará una estructura jerárquica con rol <span className="text-ios-blue">CAPITAN</span> y vinculará una nueva operadora fiscal.
                       </p>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col gap-3">
                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full h-16 bg-black text-white rounded-[24px] flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.2em] hover:bg-ios-gray transition-all active:scale-95 disabled:opacity-50 shadow-2xl shadow-black/20"
                    >
                      {isPending ? (
                        <CircleNotch size={24} weight="bold" className="animate-spin" />
                      ) : (
                        <>
                          <span>Finalizar Asignación</span>
                          <CaretRight weight="bold" size={20} />
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={toggleModal}
                      className="w-full h-14 bg-black/[0.02] text-black/30 rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em]"
                    >
                      Cancelar Operación
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

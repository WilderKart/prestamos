"use client";

import { useState } from "react";
import { usePersistentForm } from "@/hooks/usePersistentForm";
import { updateConfig } from "./actions";
import toast from "react-hot-toast";
import { 
  PencilSimple, 
  Check, 
  X, 
  CircleNotch,
  ShieldCheck,
  IdentificationCard,
  Key
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

export default function ConfigForm({ config }: { config: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { data: draft, setFieldValue, clearDraft } = usePersistentForm(`config-${config.clave}`, {
    valor: config.valor,
  });

  const value = draft.valor;
  const setValue = (v: string) => setFieldValue("valor", v);

  const handleSave = async () => {
    if (value === config.valor) {
      setIsEditing(false);
      return;
    }
    
    setIsSaving(true);
    const toastId = toast.loading("Actualizando Matriz...", {
      style: {
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        fontWeight: '800',
        fontSize: '13px',
        border: '1px solid rgba(0,0,0,0.05)'
      }
    });

    try {
      await updateConfig(config.clave, value);
      toast.success("Parámetro Configurado", { id: toastId });
      clearDraft();
      setIsEditing(false);
    } catch (e: any) {
      toast.error(e.message || "Fallo en la Sincronización", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <tr className="group transition-all hover:bg-black/[0.01]">
      <td className="px-8 py-6 whitespace-nowrap">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-black/[0.03] flex items-center justify-center text-black/20 group-hover:text-ios-blue transition-colors">
              <Key weight="fill" size={16} />
           </div>
           <span className="text-[14px] font-[1000] text-black tracking-tight uppercase">
             {config.clave}
           </span>
        </div>
      </td>
      <td className="px-8 py-6">
        <p className="text-[13px] font-semibold text-black/40 leading-snug max-w-md">
          {config.descripcion}
        </p>
      </td>
      <td className="px-8 py-6 whitespace-nowrap text-right">
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div 
              key="editing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center justify-end gap-3"
            >
              <input 
                type="text" 
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={isSaving}
                className="text-right px-4 py-2 bg-black/[0.04] border-none rounded-xl text-[14px] font-[1000] text-black w-40 outline-none focus:ring-4 focus:ring-ios-blue/5 transition-all shadow-inner"
              />
              <div className="flex gap-2">
                 <button 
                   onClick={handleSave} 
                   disabled={isSaving}
                   className="w-10 h-10 bg-ios-green text-white rounded-xl flex items-center justify-center shadow-lg shadow-ios-green/20 active:scale-95 transition-all"
                 >
                   {isSaving ? <CircleNotch className="animate-spin" size={20} weight="bold" /> : <Check weight="bold" size={20} />}
                 </button>
                 <button 
                   onClick={() => { setIsEditing(false); setValue(config.valor); clearDraft(); }} 
                   disabled={isSaving}
                   className="w-10 h-10 bg-black/[0.05] text-black/40 rounded-xl flex items-center justify-center hover:bg-black/10 active:scale-95 transition-all"
                 >
                   <X weight="bold" size={20} />
                 </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="viewing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-end gap-6"
            >
              <span className="text-[17px] font-[1000] text-black tracking-tighter">
                {config.valor}
              </span>
              <button 
                onClick={() => setIsEditing(true)}
                className="w-10 h-10 bg-black/[0.03] text-black/20 rounded-xl flex items-center justify-center group-hover:bg-ios-blue group-hover:text-white transition-all shadow-sm active:scale-90"
              >
                <PencilSimple weight="fill" size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </td>
    </tr>
  );
}

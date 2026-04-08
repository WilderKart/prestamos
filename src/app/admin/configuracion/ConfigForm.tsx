"use client";

import { useState } from "react";
import { updateConfig } from "./actions";
import toast from "react-hot-toast";
import { Edit2, Check, X, Loader2 } from "lucide-react";

export default function ConfigForm({ config }: { config: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(config.valor);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (value === config.valor) {
      setIsEditing(false);
      return;
    }
    
    setIsSaving(true);
    toast.loading("Guardando...", { id: `conf-${config.clave}` });
    try {
      await updateConfig(config.clave, value);
      toast.success("Configuración actualizada", { id: `conf-${config.clave}` });
      setIsEditing(false);
    } catch (e: any) {
      toast.error(e.message || "Error al actualizar", { id: `conf-${config.clave}` });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {config.clave}
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {config.descripcion}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
        {isEditing ? (
          <div className="flex items-center justify-end gap-2">
            <input 
              type="text" 
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={isSaving}
              className="text-right px-2 py-1 border border-gray-300 rounded text-sm w-32 focus:ring-1 focus:ring-indigo-500"
            />
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="text-green-600 hover:bg-green-50 p-1 rounded transition-colors"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => { setIsEditing(false); setValue(config.valor); }} 
              disabled={isSaving}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-2">
            <span className="font-medium text-gray-900">{config.valor}</span>
            <button 
              onClick={() => setIsEditing(true)}
              className="text-gray-400 hover:text-indigo-600 p-1 rounded transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

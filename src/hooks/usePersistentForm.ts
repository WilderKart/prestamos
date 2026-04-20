"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * Hook para persistir datos de formularios en localStorage.
 * Segmenta los datos por usuario para garantizar Zero Trust en dispositivos compartidos.
 */
export function usePersistentForm<T extends Record<string, any>>(
  formId: string,
  initialValues: T,
  userId?: string
) {
  // Generar una llave única combinando el formulario y el usuario
  const storageKey = `mivank_draft_${userId || "guest"}_${formId}`;

  const [data, setData] = useState<T>(initialValues);
  const [isReady, setIsReady] = useState(false);

  // Cargar borrador inicial
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData((prev) => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Error al restaurar borrador de formulario:", e);
      }
    }
    setIsReady(true);
  }, [storageKey]);

  // Guardar borrador (con debounce manual simple si fuera necesario, 
  // pero por ahora directo al cambio para máxima seguridad)
  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setData((prev) => {
      const newData = { ...prev, [name]: value };
      localStorage.setItem(storageKey, JSON.stringify(newData));
      return newData;
    });
  }, [storageKey]);

  const setFullData = useCallback((newData: T) => {
    setData(newData);
    localStorage.setItem(storageKey, JSON.stringify(newData));
  }, [storageKey]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(storageKey);
    setData(initialValues);
  }, [storageKey, initialValues]);

  return {
    data,
    isReady,
    setFieldValue,
    setFullData,
    clearDraft,
  };
}

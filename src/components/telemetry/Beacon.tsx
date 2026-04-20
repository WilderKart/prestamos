"use client";

import { useEffect, useRef } from "react";
import { saveTrackingPointAction } from "@/app/actions/routes";

interface BeaconProps {
  empresaId: string;
  isActive: boolean;
}

export default function Beacon({ empresaId, isActive }: BeaconProps) {
  const lastSavedRef = useRef<{ lat: number; lng: number; time: number }>({
    lat: 0,
    lng: 0,
    time: 0
  });

  const isBackgroundRef = useRef(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      isBackgroundRef.current = document.visibilityState === 'hidden';
      if (isBackgroundRef.current) {
        console.log("📡 BEACON_SLEEP: App en segundo plano. Throttling agresivo activo.");
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation || !isActive) return;

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const now = Date.now();
        
        // Lógica de Throttling y Movimiento Significativo
        const timeDiff = now - lastSavedRef.current.time;
        const distDiff = Math.sqrt(
          Math.pow(latitude - lastSavedRef.current.lat, 2) + 
          Math.pow(longitude - lastSavedRef.current.lng, 2)
        );

        // Guardar si: han pasado > 45s O se ha movido > 0.0001 deg (~10-11m)
        // Si está en background, duplicar el umbral de tiempo para ahorrar batería
        const threshold = isBackgroundRef.current ? 120000 : 45000;

        if (timeDiff > threshold || distDiff > 0.0001) {
          console.log("📡 SIGNAL_PING: Actualizando telemetría táctica...");
          
          await saveTrackingPointAction({
            lat: latitude,
            lng: longitude,
            empresaId
          });

          lastSavedRef.current = { lat: latitude, lng: longitude, time: now };
        }
      },
      (err) => console.error("📡 SIGNAL_LOST: Error de geolocalización:", err),
      { 
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 27000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [empresaId, isActive]);

  return null; // Componente invisible (Beacon táctico)
}

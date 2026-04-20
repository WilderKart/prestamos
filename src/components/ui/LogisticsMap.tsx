"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Motorbike, NavigationArrow } from "@phosphor-icons/react";

// Reparar iconos de Leaflet en Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Icono personalizado para el cobrador (Moto con pulso)
const createCollectorIcon = () => L.divIcon({
  className: "collector-icon",
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-12 h-12 bg-ios-blue/20 rounded-full animate-ping"></div>
      <div class="relative w-10 h-10 bg-ios-blue rounded-2xl flex items-center justify-center text-white shadow-2xl border-2 border-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
          <path d="M244.24,151.81l-36.17-64.3a12,12,0,0,0-10.45-6.12l-102.5-.54h-.12a12,12,0,0,0-8.62,2.5,12.22,12.22,0,0,0-4,8L71.32,130.68A40,40,0,1,0,80,152a39.81,39.81,0,0,0-2.3-13.25l7.55-23.4,76.53.41,20.59,36.59L176,152a40,40,0,1,0,40,40A39.9,39.9,0,0,0,244.24,151.81ZM40,176a16,16,0,1,1,16,16A16,16,0,0,1,40,176Zm176,32a16,16,0,1,1,16-16A16,16,0,0,1,216,208Z"></path>
        </svg>
      </div>
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 24]
});

// Componente para reajustar el mapa
function ChangeView({ bounds }: { bounds: any }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [50, 50] });
  }, [bounds, map]);
  return null;
}

interface Point {
  lat: number;
  lng: number;
  label?: string;
  isCompleted?: boolean;
}

interface LogisticsMapProps {
  points: Point[];
  showPath?: boolean;
  collectorPos?: { lat: number; lng: number };
  history?: { lat: number; lng: number }[];
}

export default function LogisticsMap({ points, showPath = true, collectorPos, history = [] }: LogisticsMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || points.length === 0) return (
    <div className="w-full h-full bg-black/5 animate-pulse rounded-[32px] flex items-center justify-center">
      <p className="text-[10px] font-black uppercase tracking-widest text-black/20 italic">Sincronizando Radar Táctico...</p>
    </div>
  );

  const validPoints = points.filter(p => p.lat && p.lng);
  
  if (validPoints.length === 0 && !collectorPos) return (
    <div className="w-full h-full bg-ios-pink/5 rounded-[32px] flex items-center justify-center border border-ios-pink/10">
       <p className="text-[10px] font-black uppercase tracking-widest text-ios-pink italic">Sin Datos de Geolocalización</p>
    </div>
  );

  const positions = validPoints.map(p => [p.lat, p.lng] as [number, number]);
  const historyPositions = history.map(p => [p.lat, p.lng] as [number, number]);
  
  // Calcular límites incluyendo al cobrador y su historial
  const allPositions = [...positions, ...historyPositions];
  if (collectorPos) allPositions.push([collectorPos.lat, collectorPos.lng]);
  
  const bounds = allPositions.length > 0 ? L.latLngBounds(allPositions) : null;

  return (
    <MapContainer 
      center={positions[0] || [0,0]} 
      zoom={15} 
      style={{ height: "100%", width: "100%", borderRadius: "inherit" }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; CARTO'
      />
      
      {/* Marcadores de Clientes */}
      {validPoints.map((p, idx) => (
        <Marker 
          key={idx} 
          position={[p.lat, p.lng]}
          icon={L.divIcon({
            className: "client-marker",
            html: `
              <div class="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[10px] font-black text-white ${p.isCompleted ? 'bg-ios-green' : 'bg-black'}">
                ${idx + 1}
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          })}
        >
          <Popup>
            <div className="p-2 font-bold text-xs uppercase tracking-widest">{p.label}</div>
          </Popup>
        </Marker>
      ))}

      {/* Historial de Recorrido (Breadcrumbs) */}
      {historyPositions.length > 1 && (
        <Polyline 
          positions={historyPositions} 
          color="#FF9500" 
          weight={3} 
          opacity={0.4} 
        />
      )}

      {/* Ruta Teórica (Sugerida) */}
      {showPath && positions.length > 1 && (
        <Polyline 
          positions={positions} 
          color="#007AFF" 
          weight={4} 
          opacity={0.2} 
          dashArray="10, 10"
        />
      )}

      {/* Posición en Vivo del Cobrador (Individual) */}
      {collectorPos && (
        <Marker 
          position={[collectorPos.lat, collectorPos.lng]}
          icon={createCollectorIcon()}
        >
          <Popup>
            <div className="p-2 text-center">
               <p className="text-[10px] font-black uppercase text-ios-blue">Cobrador en Línea</p>
               <p className="text-[9px] font-bold text-black/40 tracking-widest">TRANSMITIENDO EN VIVO</p>
            </div>
          </Popup>
        </Marker>
      )}

      {bounds && <ChangeView bounds={bounds} />}
    </MapContainer>
  );
}

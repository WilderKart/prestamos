"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

/**
 * GlobalRadarMap: Componente de mapeo estratégico especializado.
 * Diseñado exclusivamente para el monitoreo de flota masiva (Radar Global).
 */

// Reparar iconos de Leaflet
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface RadarMarker {
  cobrador_id: string;
  nombre: string;
  lat: number;
  lng: number;
  status: 'active' | 'weak' | 'offline';
  last_report: string;
  onClick?: () => void;
}

interface GlobalRadarMapProps {
  markers: RadarMarker[];
}

function AutoCenter({ markers }: { markers: RadarMarker[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [100, 100], maxZoom: 15 });
    }
  }, [markers, map]);

  return null;
}

export default function GlobalRadarMap({ markers }: GlobalRadarMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return (
    <div className="w-full h-full bg-black/5 animate-pulse rounded-[32px] flex items-center justify-center">
      <p className="text-[10px] font-black uppercase tracking-widest text-black/20 italic">Iniciando Radar Global...</p>
    </div>
  );

  return (
    <MapContainer 
      center={[6.2442, -75.5812]} // Medellín por defecto
      zoom={13} 
      style={{ height: "100%", width: "100%", borderRadius: "inherit" }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; CARTO'
      />
      
      {markers.map((m) => (
        <Marker 
          key={m.cobrador_id} 
          position={[m.lat, m.lng]}
          eventHandlers={{
            click: m.onClick
          }}
          icon={L.divIcon({
            className: "fleet-marker",
            html: `
              <div class="relative flex items-center justify-center group">
                ${m.status === 'active' ? '<div class="absolute w-12 h-12 bg-ios-green/20 rounded-full animate-ping"></div>' : ''}
                <div class="relative w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-2xl border-2 border-white transition-all transform hover:scale-110 ${
                  m.status === 'active' ? 'bg-ios-green' : 
                  m.status === 'weak' ? 'bg-ios-yellow' : 'bg-black/40'
                }">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M244.24,151.81l-36.17-64.3a12,12,0,0,0-10.45-6.12l-102.5-.54h-.12a12,12,0,0,0-8.62,2.5,12.22,12.22,0,0,0-4,8L71.32,130.68A40,40,0,1,0,80,152a39.81,39.81,0,0,0-2.3-13.25l7.55-23.4,76.53.41,20.59,36.59L176,152a40,40,0,1,0,40,40A39.9,39.9,0,0,0,244.24,151.81ZM40,176a16,16,0,1,1,16,16A16,16,0,0,1,40,176Zm176,32a16,16,0,1,1,16-16A16,16,0,0,1,216,208Z"></path>
                  </svg>
                </div>
                
                {/* Etiqueta Tooltip */}
                <div class="absolute -top-12 bg-black text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-2xl z-[1001] pointer-events-none">
                   ${m.nombre} • ${m.status.toUpperCase()}
                </div>
              </div>
            `,
            iconSize: [48, 48],
            iconAnchor: [24, 24]
          })}
        />
      ))}

      <AutoCenter markers={markers} />
    </MapContainer>
  );
}

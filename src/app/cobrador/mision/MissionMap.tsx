"use client";

import { useEffect, useState } from "react";
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  useMap,
  Polyline
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet + Next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

interface MissionMapProps {
  currentPos: [number, number] | null;
  destPos: [number, number];
  clientName: string;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function MissionMap({ currentPos, destPos, clientName }: MissionMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="h-full w-full bg-black/[0.03] animate-pulse flex items-center justify-center">
    <div className="text-[10px] font-black text-black/10 uppercase tracking-[0.4em]">Iniciando Motor de Navegación...</div>
  </div>;

  return (
    <div className="h-full w-full relative group">
      <MapContainer 
        center={currentPos || destPos} 
        zoom={16} 
        className="h-full w-full grayscale-[0.5] contrast-[1.1] brightness-[1.05]"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; Mivank Maps'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {currentPos && (
          <Marker position={currentPos}>
            <Popup>
               <div className="p-2 text-center">
                  <span className="text-[10px] font-black uppercase text-ios-blue">Tu Posición</span>
               </div>
            </Popup>
          </Marker>
        )}

        <Marker position={destPos}>
          <Popup>
             <div className="p-2 text-center">
                <span className="text-[10px] font-black uppercase text-ios-pink">Punto de Recaudo</span>
                <p className="font-bold text-black mt-1">{clientName}</p>
             </div>
          </Popup>
        </Marker>

        {currentPos && (
          <Polyline 
            positions={[currentPos, destPos]} 
            color="#007AFF" 
            weight={6} 
            opacity={0.6}
            dashArray="1, 12" 
            lineCap="round"
          />
        )}

        <MapUpdater center={currentPos || destPos} />
      </MapContainer>
      
      {/* Dynamic Gradients for iOS feel */}
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
      
      <div className="absolute bottom-6 right-6 z-[1000] ios-glass bg-black text-white px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-2xl border border-white/20">
        Cartografía Táctica Mivank
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface MapMarkerData {
  id: string;
  lat: number;
  lng: number;
  label: string;
  sublabel?: string;
  color: string;
  count?: number;
  pulsing?: boolean;
}

interface LeafletMapProps {
  center: { lat: number; lng: number };
  markers: MapMarkerData[];
  onMarkerClick?: (id: string) => void;
  selectedId?: string | null;
}

const colorMap: Record<string, string> = {
  primary: '#0d7c66',
  red: '#ef4444',
  orange: '#f97316',
  accent: '#0891b2',
  amber: '#f59e0b',
  muted: '#94a3b8',
};

export default function LeafletMap({ center, markers, onMarkerClick, selectedId }: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [center.lat, center.lng],
      zoom: 14,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
  }, [center.lat, center.lng]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    markers.forEach((marker) => {
      const color = colorMap[marker.color] || colorMap.muted;
      const size = marker.count && marker.count >= 3 ? 26 : marker.count && marker.count >= 2 ? 22 : 18;
      const ring = selectedId === marker.id ? '#0d7c66' : '#ffffff';

      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="position:relative;display:flex;align-items:center;justify-content:center;">
            ${marker.pulsing ? `<div style="position:absolute;width:${size + 10}px;height:${size + 10}px;border-radius:50%;background:${color};opacity:0.4;animation:pulse-ring 1.5s ease-out infinite;"></div>` : ''}
            <div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid ${ring};box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:700;">
              ${marker.count && marker.count > 0 ? marker.count : ''}
            </div>
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const m = L.marker([marker.lat, marker.lng], { icon }).addTo(map);
      m.bindPopup(`<div style="font-family:inherit;"><strong>${marker.label}</strong>${marker.sublabel ? `<br/><span style="font-size:11px;color:#666;">${marker.sublabel}</span>` : ''}</div>`);
      m.on('click', () => {
        if (onMarkerClick) onMarkerClick(marker.id);
      });
      markersRef.current[marker.id] = m;
    });
  }, [markers, onMarkerClick, selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (selectedId && markersRef.current[selectedId]) {
      const m = markersRef.current[selectedId];
      const ll = m.getLatLng();
      map.flyTo([ll.lat, ll.lng], 15, { duration: 0.5 });
      m.openPopup();
    }
  }, [selectedId]);

  return (
    <>
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .leaflet-container { font-family: inherit; }
        .custom-div-icon { background: transparent; border: none; }
      `}</style>
      <div ref={containerRef} className="h-full w-full" style={{ minHeight: '400px' }} />
    </>
  );
}

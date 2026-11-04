'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface BarrioDrawMapProps {
  center: { lat: number; lng: number };
  points: [number, number][];
  onPointsChange: (points: [number, number][]) => void;
  existing?: { id: string; nombre: string; poligono: [number, number][] }[];
}

// Mapa donde el admin hace clic para ir marcando los vértices del barrio
export default function BarrioDrawMap({ center, points, onPointsChange, existing = [] }: BarrioDrawMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const drawLayerRef = useRef<L.LayerGroup | null>(null);
  const existingLayerRef = useRef<L.LayerGroup | null>(null);
  const pointsRef = useRef(points);
  const onChangeRef = useRef(onPointsChange);

  pointsRef.current = points;
  onChangeRef.current = onPointsChange;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { center: [center.lat, center.lng], zoom: 14 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);
    existingLayerRef.current = L.layerGroup().addTo(map);
    drawLayerRef.current = L.layerGroup().addTo(map);
    map.on('click', (e: L.LeafletMouseEvent) => {
      onChangeRef.current([...pointsRef.current, [e.latlng.lat, e.latlng.lng]]);
    });
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [center.lat, center.lng]);

  useEffect(() => {
    const layer = existingLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    existing.forEach((b) => {
      if (b.poligono.length < 3) return;
      L.polygon(b.poligono, { color: '#94a3b8', weight: 2, fillOpacity: 0.15, interactive: false })
        .bindTooltip(b.nombre, { permanent: true, direction: 'center' })
        .addTo(layer);
    });
  }, [existing]);

  useEffect(() => {
    const layer = drawLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    if (points.length >= 3) {
      L.polygon(points, { color: '#0d7c66', fillColor: '#0d7c66', fillOpacity: 0.3, interactive: false }).addTo(layer);
    } else if (points.length === 2) {
      L.polyline(points, { color: '#0d7c66', interactive: false }).addTo(layer);
    }
    points.forEach((p, i) => {
      const marker = L.circleMarker(p, {
        radius: 6,
        color: '#fff',
        weight: 2,
        fillColor: '#0d7c66',
        fillOpacity: 1,
      }).addTo(layer);
      marker.bindTooltip(String(i + 1));
    });
  }, [points]);

  return <div ref={containerRef} className="h-full w-full" style={{ minHeight: '400px', cursor: 'crosshair' }} />;
}

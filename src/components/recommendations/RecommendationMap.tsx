import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Recommendation } from '../../types/recommendation';
import { MAP_CONFIG } from '../../config/mapConfig';

interface RecommendationMapProps {
  recommendations: Recommendation[];
  activeId: string | null;
  hoveredId: string | null;
  onMarkerClick: (rec: Recommendation) => void;
}

export const RecommendationMap: React.FC<RecommendationMapProps> = ({
  recommendations,
  activeId,
  hoveredId,
  onMarkerClick,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerLayersRef = useRef<Map<string, L.Marker>>(new Map());

  // 1. Initialize Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    let resizeObserver: ResizeObserver | null = null;

    try {
      const tileProvider = MAP_CONFIG.tileProviders.voyager;

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        center: [0, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 18,
      });

      L.tileLayer(tileProvider.url, {
        maxZoom: tileProvider.maxZoom,
        subdomains: tileProvider.subdomains || ['a', 'b', 'c', 'd'],
      }).addTo(map);

      L.control
        .attribution({
          position: 'bottomright',
          prefix: '<span class="text-[10px] text-[#838F8B]">GlobeTrotter Maps</span>',
        })
        .addTo(map);

      mapInstanceRef.current = map;
      resizeObserver = new ResizeObserver(() => map.invalidateSize());
      resizeObserver.observe(mapContainerRef.current);
    } catch (err) {
      console.error('Failed to initialize recommendation map:', err);
    }

    return () => {
      resizeObserver?.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Render Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    markerLayersRef.current.forEach((marker) => marker.remove());
    markerLayersRef.current.clear();

    const validRecs = recommendations.filter(r => r.latitude && r.longitude);

    validRecs.forEach((rec) => {
      const isSelected = activeId === rec.id;
      const isHovered = hoveredId === rec.id;
      
      const categoryEmoji = {
        place: '🏛️',
        hotel: '🏨',
        food: '🍴',
        experience: '✨'
      }[rec.category] || '📍';

      const color = isSelected ? '#FF6B4A' : '#20B8A6';

      const html = `
        <div class="gt-recommendation-marker group relative cursor-pointer transition-transform duration-200 ${
          isSelected ? 'scale-125 z-50' : isHovered ? 'scale-115 z-40' : 'z-20'
        }">
          ${isSelected ? `<div class="absolute -inset-2 rounded-full animate-ping opacity-30" style="background-color: ${color}"></div>` : ''}
          <div class="relative flex items-center justify-center w-10 h-10 rounded-full shadow-lg border-2 transition-all duration-200 bg-white"
               style="border-color: ${color};">
            <span class="text-base leading-none">${categoryEmoji}</span>
          </div>
          <div class="w-2.5 h-2.5 mx-auto -mt-1 rotate-45 border-r border-b shadow-2xs bg-white"
               style="border-color: ${color};"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html,
        className: 'custom-recommendation-marker',
        iconSize: [40, 48],
        iconAnchor: [20, 44],
      });

      const marker = L.marker([rec.latitude!, rec.longitude!], { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        onMarkerClick(rec);
      });

      markerLayersRef.current.set(rec.id, marker);
    });

    // Auto-fit bounds if we have markers
    if (validRecs.length > 0) {
      const group = L.featureGroup(Array.from(markerLayersRef.current.values()));
      map.fitBounds(group.getBounds(), { padding: [50, 50], maxZoom: 14 });
    }
  }, [recommendations, activeId, hoveredId]);

  // 3. Pan to active item
  useEffect(() => {
    if (!activeId) return;
    const marker = markerLayersRef.current.get(activeId);
    if (marker && mapInstanceRef.current) {
      mapInstanceRef.current.setView(marker.getLatLng(), 15, { animate: true, duration: 0.5 });
    }
  }, [activeId]);

  return (
    <div className="w-full h-full min-w-0 min-h-0 rounded-3xl overflow-hidden border border-[#EAE6DD] shadow-sm bg-[#F4F1EA]">
      <div ref={mapContainerRef} className="w-full h-full z-10" />
    </div>
  );
};

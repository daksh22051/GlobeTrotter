import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapMarkerLocation, RouteSegment, UserCurrentLocation } from '../../types/map';
import { MAP_CONFIG, getDayColor } from '../../config/mapConfig';
import { computeBoundingBox } from '../../utils/routeCalculator';

interface TripMapProps {
  markers: MapMarkerLocation[];
  segments: RouteSegment[];
  selectedDayNumber: number | 'all';
  activeMarkerId: string | null;
  hoveredMarkerId: string | null;
  userLocation: UserCurrentLocation | null;
  onMarkerClick: (marker: MapMarkerLocation) => void;
  onMarkerHover: (markerId: string | null) => void;
  onOpenDetails: (marker: MapMarkerLocation) => void;
}

export const TripMap: React.FC<TripMapProps> = ({
  markers,
  segments,
  selectedDayNumber,
  activeMarkerId,
  hoveredMarkerId,
  userLocation,
  onMarkerClick,
  onMarkerHover,
  onOpenDetails,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerLayersRef = useRef<Map<string, L.Marker>>(new Map());
  const routeLayersRef = useRef<L.Polyline[]>([]);
  const userLocationLayerRef = useRef<L.Marker | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // 1. Initialize Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    try {
      const tileProvider = MAP_CONFIG.tileProviders.voyager;

      const map = L.map(mapContainerRef.current, {
        zoomControl: false, // We supply custom GlobeTrotter controls
        attributionControl: false,
        center: [35.6762, 139.6503],
        zoom: MAP_CONFIG.defaultZoom,
        minZoom: MAP_CONFIG.minZoom,
        maxZoom: MAP_CONFIG.maxZoom,
      });

      // Add Tile Layer with fallback
      L.tileLayer(tileProvider.url, {
        maxZoom: tileProvider.maxZoom,
        subdomains: tileProvider.subdomains || ['a', 'b', 'c', 'd'],
      }).addTo(map);

      // Attribution
      L.control
        .attribution({
          position: 'bottomright',
          prefix: '<span class="text-[10px] text-[#838F8B]">GlobeTrotter Maps</span>',
        })
        .addTo(map);

      mapInstanceRef.current = map;
    } catch (err: any) {
      console.error('Failed to initialize map:', err);
      setMapError('Map could not be initialized.');
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Render Markers and Routes when markers or segments change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    markerLayersRef.current.forEach((marker) => marker.remove());
    markerLayersRef.current.clear();

    // Clear previous polylines
    routeLayersRef.current.forEach((poly) => poly.remove());
    routeLayersRef.current = [];

    // Draw Route Polylines
    segments.forEach((segment) => {
      const dayColor = getDayColor(segment.dayNumber);
      const isSelectedDay = selectedDayNumber === 'all' || selectedDayNumber === segment.dayNumber;

      const polyline = L.polyline(segment.polyline, {
        color: dayColor.primary,
        weight: isSelectedDay ? 4 : 2,
        opacity: isSelectedDay ? 0.85 : 0.4,
        dashArray: isSelectedDay ? undefined : '6, 6',
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      routeLayersRef.current.push(polyline);
    });

    // Draw Markers
    markers.forEach((item) => {
      const dayColor = getDayColor(item.dayNumber);
      const category = MAP_CONFIG.categoryConfig[item.category] || MAP_CONFIG.categoryConfig.place;
      const isSelected = activeMarkerId === item.id || activeMarkerId === item.activityId;
      const isHovered = hoveredMarkerId === item.id || hoveredMarkerId === item.activityId;
      const isDayActive = selectedDayNumber === 'all' || selectedDayNumber === item.dayNumber;

      // Custom DivIcon HTML
      const html = `
        <div class="gt-map-marker group relative cursor-pointer transition-transform duration-200 ${
          isSelected ? 'scale-125 z-50' : isHovered ? 'scale-115 z-40' : 'z-20'
        } ${!isDayActive ? 'opacity-40 grayscale-[40%]' : 'opacity-100'}">
          <!-- Pulse Ping for Active Marker -->
          ${
            isSelected
              ? `<div class="absolute -inset-2 rounded-full animate-ping opacity-30" style="background-color: ${dayColor.primary}"></div>`
              : ''
          }

          <!-- Main Pin Badge -->
          <div class="relative flex items-center justify-center w-10 h-10 rounded-full shadow-lg border-2 transition-all duration-200"
               style="background-color: ${isSelected ? dayColor.primary : '#FFFFFF'}; border-color: ${dayColor.primary};">
            <span class="text-base leading-none">${category.emoji}</span>

            <!-- Day & Stop Badge -->
            <div class="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black shadow-xs border border-white"
                 style="background-color: ${dayColor.primary}; color: ${dayColor.text};">
              ${item.stopNumber}
            </div>
          </div>

          <!-- Bottom Arrow Notch -->
          <div class="w-2.5 h-2.5 mx-auto -mt-1 rotate-45 border-r border-b shadow-2xs"
               style="background-color: ${isSelected ? dayColor.primary : '#FFFFFF'}; border-color: ${dayColor.primary};"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html,
        className: 'custom-leaflet-marker',
        iconSize: [40, 48],
        iconAnchor: [20, 44],
        popupAnchor: [0, -44],
      });

      const marker = L.marker([item.latitude, item.longitude], { icon: customIcon }).addTo(map);

      // Bind events
      marker.on('click', () => {
        onMarkerClick(item);
      });

      marker.on('mouseover', () => {
        onMarkerHover(item.id);
      });

      marker.on('mouseout', () => {
        onMarkerHover(null);
      });

      // Bind custom HTML popup
      const popupContent = document.createElement('div');
      popupContent.className = 'p-0 text-[#17201D] font-sans';
      popupContent.innerHTML = `
        <div class="w-60 overflow-hidden rounded-xl bg-white text-left font-sans">
          ${
            item.image
              ? `<div class="h-28 w-full bg-cover bg-center relative" style="background-image: url('${item.image}')">
                   <div class="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs" style="background-color: ${dayColor.primary}">
                     Day ${item.dayNumber} · Stop ${item.stopNumber}
                   </div>
                 </div>`
              : ''
          }
          <div class="p-3">
            <div class="flex items-center gap-1.5 text-[11px] font-bold" style="color: ${dayColor.primary}">
              <span>${category.emoji}</span>
              <span>${category.label}</span>
            </div>
            <h4 class="text-sm font-bold text-[#17201D] leading-snug mt-1 truncate">${item.name}</h4>
            <div class="flex items-center gap-2 text-xs text-[#68736F] mt-1.5">
              <span>🕒 ${item.startTime}</span>
              <span>•</span>
              <span>⏱ ${item.duration}</span>
            </div>
            <div class="flex items-center justify-between text-xs font-semibold text-[#17201D] mt-2 pt-2 border-t border-[#F4F1EA]">
              <span class="text-[11px] text-[#838F8B]">${item.location}</span>
              <span class="text-[#FF6B4A]">${item.estimatedCost > 0 ? `₹${item.estimatedCost.toLocaleString()}` : 'Free'}</span>
            </div>
            <div class="mt-2.5 pt-1 flex items-center gap-2">
              <button id="view-details-btn-${item.id}" class="w-full py-1.5 px-3 rounded-lg bg-[#17201D] hover:bg-[#FF6B4A] text-white text-xs font-bold text-center transition-colors cursor-pointer">
                View Details
              </button>
            </div>
          </div>
        </div>
      `;

      // Attach button listener inside popup
      marker.bindPopup(popupContent, {
        maxWidth: 280,
        className: 'globetrotter-custom-popup',
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-details-btn-${item.id}`);
        if (btn) {
          btn.onclick = (e) => {
            e.stopPropagation();
            onOpenDetails(item);
          };
        }
      });

      markerLayersRef.current.set(item.id, marker);
    });

    // Auto-fit map bounds to markers
    if (markers.length > 0) {
      const { bounds } = computeBoundingBox(markers);
      if (bounds) {
        map.fitBounds(bounds, {
          padding: [60, 60],
          maxZoom: 15,
          animate: true,
          duration: 0.8,
        });
      }
    }
  }, [markers, segments, selectedDayNumber]);

  // 3. Highlight marker on selection change
  useEffect(() => {
    if (!activeMarkerId) return;
    const marker = markerLayersRef.current.get(activeMarkerId);
    if (marker && mapInstanceRef.current) {
      mapInstanceRef.current.panTo(marker.getLatLng(), { animate: true, duration: 0.5 });
      marker.openPopup();
    }
  }, [activeMarkerId]);

  // 4. Render User Location if available
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userLocationLayerRef.current) {
      userLocationLayerRef.current.remove();
      userLocationLayerRef.current = null;
    }

    if (userLocation) {
      const userHtml = `
        <div class="relative flex items-center justify-center w-6 h-6">
          <div class="absolute inset-0 rounded-full bg-[#0284C7] animate-ping opacity-50"></div>
          <div class="w-4 h-4 rounded-full bg-[#0284C7] border-2 border-white shadow-md"></div>
        </div>
      `;

      const userIcon = L.divIcon({
        html: userHtml,
        className: 'user-loc-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const userMarker = L.marker([userLocation.latitude, userLocation.longitude], {
        icon: userIcon,
        zIndexOffset: 1000,
      }).addTo(map);

      userMarker.bindPopup('<div class="text-xs font-bold p-1">📍 You are here</div>');
      userLocationLayerRef.current = userMarker;

      map.setView([userLocation.latitude, userLocation.longitude], 14, { animate: true });
    }
  }, [userLocation]);

  if (mapError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#FFF8ED] text-center">
        <div className="w-14 h-14 rounded-2xl bg-white border border-[#EAE6DD] flex items-center justify-center text-2xl mb-3 shadow-sm">
          🗺️
        </div>
        <h3 className="text-base font-bold text-[#17201D]">Map View Temporarily Unavailable</h3>
        <p className="text-xs text-[#68736F] max-w-sm mt-1 mb-4">
          Interactive map tiles could not be loaded, but your complete journey itinerary and route information remain fully functional below.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-xl bg-[#17201D] text-white text-xs font-bold shadow-xs hover:bg-[#FF6B4A] transition-colors"
        >
          Retry Map
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <div ref={mapContainerRef} className="w-full h-full z-10" />
    </div>
  );
};

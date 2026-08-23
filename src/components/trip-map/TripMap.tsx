import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapMarkerLocation,
  RouteSegment,
  UserCurrentLocation,
  MapCategoryFilter,
  RouteDisplayMode,
  MapClusterGroup,
} from '../../types/map';
import { MAP_CONFIG, getDayColor } from '../../config/mapConfig';
import { computeBoundingBox } from '../../utils/routeCalculator';
import { locationService } from '../../services/locationService';

interface TripMapProps {
  markers: MapMarkerLocation[];
  segments: RouteSegment[];
  selectedDayNumber: number | 'all';
  activeMarkerId: string | null;
  hoveredMarkerId: string | null;
  destination?: string;
  initialCenter?: [number, number];
  categoryFilter?: MapCategoryFilter;
  routeDisplayMode?: RouteDisplayMode;
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
  destination = 'Manali',
  initialCenter,
  categoryFilter = 'all',
  routeDisplayMode = 'active_day',
  userLocation,
  onMarkerClick,
  onMarkerHover,
  onOpenDetails,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerLayersRef = useRef<Map<string, L.Marker>>(new Map());
  const clusterLayersRef = useRef<L.Marker[]>([]);
  const routeLayersRef = useRef<L.Polyline[]>([]);
  const userLocationLayerRef = useRef<L.Marker | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(MAP_CONFIG.defaultZoom);

  // Calculate dynamic target center for destination
  const destinationCenter = useMemo(() => {
    return locationService.getDestinationCenter(destination);
  }, [destination]);

  // 1. Initialize Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    try {
      const tileProvider = MAP_CONFIG.tileProviders.voyager;

      const hasValidInitialCenter =
        initialCenter &&
        locationService.isCoordinateNearDestination(initialCenter[0], initialCenter[1], destination);
      const firstMarker = markers[0];
      const hasValidFirstMarker =
        firstMarker &&
        locationService.isCoordinateNearDestination(
          firstMarker.latitude,
          firstMarker.longitude,
          destination
        );
      const initCenterCoords: [number, number] = hasValidInitialCenter
        ? initialCenter
        : hasValidFirstMarker
        ? [firstMarker.latitude, firstMarker.longitude]
        : [destinationCenter.lat, destinationCenter.lng];

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        center: initCenterCoords,
        zoom: destinationCenter.zoom || MAP_CONFIG.defaultZoom,
        minZoom: MAP_CONFIG.minZoom,
        maxZoom: MAP_CONFIG.maxZoom,
      });

      // Add Tile Layer
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

      map.on('zoomend', () => {
        setCurrentZoom(map.getZoom());
      });

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

  // Filter markers based on categoryFilter
  const filteredMarkers = useMemo(() => {
    if (categoryFilter === 'all') return markers;
    return markers.filter((m) => {
      if (categoryFilter === 'hotel') return m.category === 'hotel';
      if (categoryFilter === 'food') return m.category === 'food';
      if (categoryFilter === 'experience') return m.category === 'experience';
      if (categoryFilter === 'place') return m.category === 'place' || m.category === 'attraction';
      return true;
    });
  }, [markers, categoryFilter]);

  // Keep all-days bounds, clusters, and marker layers local to the destination.
  const validMarkers = useMemo(
    () =>
      filteredMarkers.filter((marker) =>
        locationService.isCoordinateNearDestination(
          marker.latitude,
          marker.longitude,
          destination
        )
      ),
    [filteredMarkers, destination]
  );

  const validSegments = useMemo(
    () =>
      segments.filter((segment) =>
        (categoryFilter === 'all' || [segment.fromLocationId, segment.toLocationId].some((locationId) =>
          markers.some((marker) => marker.activityId === locationId && (
            categoryFilter === 'place'
              ? marker.category === 'place' || marker.category === 'attraction'
              : marker.category === categoryFilter
          ))
        )) &&
        segment.polyline.length >= 2 &&
        segment.polyline.every(([latitude, longitude]) =>
          locationService.isCoordinateNearDestination(latitude, longitude, destination)
        )
      ),
    [segments, markers, categoryFilter, destination]
  );

  // Compute Clusters / Groups for close proximity or overlapping items
  const { clusters, individualMarkers } = useMemo(() => {
    // Proximity threshold depends on zoom level (at higher zoom, only group truly overlapping items)
    const proximityThreshold = currentZoom >= 16 ? 0.0003 : currentZoom >= 14 ? 0.0012 : currentZoom >= 12 ? 0.0035 : 0.008;

    const clustersList: MapClusterGroup[] = [];
    const individuals: MapMarkerLocation[] = [];
    const processedIds = new Set<string>();

    for (let i = 0; i < validMarkers.length; i++) {
      const item = validMarkers[i];
      if (processedIds.has(item.id)) continue;

      const groupItems: MapMarkerLocation[] = [item];
      processedIds.add(item.id);

      for (let j = i + 1; j < validMarkers.length; j++) {
        const other = validMarkers[j];
        if (processedIds.has(other.id)) continue;

        const latDiff = Math.abs(item.latitude - other.latitude);
        const lngDiff = Math.abs(item.longitude - other.longitude);

        if (latDiff < proximityThreshold && lngDiff < proximityThreshold) {
          groupItems.push(other);
          processedIds.add(other.id);
        }
      }

      if (groupItems.length > 1) {
        const avgLat = groupItems.reduce((acc, g) => acc + g.latitude, 0) / groupItems.length;
        const avgLng = groupItems.reduce((acc, g) => acc + g.longitude, 0) / groupItems.length;
        const dayNums = Array.from(new Set(groupItems.map((g) => g.dayNumber)));

        clustersList.push({
          id: `cluster_${item.id}_${groupItems.length}`,
          latitude: avgLat,
          longitude: avgLng,
          items: groupItems,
          primaryCategory: groupItems[0].category,
          dayNumbers: dayNums,
        });
      } else {
        individuals.push(item);
      }
    }

    return { clusters: clustersList, individualMarkers: individuals };
  }, [validMarkers, currentZoom]);

  // 2. Render Markers, Clusters, and Clean Route Polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    markerLayersRef.current.forEach((marker) => marker.remove());
    markerLayersRef.current.clear();

    // Clear previous cluster layers
    clusterLayersRef.current.forEach((c) => c.remove());
    clusterLayersRef.current = [];

    // Clear previous polylines
    routeLayersRef.current.forEach((poly) => poly.remove());
    routeLayersRef.current = [];

    // Render Routes based on routeDisplayMode and selectedDayNumber
    if (routeDisplayMode !== 'none') {
      const activeDay = selectedDayNumber === 'all' ? 1 : selectedDayNumber;

      validSegments.forEach((segment) => {
        const isCurrentDaySegment = segment.dayNumber === activeDay;
        const shouldRender =
          routeDisplayMode === 'all_days'
            ? true
            : isCurrentDaySegment;

        if (shouldRender) {
          const dayColor = getDayColor(segment.dayNumber);
          const isPrimary = isCurrentDaySegment;

          const polyline = L.polyline(segment.polyline, {
            color: dayColor.primary,
            weight: isPrimary ? 4.5 : 2.5,
            opacity: isPrimary ? 0.9 : 0.45,
            dashArray: isPrimary ? undefined : '5, 5',
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(map);

          routeLayersRef.current.push(polyline);
        }
      });
    }

    // 2A. Render Individual Markers
    individualMarkers.forEach((item) => {
      const dayColor = getDayColor(item.dayNumber);
      const category = MAP_CONFIG.categoryConfig[item.category] || MAP_CONFIG.categoryConfig.place;
      const isSelected = activeMarkerId === item.id || activeMarkerId === item.activityId;
      const isHovered = hoveredMarkerId === item.id || hoveredMarkerId === item.activityId;
      const isDayActive = selectedDayNumber === 'all' || selectedDayNumber === item.dayNumber;

      const html = `
        <div class="gt-map-marker group relative cursor-pointer transition-transform duration-200 ${
          isSelected ? 'scale-125 z-50' : isHovered ? 'scale-115 z-40' : 'z-20'
        } ${!isDayActive ? 'opacity-40 grayscale-[30%]' : 'opacity-100'}">
          ${
            isSelected
              ? `<div class="absolute -inset-2 rounded-full animate-ping opacity-30" style="background-color: ${dayColor.primary}"></div>`
              : ''
          }
          <div class="relative flex items-center justify-center w-10 h-10 rounded-full shadow-lg border-2 transition-all duration-200"
               style="background-color: ${isSelected ? dayColor.primary : '#FFFFFF'}; border-color: ${dayColor.primary};">
            <span class="text-base leading-none">${category.emoji}</span>
            <div class="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black shadow-xs border border-white"
                 style="background-color: ${dayColor.primary}; color: ${dayColor.text};">
              ${item.stopNumber}
            </div>
          </div>
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

      marker.on('click', () => {
        onMarkerClick(item);
      });
      marker.on('mouseover', () => {
        onMarkerHover(item.id);
      });
      marker.on('mouseout', () => {
        onMarkerHover(null);
      });

      // HTML Popup
      const popupContent = document.createElement('div');
      popupContent.className = 'p-0 text-[#17201D] font-sans';
      popupContent.innerHTML = `
        <div class="w-64 overflow-hidden rounded-2xl bg-white text-left font-sans shadow-xl border border-[#EAE6DD]">
          ${
            item.image
              ? `<div class="h-28 w-full bg-cover bg-center relative" style="background-image: url('${item.image}')">
                   <div class="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs" style="background-color: ${dayColor.primary}">
                     Day ${item.dayNumber} · Stop ${item.stopNumber}
                   </div>
                 </div>`
              : ''
          }
          <div class="p-3.5">
            <div class="flex items-center gap-1.5 text-[11px] font-bold" style="color: ${dayColor.primary}">
              <span>${category.emoji}</span>
              <span>${category.label}</span>
            </div>
            <h4 class="text-sm font-extrabold text-[#17201D] leading-snug mt-1 truncate">${item.name}</h4>
            <div class="flex items-center gap-2 text-xs text-[#68736F] mt-1.5">
              <span>🕒 ${item.startTime || '10:00'}</span>
              <span>•</span>
              <span>⏱ ${item.duration}</span>
            </div>
            <div class="flex items-center justify-between text-xs font-semibold text-[#17201D] mt-2 pt-2 border-t border-[#F4F1EA]">
              <span class="text-[11px] text-[#838F8B] truncate max-w-[120px]">${item.location}</span>
              <span class="text-[#FF6B4A] font-bold">${item.estimatedCost > 0 ? `₹${item.estimatedCost.toLocaleString()}` : 'Free'}</span>
            </div>
            <div class="mt-3 flex items-center gap-2">
              <button id="view-details-btn-${item.id}" class="w-full py-1.5 px-3 rounded-xl bg-[#17201D] hover:bg-[#FF6B4A] text-white text-xs font-bold text-center transition-colors cursor-pointer">
                View Place Details
              </button>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 280, className: 'globetrotter-custom-popup' });
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

    // 2B. Render Cluster Markers for Overlapping / Nearby Items
    clusters.forEach((cluster) => {
      const primaryDayColor = getDayColor(cluster.dayNumbers[0] || 1);
      const isAnyActive = cluster.items.some((i) => i.id === activeMarkerId || i.activityId === activeMarkerId);

      const clusterHtml = `
        <div class="gt-cluster-marker group relative cursor-pointer transition-transform duration-200 ${
          isAnyActive ? 'scale-120 z-50' : 'hover:scale-110 z-30'
        }">
          <div class="absolute -inset-1.5 rounded-full bg-[#17201D]/20 animate-pulse"></div>
          <div class="relative flex items-center justify-center min-w-[42px] h-[42px] px-2 rounded-full bg-[#17201D] text-white shadow-xl border-2 border-white">
            <span class="text-xs font-black mr-1">📍</span>
            <span class="text-xs font-black tracking-tight">${cluster.items.length}</span>
            <div class="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black shadow-xs bg-[#FF6B4A] text-white border border-white">
              +
            </div>
          </div>
          <div class="w-2 h-2 mx-auto -mt-0.5 rotate-45 bg-[#17201D] shadow-xs"></div>
        </div>
      `;

      const clusterIcon = L.divIcon({
        html: clusterHtml,
        className: 'custom-leaflet-cluster',
        iconSize: [46, 48],
        iconAnchor: [23, 44],
        popupAnchor: [0, -44],
      });

      const clusterMarker = L.marker([cluster.latitude, cluster.longitude], { icon: clusterIcon }).addTo(map);

      // Multi-Item Cluster Popup Content
      const clusterPopup = document.createElement('div');
      clusterPopup.className = 'p-0 text-[#17201D] font-sans';
      clusterPopup.innerHTML = `
        <div class="w-72 overflow-hidden rounded-2xl bg-white text-left font-sans shadow-2xl border border-[#EAE6DD]">
          <div class="px-4 py-2.5 bg-[#17201D] text-white flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              <span class="text-sm">📍</span>
              <span class="text-xs font-extrabold tracking-wide uppercase">${cluster.items.length} Places at this Location</span>
            </div>
            <button id="zoom-in-cluster-${cluster.id}" class="text-[10px] bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded font-bold cursor-pointer transition-colors">
              Zoom In
            </button>
          </div>
          <div class="p-3 max-h-64 overflow-y-auto space-y-2 no-scrollbar">
            ${cluster.items
              .map((item) => {
                const dayColor = getDayColor(item.dayNumber);
                const category = MAP_CONFIG.categoryConfig[item.category] || MAP_CONFIG.categoryConfig.place;
                return `
                  <div class="p-2.5 rounded-xl bg-[#FDFBF7] hover:bg-[#FFF2EE] border border-[#EAE6DD] hover:border-[#FF6B4A]/40 transition-colors flex items-center justify-between gap-2">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-1.5">
                        <span class="px-1.5 py-0.2 rounded text-[9px] font-bold text-white" style="background-color: ${dayColor.primary}">
                          Day ${item.dayNumber} · #${item.stopNumber}
                        </span>
                        <span class="text-[10px] text-[#68736F] font-bold">${category.emoji} ${category.label}</span>
                      </div>
                      <p class="text-xs font-bold text-[#17201D] truncate mt-0.5">${item.name}</p>
                      <div class="flex items-center gap-2 text-[10px] text-[#838F8B] mt-0.5">
                        <span>🕒 ${item.startTime || '10:00'}</span>
                        <span>•</span>
                        <span class="text-[#FF6B4A] font-bold">${item.estimatedCost > 0 ? `₹${item.estimatedCost.toLocaleString()}` : 'Free'}</span>
                      </div>
                    </div>
                    <button id="select-cluster-item-${item.id}" class="shrink-0 p-1.5 rounded-lg bg-[#17201D] hover:bg-[#FF6B4A] text-white text-[10px] font-bold cursor-pointer transition-colors">
                      Select
                    </button>
                  </div>
                `;
              })
              .join('')}
          </div>
        </div>
      `;

      clusterMarker.bindPopup(clusterPopup, { maxWidth: 300, className: 'globetrotter-custom-popup' });

      clusterMarker.on('popupopen', () => {
        const zoomBtn = document.getElementById(`zoom-in-cluster-${cluster.id}`);
        if (zoomBtn) {
          zoomBtn.onclick = (e) => {
            e.stopPropagation();
            map.setView([cluster.latitude, cluster.longitude], Math.min(18, map.getZoom() + 2), { animate: true });
          };
        }

        cluster.items.forEach((item) => {
          const itemBtn = document.getElementById(`select-cluster-item-${item.id}`);
          if (itemBtn) {
            itemBtn.onclick = (e) => {
              e.stopPropagation();
              onMarkerClick(item);
              onOpenDetails(item);
            };
          }
        });
      });

      clusterLayersRef.current.push(clusterMarker);
    });

    // Auto-fit bounds on initial load / marker list update / day change
    if (validMarkers.length > 0) {
      const { bounds, center } = computeBoundingBox(validMarkers, destination);
      if (bounds) {
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 14,
          animate: true,
          duration: 0.6,
        });
      } else {
        map.setView(center, destinationCenter.zoom || 13, { animate: true, duration: 0.6 });
      }
    } else {
      map.setView([destinationCenter.lat, destinationCenter.lng], destinationCenter.zoom || 13, {
        animate: true,
        duration: 0.6,
      });
    }
  }, [validMarkers, validSegments, selectedDayNumber, categoryFilter, routeDisplayMode, clusters, individualMarkers, destination, destinationCenter]);

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
      {filteredMarkers.length === 0 && categoryFilter !== 'all' && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/75 dark:bg-zinc-900/75 backdrop-blur-xs pointer-events-none">
          <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-xl rounded-2xl p-6 text-center max-w-sm mx-4 pointer-events-auto">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 text-lg font-bold">
              📍
            </div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base mb-1">
              No places match this filter.
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-0">
              Click to add a place
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Complaint } from '../types';

// Global safeguard for Leaflet internal DomUtil calls:
// In Leaflet, internal routines (Marker.Drag, Map._getMapPanePos, Draggable, Popup) call
// DomUtil.getPosition(el) without checking if el is null/undefined. When a component unmounts,
// layers are cleared, or drag animations fire, passing undefined throws:
// "Uncaught TypeError: Cannot read properties of undefined (reading '_leaflet_pos')"
if (typeof window !== 'undefined' && L && L.DomUtil) {
  const origGetPosition = L.DomUtil.getPosition;
  L.DomUtil.getPosition = function (el: any) {
    if (!el) {
      return new L.Point(0, 0);
    }
    try {
      return origGetPosition.call(this, el);
    } catch {
      return el._leaflet_pos || new L.Point(0, 0);
    }
  };

  const origSetPosition = L.DomUtil.setPosition;
  L.DomUtil.setPosition = function (el: any, point: any) {
    if (!el) return;
    try {
      origSetPosition.call(this, el, point);
    } catch {
      el._leaflet_pos = point;
    }
  };
}

interface LeafletMapProps {
  mode: 'picker' | 'admin-clusters' | 'admin-heatmap' | 'mini';
  lat: number;
  lng: number;
  onLocationChange?: (lat: number, lng: number) => void;
  complaints?: Complaint[];
  onSelectComplaint?: (complaint: Complaint) => void;
  heightClass?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Overflowing bin': '#15693F',
  'Garbage on road': '#0F626A',
  'Missed collection': '#1D5B96',
  'Illegal dumping': '#C27115',
  'Burning waste': '#B8332A',
  'Dead animal': '#8E2A22',
  Other: '#4B5B52',
};

export const LeafletMap: React.FC<LeafletMapProps> = ({
  mode,
  lat,
  lng,
  onLocationChange,
  complaints = [],
  onSelectComplaint,
  heightClass = 'h-64',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);
  const pickerCircleRef = useRef<L.Circle | null>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    let resizeTimer: any = null;

    if (!containerRef.current) return;

    // Clear any previous Leaflet state left on the container DOM element
    if ((containerRef.current as any)._leaflet_id) {
      delete (containerRef.current as any)._leaflet_id;
    }

    const initialZoom = mode === 'mini' ? 15 : mode === 'picker' ? 14 : 12;

    try {
      const map = L.map(containerRef.current, {
        center: [lat, lng],
        zoom: initialZoom,
        scrollWheelZoom: false,
        attributionControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const group = L.layerGroup().addTo(map);
      mapRef.current = map;
      layerGroupRef.current = group;

      if (mode === 'picker' && onLocationChange) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          if (!isMounted) return;
          onLocationChange(
            Number(e.latlng.lat.toFixed(4)),
            Number(e.latlng.lng.toFixed(4))
          );
        });
      }

      resizeTimer = setTimeout(() => {
        if (isMounted && mapRef.current) {
          try {
            mapRef.current.invalidateSize();
          } catch {
            // ignore
          }
        }
      }, 150);
    } catch (err) {
      console.warn('Leaflet map initialization warning:', err);
    }

    return () => {
      isMounted = false;
      if (resizeTimer) {
        clearTimeout(resizeTimer);
        resizeTimer = null;
      }
      pickerMarkerRef.current = null;
      pickerCircleRef.current = null;

      if (mapRef.current) {
        try {
          mapRef.current.stop();
          mapRef.current.off();
          if (layerGroupRef.current) {
            layerGroupRef.current.clearLayers();
          }
          mapRef.current.remove();
        } catch {
          // ignore cleanup errors on unmount
        }
        mapRef.current = null;
        layerGroupRef.current = null;
      }

      if (containerRef.current && (containerRef.current as any)._leaflet_id) {
        try {
          delete (containerRef.current as any)._leaflet_id;
        } catch {
          // ignore
        }
      }
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    try {
      if (mode === 'picker' || mode === 'mini') {
        const pinColor = mode === 'picker' ? '#15693F' : '#0F626A';

        // If marker already exists, smoothly update its position rather than destroying
        // and recreating it (which breaks Leaflet internal drag listeners and causes _leaflet_pos errors)
        if (pickerMarkerRef.current && group.hasLayer(pickerMarkerRef.current)) {
          if (!isDraggingRef.current) {
            pickerMarkerRef.current.setLatLng([lat, lng]);
          }
          if (pickerCircleRef.current && group.hasLayer(pickerCircleRef.current)) {
            pickerCircleRef.current.setLatLng([lat, lng]);
          }
          if (!isDraggingRef.current) {
            map.panTo([lat, lng], { animate: false });
          }
        } else {
          group.clearLayers();

          const markerHtml = `
            <div style="
              width: 24px;
              height: 24px;
              background: ${pinColor};
              border: 3px solid #F4F6F2;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="width: 6px; height: 6px; background: #F4F6F2; border-radius: 50%;"></div>
            </div>
          `;
          const icon = L.divIcon({
            html: markerHtml,
            className: 'clenc-custom-pin',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          const marker = L.marker([lat, lng], {
            icon,
            draggable: mode === 'picker',
          }).addTo(group);

          pickerMarkerRef.current = marker;

          if (mode === 'picker') {
            marker.on('dragstart', () => {
              isDraggingRef.current = true;
            });

            marker.on('dragend', () => {
              isDraggingRef.current = false;
              try {
                const pos = marker.getLatLng();
                if (pos && onLocationChange) {
                  onLocationChange(
                    Number(pos.lat.toFixed(4)),
                    Number(pos.lng.toFixed(4))
                  );
                }
              } catch {
                // ignore
              }
            });

            // Draw 50m duplicate-detection radius circle
            const circle = L.circle([lat, lng], {
              radius: 65,
              color: '#15693F',
              weight: 1.5,
              fillColor: '#15693F',
              fillOpacity: 0.14,
            }).addTo(group);
            pickerCircleRef.current = circle;
          }

          map.setView([lat, lng], map.getZoom() || 14);
        }
      } else {
        // admin modes
        pickerMarkerRef.current = null;
        pickerCircleRef.current = null;
        group.clearLayers();

        if (mode === 'admin-clusters') {
          complaints.forEach((cmp) => {
            const color = CATEGORY_COLORS[cmp.category] || '#15693F';
            const isOverdue = cmp.slaHoursRemaining < 0;
            const borderColor = isOverdue ? '#B8332A' : '#F4F6F2';

            const icon = L.divIcon({
              html: `<div style="
                min-width: 28px;
                height: 28px;
                padding: 0 6px;
                background: ${color};
                color: #F4F6F2;
                border: 2px solid ${borderColor};
                border-radius: 4px;
                font-family: 'Inter', sans-serif;
                font-size: 10px;
                font-weight: 700;
                display: flex;
                align-items: center;
                justify-content: center;
              ">${cmp.upvotes}</div>`,
              className: 'clenc-cluster-pin',
              iconSize: [32, 28],
              iconAnchor: [16, 14],
            });

            const m = L.marker([cmp.lat, cmp.lng], { icon }).addTo(group);
            m.bindPopup(
              `<div style="font-family: 'Inter', sans-serif; min-width: 180px;">
                <div style="font-weight: 700; font-size: 12px; margin-bottom: 2px;">${cmp.id} · ${cmp.category}</div>
                <div style="font-size: 11px; color: #334139; margin-bottom: 4px;">${cmp.title}</div>
                <div style="font-size: 11px; font-family: 'Inter', sans-serif;">Status: <strong>${cmp.status}</strong> · Ward: ${cmp.ward}</div>
              </div>`
            );
            m.on('click', () => {
              if (onSelectComplaint) onSelectComplaint(cmp);
            });
          });
        } else if (mode === 'admin-heatmap') {
          complaints.forEach((cmp) => {
            const isCritical = cmp.severity === 'Critical' || cmp.slaHoursRemaining < 0;
            const heatColor = isCritical ? '#B8332A' : cmp.severity === 'High' ? '#C27115' : '#15693F';
            const circle = L.circle([cmp.lat, cmp.lng], {
              radius: 420 + cmp.upvotes * 18,
              color: heatColor,
              weight: 1.5,
              fillColor: heatColor,
              fillOpacity: 0.32,
            }).addTo(group);

            circle.bindPopup(
              `<div style="font-family: sans-serif;">
                <strong>${cmp.ward}</strong><br/>
                <span>${cmp.category} (${cmp.upvotes} citizen reports)</span>
              </div>`
            );
            circle.on('click', () => {
              if (onSelectComplaint) onSelectComplaint(cmp);
            });
          });
        }

        map.setView([lat, lng], 12);
      }
    } catch (err) {
      console.warn('Leaflet layer update warning:', err);
    }
  }, [mode, lat, lng, complaints]);

  return (
    <div className="relative w-full border border-[#C9D3CB] dark:border-[#24382E] rounded-sm overflow-hidden bg-[#E6ECE4] dark:bg-[#15231D]">
      <div ref={containerRef} className={`w-full ${heightClass}`} />
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-[#EAEFE7] dark:bg-[#121F1A] border-t border-[#C9D3CB] dark:border-[#24382E] text-xs font-mono text-[#3A4D41] dark:text-[#9BB2A3]">
        <span>
          LAT {lat.toFixed(4)} · LNG {lng.toFixed(4)}
        </span>
        <span>
          {mode === 'picker'
            ? 'Click map or drag pin to set location (50m radius shown)'
            : mode === 'admin-heatmap'
            ? 'Ward Complaint Density Heatmap (OpenStreetMap)'
            : mode === 'admin-clusters'
            ? 'Category Markers · Number indicates citizen upvotes'
            : 'Field Collector Geotag Target'}
        </span>
      </div>
    </div>
  );
};

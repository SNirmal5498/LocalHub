import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Business } from '../../types/index.js';

interface MapViewerProps {
  businesses?: Business[];
  singleBusiness?: Business;
  height?: string;
  className?: string;
  zoom?: number;
  onSelectBusiness?: (business: Business) => void;
}

export const MapViewer: React.FC<MapViewerProps> = ({
  businesses = [],
  singleBusiness,
  height = '400px',
  className = '',
  zoom = 13,
  onSelectBusiness,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const activeList = singleBusiness ? [singleBusiness] : businesses;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Cleanup previous map if already initialized
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const defaultLat = singleBusiness?.latitude || (businesses[0]?.latitude ?? 37.7749);
    const defaultLng = singleBusiness?.longitude || (businesses[0]?.longitude ?? -122.4194);

    const map = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLng],
      zoom: singleBusiness ? 15 : zoom,
      scrollWheelZoom: false,
    });

    mapInstanceRef.current = map;

    // OpenStreetMap standard tile layer (free, no API key needed!)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Custom modern pin icon
    const customIcon = L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div style="
          width: 34px;
          height: 34px;
          background: #f59e0b;
          border: 3px solid #ffffff;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 10px;
            height: 10px;
            background: #ffffff;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -32],
    });

    const bounds = L.latLngBounds([]);

    activeList.forEach(biz => {
      if (biz.latitude && biz.longitude) {
        const marker = L.marker([biz.latitude, biz.longitude], { icon: customIcon }).addTo(map);

        const popupContent = `
          <div style="font-family: system-ui, sans-serif; min-width: 180px; padding: 4px;">
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 2px; color: #171717;">
              ${biz.name}
            </div>
            <div style="font-size: 12px; color: #737373; margin-bottom: 6px;">
              ${biz.category} · ★ ${biz.rating || 5.0} (${biz.reviewCount || 0})
            </div>
            <div style="font-size: 11px; color: #525252; margin-bottom: 8px;">
              📍 ${biz.address}, ${biz.city}
            </div>
            <a href="/business/${biz.slug}" style="
              display: block;
              text-align: center;
              padding: 5px 10px;
              background: #0f172a;
              color: #ffffff;
              text-decoration: none;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 600;
            ">
              View Storefront
            </a>
          </div>
        `;

        marker.bindPopup(popupContent);
        bounds.extend([biz.latitude, biz.longitude]);

        if (onSelectBusiness) {
          marker.on('click', () => onSelectBusiness(biz));
        }
      }
    });

    if (activeList.length > 1 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }

    // Invalidate size to ensure crisp render in layout
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeList.length, singleBusiness?._id]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height, width: '100%' }}
      className={`rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 z-0 relative ${className}`}
    />
  );
};

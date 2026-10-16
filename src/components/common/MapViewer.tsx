import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Business } from '../../types/index.js';
import { api } from '../../services/api.js';
import {
  isValidCoordinate,
  isSanFranciscoPlaceholder,
  openDrivingDirections,
} from '../../utils/location.js';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

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

  // Dynamic geocoding state for single business with missing/placeholder coordinates
  const [resolvedCoords, setResolvedCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [resolutionFailed, setResolutionFailed] = useState<boolean>(false);

  // Check if singleBusiness has valid, non-placeholder coordinates
  const hasDirectCoords = Boolean(
    singleBusiness &&
      isValidCoordinate(singleBusiness.latitude, singleBusiness.longitude) &&
      !isSanFranciscoPlaceholder(singleBusiness.latitude, singleBusiness.longitude, singleBusiness.city)
  );

  useEffect(() => {
    if (!singleBusiness) {
      setResolvedCoords(null);
      setIsResolving(false);
      setResolutionFailed(false);
      return;
    }

    if (hasDirectCoords) {
      setResolvedCoords({
        latitude: singleBusiness.latitude!,
        longitude: singleBusiness.longitude!,
      });
      setIsResolving(false);
      setResolutionFailed(false);
      return;
    }

    // Coordinates missing or placeholder -> attempt dynamic geocoding
    let isCancelled = false;
    setIsResolving(true);
    setResolutionFailed(false);

    api
      .geocodeLocation({
        address: singleBusiness.address,
        city: singleBusiness.city,
        state: singleBusiness.state,
        postalCode: singleBusiness.postalCode,
        country: singleBusiness.country || 'India',
      })
      .then(res => {
        if (isCancelled) return;
        if (
          res.success &&
          res.data &&
          isValidCoordinate(res.data.latitude, res.data.longitude)
        ) {
          setResolvedCoords({
            latitude: res.data.latitude,
            longitude: res.data.longitude,
          });
          setResolutionFailed(false);
        } else {
          setResolutionFailed(true);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setResolutionFailed(true);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsResolving(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [
    singleBusiness?._id,
    singleBusiness?.address,
    singleBusiness?.city,
    singleBusiness?.state,
    singleBusiness?.latitude,
    singleBusiness?.longitude,
    hasDirectCoords,
  ]);

  // Determine active list of businesses with valid coordinates
  const activeBusinesses: Array<Business & { activeLat: number; activeLng: number }> = [];

  if (singleBusiness) {
    const lat = resolvedCoords?.latitude ?? (hasDirectCoords ? singleBusiness.latitude! : null);
    const lng = resolvedCoords?.longitude ?? (hasDirectCoords ? singleBusiness.longitude! : null);
    if (lat !== null && lng !== null && isValidCoordinate(lat, lng)) {
      activeBusinesses.push({
        ...singleBusiness,
        activeLat: lat,
        activeLng: lng,
      });
    }
  } else {
    businesses.forEach(b => {
      if (
        isValidCoordinate(b.latitude, b.longitude) &&
        !isSanFranciscoPlaceholder(b.latitude, b.longitude, b.city)
      ) {
        activeBusinesses.push({
          ...b,
          activeLat: b.latitude!,
          activeLng: b.longitude!,
        });
      }
    });
  }

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (activeBusinesses.length === 0) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      return;
    }

    // Cleanup previous map if initialized
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const first = activeBusinesses[0];
    const map = L.map(mapContainerRef.current, {
      center: [first.activeLat, first.activeLng],
      zoom: singleBusiness ? 15 : zoom,
      scrollWheelZoom: false,
    });

    mapInstanceRef.current = map;

    // OpenStreetMap standard tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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

    activeBusinesses.forEach(biz => {
      const marker = L.marker([biz.activeLat, biz.activeLng], { icon: customIcon }).addTo(map);

      const popupContent = `
        <div style="font-family: system-ui, sans-serif; min-width: 190px; padding: 4px;">
          <div style="font-weight: 700; font-size: 14px; margin-bottom: 2px; color: #171717;">
            ${biz.name}
          </div>
          <div style="font-size: 12px; color: #737373; margin-bottom: 6px;">
            ${biz.category} · ★ ${biz.rating || 5.0} (${biz.reviewCount || 0})
          </div>
          <div style="font-size: 11px; color: #525252; margin-bottom: 8px;">
            📍 ${biz.address}, ${biz.city}${biz.state ? `, ${biz.state}` : ''}
          </div>
          <div style="display: flex; gap: 6px;">
            <a href="/business/${biz.slug}" style="
              flex: 1;
              display: block;
              text-align: center;
              padding: 5px 8px;
              background: #0f172a;
              color: #ffffff;
              text-decoration: none;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 600;
            ">
              Storefront
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      bounds.extend([biz.activeLat, biz.activeLng]);

      if (onSelectBusiness) {
        marker.on('click', () => onSelectBusiness(biz));
      }
    });

    if (activeBusinesses.length > 1 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeBusinesses.length, singleBusiness?._id, resolvedCoords?.latitude, resolvedCoords?.longitude]);

  // If resolving coordinates dynamically
  if (isResolving) {
    return (
      <div
        style={{ height, width: '100%' }}
        className={`flex items-center justify-center bg-neutral-50 dark:bg-neutral-900/60 rounded-xl border border-neutral-200 dark:border-neutral-800 ${className}`}
      >
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
          <span>Locating store address on map...</span>
        </div>
      </div>
    );
  }

  // If single business resolution failed
  if (singleBusiness && (resolutionFailed || activeBusinesses.length === 0)) {
    return (
      <div
        style={{ height, width: '100%' }}
        className={`flex flex-col items-center justify-center p-6 text-center bg-neutral-50 dark:bg-neutral-900/60 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-3 ${className}`}
      >
        <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
            {singleBusiness.name}
          </h4>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5 max-w-sm">
            {singleBusiness.address}, {singleBusiness.city}
            {singleBusiness.state ? `, ${singleBusiness.state}` : ''}{' '}
            {singleBusiness.postalCode || ''}
          </p>
        </div>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 max-w-xs">
          Interactive map preview is unavailable for this specific street address. You can still open direct driving directions.
        </p>
        <button
          onClick={() => openDrivingDirections(singleBusiness)}
          className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 transition-opacity"
        >
          <Navigation className="w-3.5 h-3.5" /> Open Driving Directions
        </button>
      </div>
    );
  }

  // If multi-business view has no valid pins
  if (!singleBusiness && activeBusinesses.length === 0) {
    return (
      <div
        style={{ height, width: '100%' }}
        className={`flex flex-col items-center justify-center p-6 text-center bg-neutral-50 dark:bg-neutral-900/60 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2 ${className}`}
      >
        <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center">
          <MapPin className="w-5 h-5" />
        </div>
        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          No map locations found
        </p>
        <p className="text-[11px] text-neutral-500 max-w-xs">
          None of the listed businesses currently have valid coordinates to plot on the map.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      style={{ height, width: '100%' }}
      className={`rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 z-0 relative ${className}`}
    />
  );
};

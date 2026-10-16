/**
 * LocalHub Location & Geolocation Utilities
 * Provides generic, multi-city coordinate validation, distance calculation,
 * and reliable Google Maps driving directions generation with opt-in browser geolocation.
 */

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface BusinessLocation {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
}

/**
 * Safely escapes HTML special characters to prevent injection into document strings.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validates that latitude and longitude are valid numeric geographic coordinates.
 */
export function isValidCoordinate(lat?: number | null, lng?: number | null): boolean {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Checks if coordinates are the unintended San Francisco placeholder (37.7749, -122.4194).
 * If the business's city is genuinely San Francisco, returns false.
 */
export function isSanFranciscoPlaceholder(
  lat?: number | null,
  lng?: number | null,
  city?: string
): boolean {
  if (lat === null || lat === undefined || lng === null || lng === undefined) return false;
  const isApproxSF = Math.abs(lat - 37.7749) < 0.05 && Math.abs(lng - (-122.4194)) < 0.05;
  if (!isApproxSF) return false;
  if (city && city.trim().toLowerCase() === 'san francisco') {
    return false;
  }
  return true;
}

/**
 * Haversine formula to compute great-circle distance between two GPS coordinates in kilometers.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

/**
 * Formats a distance in kilometers into a human-readable string (e.g. "850 m" or "2.4 km").
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m away`;
  }
  return `${km.toFixed(1)} km away`;
}

/**
 * Builds the Google Maps destination parameter from a business object.
 * Uses exact coordinates when valid and not placeholder; otherwise falls back to complete address.
 */
export function getDirectionsDestination(business: BusinessLocation): string {
  const hasValidCoords =
    isValidCoordinate(business.latitude, business.longitude) &&
    !isSanFranciscoPlaceholder(business.latitude, business.longitude, business.city);

  if (hasValidCoords) {
    return `${business.latitude},${business.longitude}`;
  }

  // Fall back to complete address
  const addressParts = [
    business.address?.trim(),
    business.city?.trim(),
    business.state?.trim(),
    business.postalCode?.trim(),
    business.country?.trim() || 'India',
  ].filter(Boolean);

  return addressParts.join(', ');
}

/**
 * Builds the full Google Maps driving directions URL using URLSearchParams.
 * Format: https://www.google.com/maps/dir/?api=1&destination=DESTINATION[&origin=LATITUDE%2CLONGITUDE]
 */
export function buildGoogleMapsDirectionsUrl(
  business: BusinessLocation,
  originCoords?: LocationCoordinates | null
): string {
  const destination = getDirectionsDestination(business);
  if (!destination) {
    return 'https://www.google.com/maps';
  }

  const params = new URLSearchParams();
  params.set('api', '1');

  if (
    originCoords &&
    isValidCoordinate(originCoords.latitude, originCoords.longitude)
  ) {
    params.set('origin', `${originCoords.latitude},${originCoords.longitude}`);
  }

  params.set('destination', destination);

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/**
 * Requests the customer's current GPS location via browser Geolocation API.
 * Returns null if denied, timed out, or unavailable. Never fabricates a location.
 */
export async function getUserCurrentLocation(
  timeoutMs = 3000
): Promise<LocationCoordinates | null> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return null;
  }

  return new Promise(resolve => {
    let resolved = false;

    // Safety timeout to ensure promise resolves even if browser hangs on prompt
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(null);
      }
    }, timeoutMs);

    navigator.geolocation.getCurrentPosition(
      pos => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve({
            latitude: Number(pos.coords.latitude.toFixed(6)),
            longitude: Number(pos.coords.longitude.toFixed(6)),
          });
        }
      },
      _err => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve(null);
        }
      },
      {
        timeout: timeoutMs,
        enableHighAccuracy: false,
        maximumAge: 300000,
      }
    );
  });
}

/**
 * Shows an in-page fallback banner if the browser's popup blocker blocked window.open.
 */
export function showPopupBlockedFallback(url: string, storeName?: string): void {
  if (typeof document === 'undefined') return;

  const existing = document.getElementById('localhub-popup-fallback-banner');
  if (existing) existing.remove();

  const banner = document.createElement('div');
  banner.id = 'localhub-popup-fallback-banner';
  banner.setAttribute('role', 'alert');
  banner.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 99999;
    max-width: 440px;
    width: calc(100% - 32px);
    background: #0f172a;
    color: #ffffff;
    padding: 12px 16px;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    border: 1px solid rgba(255,255,255,0.15);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    font-family: system-ui, -apple-system, sans-serif;
  `;

  const escapedUrl = escapeHtml(url);
  const escapedName = escapeHtml(storeName || 'the store');

  banner.innerHTML = `
    <div style="display:flex; align-items:center; gap:10px; overflow:hidden;">
      <span style="font-size:18px; line-height:1; flex-shrink:0;">📍</span>
      <div style="overflow:hidden; font-size:12px;">
        <div style="font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Popup was blocked by your browser</div>
        <div style="opacity:0.8; font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Open driving directions to ${escapedName}</div>
      </div>
    </div>
    <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
      <a id="localhub-fallback-open-link" href="${escapedUrl}" target="_blank" rel="noopener noreferrer" style="
        background:#f59e0b;
        color:#000000;
        font-weight:700;
        font-size:12px;
        padding:6px 12px;
        border-radius:10px;
        text-decoration:none;
        white-space:nowrap;
        display:inline-block;
      ">
        Open Directions
      </a>
      <button id="localhub-fallback-close-btn" type="button" aria-label="Close" style="
        background:none;
        border:none;
        color:#94a3b8;
        cursor:pointer;
        font-size:14px;
        padding:4px;
        line-height:1;
      ">
        ✕
      </button>
    </div>
  `;

  const closeBtn = banner.querySelector('#localhub-fallback-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      banner.remove();
    });
  }

  document.body.appendChild(banner);

  // Auto-remove after 14 seconds
  setTimeout(() => {
    if (document.body.contains(banner)) {
      banner.remove();
    }
  }, 14000);
}

/**
 * Opens Google Maps driving directions to the business.
 * - Handles the click immediately.
 * - Opens a new tab synchronously during user click to comply with browser popup policies.
 * - Populates the tab immediately with a loading state and automatic meta-refresh fallback
 *   so the tab is NEVER left blank or on about:blank.
 * - Queries browser geolocation with strict timeout.
 * - If customer grants permission, updates destination with customer origin.
 * - If permission is denied, times out, or unavailable, navigates directly to destination.
 * - If the popup is blocked, presents an accessible, one-click in-page fallback.
 * - Never leaves an about:blank tab open.
 */
export async function openDrivingDirections(business: BusinessLocation): Promise<void> {
  const defaultUrl = buildGoogleMapsDirectionsUrl(business, null);

  // 1. Open the new tab synchronously during the trusted user click event
  let targetWindow: Window | null = null;
  try {
    targetWindow = window.open('', '_blank');
  } catch (err) {
    targetWindow = null;
  }

  // 2. If popup was blocked or unavailable, show immediate in-page fallback
  if (!targetWindow || targetWindow.closed || typeof targetWindow.closed === 'undefined') {
    showPopupBlockedFallback(defaultUrl, business.name);
    return;
  }

  // 3. Immediately write loading content with a 2.5s meta-refresh safety net into the open window.
  // This guarantees that even if geolocation or parent script crashes, the tab navigates to Google Maps.
  const escapedDefaultUrl = escapeHtml(defaultUrl);
  const escapedStoreName = escapeHtml(business.name || 'Store');

  try {
    targetWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Opening Directions - LocalHub</title>
        <meta http-equiv="refresh" content="2.5;url=${escapedDefaultUrl}">
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background-color: #0a0a0a;
            color: #ffffff;
            padding: 20px;
          }
          .card {
            text-align: center;
            padding: 32px 24px;
            max-width: 380px;
            width: 100%;
            background: #171717;
            border: 1px solid #262626;
            border-radius: 20px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
          }
          .spinner {
            width: 36px;
            height: 36px;
            border: 3px solid rgba(255,255,255,0.15);
            border-top-color: #f59e0b;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 16px;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
          h3 { font-size: 16px; font-weight: 700; margin: 0 0 6px; }
          p { font-size: 13px; color: #a3a3a3; margin: 0 0 16px; line-height: 1.4; }
          a {
            display: inline-block;
            background: #f59e0b;
            color: #000000;
            font-weight: 700;
            font-size: 12px;
            padding: 8px 16px;
            border-radius: 10px;
            text-decoration: none;
            transition: opacity 0.2s;
          }
          a:hover { opacity: 0.9; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="spinner"></div>
          <h3>Connecting to Google Maps</h3>
          <p>Preparing driving directions to ${escapedStoreName}...</p>
          <a href="${escapedDefaultUrl}" id="fallback-link">Click to Open Google Maps</a>
        </div>
      </body>
      </html>
    `);
    targetWindow.document.close();
  } catch (err) {
    // If browser security prevented document write, proceed directly
  }

  // 4. Check permissions and attempt to obtain customer GPS location
  let targetUrl = defaultUrl;
  try {
    let permissionState: string | null = null;
    if (typeof navigator !== 'undefined' && navigator.permissions?.query) {
      try {
        const perm = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        permissionState = perm.state;
      } catch {
        permissionState = null;
      }
    }

    if (permissionState === 'denied') {
      // Permission explicitly denied: immediately navigate without origin
      targetUrl = defaultUrl;
    } else {
      // Fast race with maximum 1200ms timeout so tab navigates almost immediately
      const userCoords = await Promise.race([
        getUserCurrentLocation(1200),
        new Promise<null>(resolve => setTimeout(() => resolve(null), 1200)),
      ]);

      if (userCoords && isValidCoordinate(userCoords.latitude, userCoords.longitude)) {
        targetUrl = buildGoogleMapsDirectionsUrl(business, userCoords);
      } else {
        targetUrl = defaultUrl;
      }
    }
  } catch (err) {
    targetUrl = defaultUrl;
  }

  // 5. Navigate the open window to the final Google Maps URL
  try {
    if (targetWindow && !targetWindow.closed) {
      targetWindow.location.replace(targetUrl);
    } else {
      showPopupBlockedFallback(targetUrl, business.name);
    }
  } catch (err) {
    // If replace throws cross-origin error, attempt href
    try {
      if (targetWindow && !targetWindow.closed) {
        targetWindow.location.href = targetUrl;
      } else {
        showPopupBlockedFallback(targetUrl, business.name);
      }
    } catch {
      // Close the tab if navigation failed to avoid leaving a blank window
      try {
        if (targetWindow && !targetWindow.closed) {
          targetWindow.close();
        }
      } catch {}
      showPopupBlockedFallback(targetUrl, business.name);
    }
  }
}

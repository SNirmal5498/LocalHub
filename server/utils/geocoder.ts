/**
 * Backend Geocoding Utility for LocalHub
 * Uses OpenStreetMap Nominatim with hierarchical fallback and coordinate validation.
 * Supports any city and country worldwide.
 */

export interface GeocodeQuery {
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  displayName: string;
  matchedQuery: string;
}

/**
 * Checks if coordinates are the unintended San Francisco placeholder (37.7749, -122.4194).
 * If the business's city is actually San Francisco, returns false.
 */
export function isSanFranciscoPlaceholder(lat?: number | null, lng?: number | null, city?: string): boolean {
  if (lat === null || lat === undefined || lng === null || lng === undefined) return false;
  const isApproxSF = Math.abs(lat - 37.7749) < 0.05 && Math.abs(lng - (-122.4194)) < 0.05;
  if (!isApproxSF) return false;
  if (city && city.trim().toLowerCase() === 'san francisco') {
    return false;
  }
  return true;
}

/**
 * Validates if coordinates are in a valid latitude/longitude range.
 */
export function isValidCoordinate(lat?: number | null, lng?: number | null): boolean {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Geocodes an address with hierarchical fallback:
 * 1. Specific address + city + state + postalCode + country
 * 2. Specific address + city + state + country
 * 3. Specific address + city + country
 * 4. Specific address + city
 * 5. City + state + country
 * 6. City + country
 * 7. City
 */
export async function geocodeAddress(query: GeocodeQuery): Promise<GeocodeResult | null> {
  const address = query.address?.trim() || '';
  const city = query.city?.trim() || '';
  const state = query.state?.trim() || '';
  const postalCode = query.postalCode?.trim() || '';
  const country = query.country?.trim() || '';

  if (!city && !address) {
    return null;
  }

  // Construct candidate queries from most specific to broader fallback
  const candidateQueries: string[] = [];

  if (address && city) {
    if (postalCode) candidateQueries.push([address, city, state, postalCode, country].filter(Boolean).join(', '));
    candidateQueries.push([address, city, state, country].filter(Boolean).join(', '));
    candidateQueries.push([address, city, country].filter(Boolean).join(', '));
    candidateQueries.push([address, city].filter(Boolean).join(', '));
  }

  if (city) {
    if (postalCode) candidateQueries.push([city, state, postalCode, country].filter(Boolean).join(', '));
    if (state) candidateQueries.push([city, state, country].filter(Boolean).join(', '));
    if (country) candidateQueries.push([city, country].filter(Boolean).join(', '));
    candidateQueries.push(city);
  }

  if (address && !city) {
    if (state) candidateQueries.push([address, state, country].filter(Boolean).join(', '));
    candidateQueries.push([address, country].filter(Boolean).join(', '));
    candidateQueries.push(address);
  }

  // Deduplicate queries
  const uniqueQueries = Array.from(new Set(candidateQueries));

  for (const q of uniqueQueries) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'LocalHub-Platform/1.0 (admin@localhub.platform)',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) continue;

      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);

        if (isValidCoordinate(lat, lon)) {
          return {
            latitude: Number(lat.toFixed(6)),
            longitude: Number(lon.toFixed(6)),
            displayName: data[0].display_name,
            matchedQuery: q,
          };
        }
      }
    } catch (err: any) {
      // Continue to next candidate query if network timeout or error
      console.warn(`[Geocoder] Candidate query failed for "${q}":`, err.message || err);
    }
  }

  return null;
}

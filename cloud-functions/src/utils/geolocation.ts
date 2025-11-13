/**
 * Utility functions for geolocation calculations
 */

/**
 * Calculates distance between two GPS points using Haversine formula
 * @param lat1 - Latitude of point 1
 * @param lng1 - Longitude of point 1
 * @param lat2 - Latitude of point 2
 * @param lng2 - Longitude of point 2
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Converts degrees to radians
 */
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Generates GeoHash for location indexing
 * @param lat - Latitude
 * @param lng - Longitude
 * @param precision - GeoHash precision (default: 6)
 * @returns GeoHash string
 */
export function encodeGeoHash(lat: number, lng: number, precision: number = 6): string {
  // Simplified GeoHash implementation
  // In production, use a library like 'ngeohash'
  const base32 = '0123456789bcdefghjkmnpqrstuvwxyz';
  let latMin = -90;
  let latMax = 90;
  let lngMin = -180;
  let lngMax = 180;
  let hash = '';
  let bit = 0;
  let ch = 0;

  while (hash.length < precision) {
    const mid = (lngMin + lngMax) / 2;
    if (bit % 2 === 0) {
      if (lng > mid) {
        ch |= (1 << (4 - (bit % 5)));
        lngMin = mid;
      } else {
        lngMax = mid;
      }
    } else {
      const latMid = (latMin + latMax) / 2;
      if (lat > latMid) {
        ch |= (1 << (4 - (bit % 5)));
        latMin = latMid;
      } else {
        latMax = latMid;
      }
    }

    bit++;
    if (bit % 5 === 0) {
      hash += base32[ch];
      ch = 0;
    }
  }

  return hash;
}

/**
 * Gets bounding box coordinates for a radius around a point
 * @param lat - Center latitude
 * @param lng - Center longitude
 * @param radiusKm - Radius in kilometers
 * @returns Bounding box { minLat, maxLat, minLng, maxLng }
 */
export function getBoundingBox(lat: number, lng: number, radiusKm: number) {
  const latDelta = radiusKm / 111; // 1 degree lat ≈ 111 km
  const lngDelta = radiusKm / (111 * Math.cos(toRad(lat)));

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta
  };
}


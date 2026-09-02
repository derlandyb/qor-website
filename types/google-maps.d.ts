/**
 * Minimal ambient types for the small slice of the Google Maps JavaScript
 * API GoogleMap.tsx (W17) actually uses — not the full @types/google.maps
 * surface, since that's not installed and this is all that's needed.
 */
declare namespace google.maps {
  class LatLng {
    lat(): number;
    lng(): number;
  }

  interface GeocoderResult {
    geometry: { location: LatLng };
  }

  class Geocoder {
    geocode(
      request: { address: string },
      callback: (results: GeocoderResult[] | null, status: string) => void,
    ): void;
  }

  class Map {
    constructor(mapDiv: HTMLElement, opts?: { center: LatLng; zoom: number });
  }

  class Marker {
    constructor(opts?: { position: LatLng; map: Map });
  }
}

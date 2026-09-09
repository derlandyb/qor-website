/**
 * Minimal ambient types for the small slice of the Google Maps JavaScript
 * API GoogleMap.tsx (W17, extended T22/MAPUI for multi-pin mode) actually
 * uses — not the full @types/google.maps surface, since that's not
 * installed and this is all that's needed.
 */
declare namespace google.maps {
  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  class LatLng {
    lat(): number;
    lng(): number;
  }

  class LatLngBounds {
    getNorthEast(): LatLng;
    getSouthWest(): LatLng;
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

  class MVCObject {
    addListener(eventName: string, handler: () => void): void;
  }

  class Map extends MVCObject {
    constructor(mapDiv: HTMLElement, opts?: { center: LatLng | LatLngLiteral; zoom: number });
    getBounds(): LatLngBounds | undefined;
  }

  class Marker extends MVCObject {
    constructor(opts?: { position: LatLng | LatLngLiteral; map: Map; title?: string });
  }
}

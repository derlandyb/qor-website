"use client";

import { useEffect, useMemo, useRef, useState } from "react";

declare global {
  interface Window {
    google?: typeof google;
  }
}

let scriptLoadingPromise: Promise<void> | null = null;

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (window.google?.maps) return Promise.resolve();
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Falha ao carregar o mapa."));
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

export interface MapPin {
  id: number;
  lat: number;
  lng: number;
  title: string;
}

export interface MapBoundsChange {
  north: number;
  south: number;
  east: number;
  west: number;
}

/** Greater Vitória's approximate geographic center — the multi-pin map's fallback center when there are no pins (yet) to center on. */
const GREATER_VITORIA_CENTER = { lat: -20.3, lng: -40.3 };

export type GoogleMapProps =
  | { address: string; pins?: undefined; onPinClick?: undefined; onBoundsChanged?: undefined }
  | {
      address?: undefined;
      pins: MapPin[];
      onPinClick?: (id: number) => void;
      onBoundsChanged?: (bounds: MapBoundsChange) => void;
    };

/**
 * W17 — Google Maps JavaScript API embed. Two modes, selected by which prop
 * is passed:
 * - Single-pin (`address`): geocoded from a venue's address (original W17
 *   behavior, unchanged) — used by the Event Detail page.
 * - Multi-pin (`pins`, T22/MAPUI-01..03): one marker per already-geocoded
 *   event — lat/lng come straight off `GET /events/map`, no client-side
 *   geocoding needed. `onPinClick` fires with the event id (MAPUI-02);
 *   `onBoundsChanged` fires only on a user-driven pan/zoom (the map's own
 *   initial `idle` on mount is swallowed) so the caller can re-query the
 *   geo endpoint for the new viewport rather than filtering one static
 *   fetch (MAPUI-03).
 *
 * Falls back to a plain "Abrir no Google Maps" link (single-pin mode) or a
 * pt-BR inline error (multi-pin mode) if the script fails to load or (for
 * single-pin) the address can't be geocoded, rather than showing a blank box.
 */
export function GoogleMap(props: GoogleMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const isMultiPin = props.pins !== undefined;
  const propsPins = props.pins;
  const pins = useMemo(() => propsPins ?? [], [propsPins]);
  const address = props.address;
  const onPinClick = isMultiPin ? props.onPinClick : undefined;
  const onBoundsChanged = isMultiPin ? props.onBoundsChanged : undefined;

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      // Synchronizing with an external fact (no key configured) discovered
      // only at effect time — same rationale as the other setState-in-effect
      // exceptions already accepted in this codebase (qor-admin's hooks).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFailed(true);
      return;
    }

    let active = true;

    loadGoogleMapsScript(apiKey)
      .then(() => {
        if (!active || !containerRef.current || !window.google) return;
        const google = window.google;

        if (isMultiPin) {
          const center = pins[0] ? { lat: pins[0].lat, lng: pins[0].lng } : GREATER_VITORIA_CENTER;
          const map = new google.maps.Map(containerRef.current, { center, zoom: 12 });

          pins.forEach((pin) => {
            const marker = new google.maps.Marker({
              position: { lat: pin.lat, lng: pin.lng },
              map,
              title: pin.title,
            });
            marker.addListener("click", () => onPinClick?.(pin.id));
          });

          if (onBoundsChanged) {
            // The map's own first `idle` (right after construction) isn't a
            // user pan/zoom — only re-query from the SECOND idle onward.
            let initialIdleFired = false;
            map.addListener("idle", () => {
              if (!initialIdleFired) {
                initialIdleFired = true;
                return;
              }
              const bounds = map.getBounds();
              if (!bounds) return;
              const ne = bounds.getNorthEast();
              const sw = bounds.getSouthWest();
              onBoundsChanged({ north: ne.lat(), south: sw.lat(), east: ne.lng(), west: sw.lng() });
            });
          }
          return;
        }

        if (address === undefined) return;

        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address }, (results, status) => {
          if (!active) return;
          if (status !== "OK" || !results?.[0] || !containerRef.current || !window.google) {
            setFailed(true);
            return;
          }

          const map = new google.maps.Map(containerRef.current, {
            center: results[0].geometry.location,
            zoom: 15,
          });
          new google.maps.Marker({ position: results[0].geometry.location, map });
        });
      })
      .catch(() => {
        if (active) setFailed(true);
      });

    return () => {
      active = false;
    };
  }, [address, isMultiPin, pins, onPinClick, onBoundsChanged]);

  if (failed) {
    if (isMultiPin) {
      return (
        <p
          role="alert"
          className="rounded-[14px] border border-[#2A2E3B] bg-[#12141D] p-4 text-center text-[13px] text-[#FF4D4D]"
        >
          Não foi possível carregar o mapa.
        </p>
      );
    }

    return (
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address ?? "")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-[14px] border border-[#2A2E3B] bg-[#12141D] p-4 text-center text-[13px] text-[#2EC5FF] underline"
      >
        Abrir no Google Maps
      </a>
    );
  }

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={isMultiPin ? "Mapa de eventos" : `Mapa de ${address}`}
      className={isMultiPin ? "h-[480px] w-full rounded-[14px]" : "h-64 w-full rounded-[14px]"}
    />
  );
}

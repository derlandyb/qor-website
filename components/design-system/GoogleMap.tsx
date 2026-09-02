"use client";

import { useEffect, useRef, useState } from "react";

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

export interface GoogleMapProps {
  address: string;
}

/**
 * W17 — Google Maps JavaScript API embed, geocoded from the venue's
 * address (user-confirmed choice over the plain iframe embed). Falls back
 * to a plain "abrir no Google Maps" link if the script fails to load or the
 * address can't be geocoded, rather than showing a blank box.
 */
export function GoogleMap({ address }: GoogleMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

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

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address }, (results, status) => {
          if (!active) return;
          if (status !== "OK" || !results?.[0] || !containerRef.current || !window.google) {
            setFailed(true);
            return;
          }

          const map = new window.google.maps.Map(containerRef.current, {
            center: results[0].geometry.location,
            zoom: 15,
          });
          new window.google.maps.Marker({ position: results[0].geometry.location, map });
        });
      })
      .catch(() => {
        if (active) setFailed(true);
      });

    return () => {
      active = false;
    };
  }, [address]);

  if (failed) {
    return (
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-[14px] border border-[#2A2E3B] bg-[#12141D] p-4 text-center text-[13px] text-[#2EC5FF] underline"
      >
        Abrir no Google Maps
      </a>
    );
  }

  return <div ref={containerRef} role="img" aria-label={`Mapa de ${address}`} className="h-64 w-full rounded-[14px]" />;
}

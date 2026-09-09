"use client";

/**
 * T22 — Mapa Interativo (MAPUI-01..04). City filter defaults to Vitória
 * (same default as /eventos) and drives the query until the fan pans/zooms
 * the map, at which point the reported viewport bounds take over (bounds
 * take precedence server-side too — see lib/api/client.ts's getMapEvents).
 * Selecting a new city resets back to city-mode, discarding the last pan.
 * Pins render only for already-geocoded events (guaranteed server-side by
 * GET /events/map) — no client-side coordinate filtering needed (MAPUI-04).
 */
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CityFilterBar } from "../../components/design-system/CityFilterBar";
import { EmptyState } from "../../components/design-system/EmptyState";
import { GoogleMap, type MapBoundsChange, type MapPin } from "../../components/design-system/GoogleMap";
import { useMapEvents } from "../../hooks/useEvents";
import type { City } from "../../lib/enums/city";

export default function MapaPage() {
  const router = useRouter();
  const [city, setCity] = useState<City>("vitoria");
  const [bounds, setBounds] = useState<MapBoundsChange | undefined>(undefined);

  const { events, loading, error } = useMapEvents(bounds ? { bounds } : { city });

  const pins: MapPin[] = useMemo(
    () => events.map((event) => ({ id: event.id, lat: event.latitude, lng: event.longitude, title: event.title })),
    [events],
  );

  function handleSelectCity(nextCity: City) {
    setBounds(undefined);
    setCity(nextCity);
  }

  return (
    <main className="flex flex-col gap-4 pb-12">
      <div className="px-4 pt-4">
        <h1 className="font-[Space_Grotesk] text-[22px] font-bold text-[#F5F6FA]">Mapa Interativo</h1>
      </div>

      <CityFilterBar activeCity={city} onSelect={handleSelectCity} />

      {error && (
        <p role="alert" className="px-4 text-sm text-[#FF4D4D]">
          {error}
        </p>
      )}

      <div className="px-4">
        <GoogleMap
          pins={pins}
          onPinClick={(id) => router.push(`/eventos/${id}`)}
          onBoundsChanged={(nextBounds) => setBounds(nextBounds)}
        />
      </div>

      {!loading && !error && events.length === 0 && (
        <EmptyState message="Nenhum evento encontrado nesta área." />
      )}
    </main>
  );
}

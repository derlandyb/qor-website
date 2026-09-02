"use client";

/**
 * W16 — explore/discovery (DISC-14-18; Stitch screen
 * 642def01ae144e1f8a1896018febf379). City filter + full paginated list.
 * Genre filtering isn't wired here — qor-api's Event only has a raw
 * genre_id, no genre-list endpoint exists yet to resolve names for a
 * filter UI (same gap flagged for qor-admin's EventForm; STATE.md Todo).
 */
import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CityFilterBar } from "../../components/design-system/CityFilterBar";
import { EventCard } from "../../components/design-system/EventCard";
import { EmptyState } from "../../components/design-system/EmptyState";
import { Button } from "../../components/design-system/Button";
import { useEventList } from "../../hooks/useEvents";
import { CITY_VALUES, type City } from "../../lib/enums/city";

function isCity(value: string | null): value is City {
  return value !== null && (CITY_VALUES as readonly string[]).includes(value);
}

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialCity = searchParams.get("city");
  const [city, setCity] = useState<City>(isCity(initialCity) ? initialCity : "vitoria");
  const { events, loading, error, hasMore, loadMore } = useEventList({ city });

  return (
    <main className="flex flex-col gap-4 pb-12">
      <div className="px-4 pt-4">
        <h1 className="font-[Space_Grotesk] text-[22px] font-bold text-[#F5F6FA]">Explorar Eventos</h1>
      </div>

      <CityFilterBar activeCity={city} onSelect={setCity} />

      {error && (
        <p role="alert" className="px-4 text-sm text-[#FF4D4D]">
          {error}
        </p>
      )}

      {loading ? (
        <p className="px-4 text-sm text-[#9A9FB0]">Carregando...</p>
      ) : events.length === 0 ? (
        <EmptyState message="Nenhum evento encontrado para esta cidade." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event, index) => (
              <Link key={event.id} href={`/eventos/${event.id}`}>
                <EventCard
                  title={event.title}
                  flyerUrl={event.cover_image_url}
                  startsAt={event.starts_at}
                  status={event.status}
                  location={event.address}
                  city={event.city}
                  index={index}
                />
              </Link>
            ))}
          </div>

          {hasMore && (
            <div className="px-4">
              <Button variant="secondary" onClick={() => void loadMore()}>
                Carregar mais
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-[#9A9FB0]">Carregando...</div>}>
      <ExploreContent />
    </Suspense>
  );
}

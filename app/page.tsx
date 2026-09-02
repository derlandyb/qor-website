"use client";

/**
 * W15 — home feed (DISC-01-06; Stitch screen 32c8c87d76994eaf9f42cd320c2759e5).
 * Soonest-first event list for the active city, with entrance-stagger via
 * EventCard's own --card-index mechanism.
 */
import { useState } from "react";
import Link from "next/link";
import { CityFilterBar } from "../components/design-system/CityFilterBar";
import { EventCard } from "../components/design-system/EventCard";
import { EmptyState } from "../components/design-system/EmptyState";
import { useEventList } from "../hooks/useEvents";
import type { City } from "../lib/enums/city";

export default function HomePage() {
  const [city, setCity] = useState<City>("vitoria");
  const { events, loading, error } = useEventList({ city });

  return (
    <main className="flex flex-col gap-4 pb-12">
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
      )}
    </main>
  );
}

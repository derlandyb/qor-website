"use client";

/**
 * T23 — Hubs da Grande Vitória (HUB-01..04). Curated per-city landing page
 * over the existing `GET /events?city=` filter (no dedicated hub-aggregation
 * endpoint exists, per HUB-04) — distinct from /eventos's plain filtered
 * list via a city-accent-colored hero banner (per Stitch's "Hubs da Grande
 * Vitória" mock) instead of just a filter bar over a generic grid.
 * `[city]` comes straight off the URL, never a stored preference (per
 * spec.md's Edge Cases: a Hub deep-link with no stored city renders that
 * specific Hub regardless). Next.js 16 App Router: `params` is a Promise —
 * resolved via useEffect/useState, same pattern as app/eventos/[id]/page.tsx.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { EventCard } from "../../../components/design-system/EventCard";
import { EmptyState } from "../../../components/design-system/EmptyState";
import { useEventList } from "../../../hooks/useEvents";
import { CITY_VALUES, CITY_LABELS, CITY_ACCENT, type City, type CityAccent } from "../../../lib/enums/city";

interface HubPageProps {
  params: Promise<{ city: string }>;
}

/** Same table as CityGrid/CityFilterBar (design-system.md §4.2) — every class string must appear literally in source for Tailwind's static scanner. */
const HERO_ACCENT_CLASSES: Record<CityAccent, string> = {
  pink: "bg-[#FF2E7E] text-[#0B0D14]",
  blue: "bg-[#2EC5FF] text-[#0B0D14]",
  orange: "bg-[#FF8A1E] text-[#0B0D14]",
  purple: "bg-[#B14EFF] text-white",
};

function isCity(value: string): value is City {
  return (CITY_VALUES as readonly string[]).includes(value);
}

function HubContent({ city }: { city: City }) {
  const { events, loading, error } = useEventList({ city });

  return (
    <main className="flex flex-col gap-6 pb-12">
      <div className={`px-4 py-10 sm:px-8 ${HERO_ACCENT_CLASSES[CITY_ACCENT[city]]}`}>
        <p className="text-[12px] font-semibold uppercase tracking-wide">Hub da Grande Vitória</p>
        <h1 className="font-[Space_Grotesk] text-[32px] font-bold">{CITY_LABELS[city]}</h1>
      </div>

      {error && (
        <p role="alert" className="px-4 text-sm text-[#FF4D4D]">
          {error}
        </p>
      )}

      {loading ? (
        <p className="px-4 text-sm text-[#9A9FB0]">Carregando...</p>
      ) : events.length === 0 ? (
        <EmptyState message={`Nenhum evento encontrado em ${CITY_LABELS[city]}.`} />
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
                genre={event.genre}
                index={index}
              />
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

export default function HubPage({ params }: HubPageProps) {
  const [city, setCity] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    params.then((resolved) => {
      if (active) setCity(resolved.city);
    });
    return () => {
      active = false;
    };
  }, [params]);

  if (city === null) {
    return (
      <div className="p-4">
        <p className="text-sm text-[#9A9FB0]">Carregando...</p>
      </div>
    );
  }

  if (!isCity(city)) {
    return (
      <div className="p-4">
        <p role="alert" className="text-sm text-[#FF4D4D]">
          Cidade não encontrada.
        </p>
      </div>
    );
  }

  return <HubContent city={city} />;
}

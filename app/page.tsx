"use client";

/**
 * W15 — "Cena GV" home page (DISC-01-06; Stitch screen
 * f6bebdc8855f4dfbb449881e773b5b7b, "Website Landing Page (Desktop)").
 * Soonest-first event list across all cities: HeroFeature (soonest event) ->
 * tagline -> Marquee -> EventCarousel (all events) -> CityGrid. City
 * filtering now lives only on /eventos (Task 4); this page no longer owns a
 * `city` state or CityFilterBar. The mock's top nav/genre-grid belong to
 * `NavBar` (global layout, out of this task's scope per design.md's reuse
 * table) and a not-yet-built genre-browse feature respectively — not
 * rebuilt here; only the structure/spacing of the existing
 * HeroFeature/Marquee/EventCarousel/CityGrid composition is refreshed.
 */
import { EmptyState } from "../components/design-system/EmptyState";
import { HeroFeature } from "../components/design-system/HeroFeature";
import { Marquee } from "../components/design-system/Marquee";
import { EventCarousel } from "../components/design-system/EventCarousel";
import { CityGrid } from "../components/design-system/CityGrid";
import { useEventList } from "../hooks/useEvents";

const MARQUEE_ITEMS = [
  "Vitória · A cena começa aqui",
  "Vila Velha · Balada todo fim de semana",
  "Serra · Shows e festas perto de você",
  "Cariacica · Descubra a agenda local",
];

export default function HomePage() {
  const { events, loading, error } = useEventList({});

  return (
    <main className="flex flex-col gap-10 pb-12">
      {error && (
        <p role="alert" className="px-4 text-sm text-[#FF4D4D]">
          {error}
        </p>
      )}

      {loading ? (
        <p className="px-4 text-sm text-[#9A9FB0]">Carregando...</p>
      ) : events.length === 0 ? (
        <EmptyState message="Nenhum evento encontrado." />
      ) : (
        <>
          <HeroFeature event={events[0]} />

          <p className="px-4 text-[15px] text-[#9A9FB0] sm:px-8">
            Os melhores shows, baladas, barzinhos e festivais de Vitória, Vila Velha, Serra e
            Cariacica em um só lugar.
          </p>

          <Marquee items={MARQUEE_ITEMS} />

          <section className="flex flex-col gap-4 px-4">
            <h2 className="font-[Space_Grotesk] text-[22px] font-bold text-[#F5F6FA]">
              Próximos eventos
            </h2>
            <EventCarousel events={events} />
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="font-[Space_Grotesk] text-[22px] font-bold text-[#F5F6FA] px-4">
              Explore por cidade
            </h2>
            <CityGrid />
          </section>
        </>
      )}
    </main>
  );
}

"use client";

/**
 * W15 — "Cena GV" home page (DISC-01-06; Stitch screen
 * 32c8c87d76994eaf9f42cd320c2759e5). Soonest-first event list across all
 * cities: HeroFeature (soonest event) -> Marquee -> EventCarousel (all
 * events) -> CityGrid. City filtering now lives only on /eventos (Task 4);
 * this page no longer owns a `city` state or CityFilterBar.
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

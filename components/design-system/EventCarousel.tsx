"use client";

/**
 * Horizontal, scroll-snapping row of EventCards with prev/next arrow
 * buttons. Used on the home page ("Próximos eventos") and the event
 * detail page ("Mais eventos em <cidade>") — not wired into either yet.
 */
import { useRef } from "react";
import Link from "next/link";
import { EventCard } from "./EventCard";
import type { Event } from "../../lib/api/types";

const SCROLL_DELTA_PX = 320;

export interface EventCarouselProps {
  events: Event[];
}

export function EventCarousel({ events }: EventCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (events.length === 0) {
    return null;
  }

  function scrollByDelta(delta: number) {
    scrollRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <div className="relative flex items-center gap-2">
      <button
        type="button"
        aria-label="Anterior"
        onClick={() => scrollByDelta(-SCROLL_DELTA_PX)}
        className="flex shrink-0 items-center justify-center w-10 h-10 rounded-full bg-[#1B1E29] border border-[#2A2E3B] text-[#F5F6FA] transition-all duration-250 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:bg-[#2A2E3B] hover:scale-[1.05]"
      >
        <svg className="w-4 h-4" aria-hidden="true" />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth"
      >
        {events.map((event, index) => (
          <Link
            key={event.id}
            href={`/eventos/${event.id}`}
            className="shrink-0 w-[220px] snap-start"
          >
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

      <button
        type="button"
        aria-label="Próximo"
        onClick={() => scrollByDelta(SCROLL_DELTA_PX)}
        className="flex shrink-0 items-center justify-center w-10 h-10 rounded-full bg-[#1B1E29] border border-[#2A2E3B] text-[#F5F6FA] transition-all duration-250 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:bg-[#2A2E3B] hover:scale-[1.05]"
      >
        <svg className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}

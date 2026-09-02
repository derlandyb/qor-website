import Link from "next/link";
import type { Event } from "../../lib/api/types";

const DAY_LABELS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

/**
 * Compares calendar dates (not exact 24h windows) so "Amanhã" reads
 * correctly regardless of time-of-day, then falls back to the weekday name
 * for anything further out — per task-5 brief's "keep the logic simple".
 */
function relativeDayLabel(startsAt: string): string {
  const startsAtDate = new Date(startsAt);
  const now = new Date();

  const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round(
    (startOfDay(startsAtDate).getTime() - startOfDay(now).getTime()) / (24 * 60 * 60 * 1000),
  );

  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Amanhã";
  return DAY_LABELS[startsAtDate.getDay()];
}

export interface HeroFeatureProps {
  event: Event;
}

/**
 * design-system.md's home-page full-bleed hero — the soonest upcoming
 * event, chosen by the caller (Task 7). This component only renders what
 * it's given; no internal empty state (see task-5 brief).
 */
export function HeroFeature({ event }: HeroFeatureProps) {
  const startsAtDate = new Date(event.starts_at);
  const dayLabel = relativeDayLabel(event.starts_at);

  return (
    <section className="relative w-full min-h-[560px] overflow-hidden">
      <div className="absolute inset-0">
        {event.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- flyer source is arbitrary organizer-uploaded media, not a static local asset
          <img
            src={event.cover_image_url}
            alt={`${event.title} flyer`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-b from-[#12141D] to-[#0B0D14]" />
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      <div className="relative z-10 flex min-h-[560px] flex-col justify-end gap-4 px-4 pb-10 pt-24 sm:px-8">
        <div className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="h-2 w-2 shrink-0 rounded-full bg-[#FF2E7E] animate-pulse-glow"
          />
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#FF2E7E] font-[Space_Grotesk]">
            Próximo evento
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#9A9FB0]">
            {dayLabel}
          </span>
        </div>

        <h1 className="font-[Space_Grotesk] text-[40px] font-bold leading-[1.05] tracking-[-0.01em] text-[#F5F6FA] sm:text-[56px]">
          {event.title}
        </h1>

        {event.address && <p className="text-[15px] text-[#9A9FB0]">{event.address}</p>}

        <div className="flex flex-wrap gap-4 text-[13px] text-[#9A9FB0]">
          <span>{startsAtDate.toLocaleDateString("pt-BR", { dateStyle: "long" })}</span>
          <span>{startsAtDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
          <span>{event.is_free ? "Gratuito" : "Pago"}</span>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href={`/eventos/${event.id}`}
            className="rounded-[12px] bg-[#FF2E7E] px-6 py-3 font-[Space_Grotesk] text-[14px] font-semibold tracking-[0.01em] text-white hover:bg-[#FF2E7E]/90"
          >
            Ver detalhes
          </Link>
          {event.address && (
            <Link
              href={`/eventos/${event.id}#map`}
              className="rounded-[12px] border border-[#2A2E3B] px-6 py-3 font-[Space_Grotesk] text-[14px] font-semibold tracking-[0.01em] text-[#F5F6FA] hover:bg-white/5"
            >
              Ver no mapa
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

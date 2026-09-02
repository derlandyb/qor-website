import type { CSSProperties } from "react";
import { CITY_LABELS, type City } from "../../lib/enums/city";
import type { EventStatus } from "../../lib/enums/event-status";
import { GenreTag } from "./GenreTagSet";
import { LivePulseBadge } from "./LivePulseBadge";
import { PlaceholderImage } from "./PlaceholderImage";
import { CtaButton } from "./CtaButton";

const MONTH_LABELS = [
  "JAN",
  "FEV",
  "MAR",
  "ABR",
  "MAI",
  "JUN",
  "JUL",
  "AGO",
  "SET",
  "OUT",
  "NOV",
  "DEZ",
];

export interface EventCardProps {
  title: string;
  flyerUrl: string | null;
  startsAt: string;
  status: EventStatus;
  venueName: string;
  city: City;
  genre: string;
  mapsUrl: string;
  instagramUrl: string;
  /** Position in the render loop — drives card-enter's per-card stagger delay via --card-index. */
  index: number;
}

/**
 * design-system.md §4.1, ported near-verbatim. `isLive` (status published +
 * starts_at already in the past) shows LivePulseBadge instead of the date
 * badge — qor-api's Event has no explicit "happening right now"/ends_at
 * field, so this is a deliberate heuristic, not a fabricated API contract
 * (confirmed with the user rather than guessed).
 */
export function EventCard({
  title,
  flyerUrl,
  startsAt,
  status,
  venueName,
  city,
  genre,
  mapsUrl,
  instagramUrl,
  index,
}: EventCardProps) {
  const startsAtDate = new Date(startsAt);
  // The live/date-badge choice is *supposed* to change as real time passes —
  // that's the whole point of the heuristic (see this file's own docblock),
  // not a memoization hazard to design around.
  // eslint-disable-next-line react-hooks/purity
  const isLive = status === "published" && startsAtDate.getTime() <= Date.now();
  const month = MONTH_LABELS[startsAtDate.getMonth()];
  const day = startsAtDate.getDate();
  const time = startsAtDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const dayOfWeek = startsAtDate.toLocaleDateString("pt-BR", { weekday: "short" });

  return (
    <article
      style={{ "--card-index": index } as CSSProperties}
      className="animate-card-enter group relative flex flex-col bg-[#1B1E29] border border-[#2A2E3B] rounded-2xl overflow-hidden transition-transform duration-250 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.03] hover:-translate-y-1 hover:shadow-[0_12px_32px_-8px_rgba(255,46,126,0.25)]"
    >
      <div className="relative w-full aspect-[4/5] rounded-t-[14px] overflow-hidden bg-[#12141D]">
        {flyerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- flyer source is arbitrary organizer-uploaded media, not a static local asset
          <img
            src={flyerUrl}
            alt={`${title} flyer`}
            className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-105"
          />
        ) : (
          <PlaceholderImage />
        )}

        {isLive ? (
          <div className="absolute top-3 left-3">
            <LivePulseBadge />
          </div>
        ) : (
          <div className="absolute top-3 left-3 flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-[#0B0D14]/80 backdrop-blur-sm border border-white/10">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[#9A9FB0] leading-none">
              {month}
            </span>
            <span className="text-lg font-bold text-[#F5F6FA] leading-none font-[Space_Grotesk]">
              {day}
            </span>
          </div>
        )}

        <div className="absolute top-3 right-3">
          <GenreTag name={genre} />
        </div>
      </div>

      <div className="flex flex-col gap-2 p-4">
        <h3 className="font-[Space_Grotesk] font-bold text-[22px] leading-[1.15] tracking-[-0.01em] text-[#F5F6FA] line-clamp-2">
          {title}
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-semibold text-[15px] text-[#F5F6FA]">{venueName}</span>
            <span className="text-[13px] text-[#9A9FB0]">
              {time}, {dayOfWeek}
            </span>
          </div>
          <span className="px-2 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-[#2EC5FF]/15 text-[#2EC5FF] whitespace-nowrap">
            {CITY_LABELS[city]}
          </span>
        </div>

        <div className="flex gap-2 mt-2">
          <CtaButton variant="map" href={mapsUrl} />
          <CtaButton variant="instagram" href={instagramUrl} />
        </div>
      </div>
    </article>
  );
}

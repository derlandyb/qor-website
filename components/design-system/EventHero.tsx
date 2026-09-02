import type { Event } from "../../lib/api/types";
import { GenreTag } from "./GenreTagSet";

const ICON_BUTTON_CLASSES =
  "flex h-10 w-10 items-center justify-center rounded-full bg-[#0B0D14]/60 backdrop-blur-sm border border-white/10 text-[#F5F6FA] transition-colors hover:bg-[#0B0D14]/80 disabled:opacity-40 disabled:hover:bg-[#0B0D14]/60";

export interface EventHeroProps {
  event: Event;
  /** Called when the back icon button is clicked — caller (Task 9) wires router.back() or similar. */
  onBack: () => void;
  /** Called when the share icon button is clicked — caller (Task 9) wires the page's existing shareEvent() logic. */
  onShare: () => void;
  /** Omitted (no genre pill rendered) when unset — qor-api's Event only has a raw genre_id, no resolvable name yet (no genre-list endpoint). */
  genre?: string;
}

/**
 * Detail page's full-bleed hero (the "Ben Platt card" treatment from the
 * approved mockup) — replaces the small flyer box on /eventos/[id]. This
 * component only renders what it's given and delegates its actions via
 * props; wiring into the page happens in Task 9.
 */
export function EventHero({ event, onBack, onShare, genre }: EventHeroProps) {
  return (
    <section className="relative w-full min-h-[480px] overflow-hidden">
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

      <div className="relative z-10 flex items-center justify-between px-4 pt-6 sm:px-8">
        <button type="button" onClick={onBack} aria-label="Voltar" className={ICON_BUTTON_CLASSES}>
          <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M15 18l-6-6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            disabled
            aria-label="Favoritar (em breve)"
            className={ICON_BUTTON_CLASSES}
          >
            <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                d="M12 21s-7.5-4.6-10-9.1C.6 8.9 2 5 5.6 5c2 0 3.4 1.1 4.4 2.6C11 6.1 12.4 5 14.4 5 18 5 19.4 8.9 22 11.9 19.5 16.4 12 21 12 21z"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button type="button" onClick={onShare} aria-label="Compartilhar" className={ICON_BUTTON_CLASSES}>
            <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4-4 4M12 2v14"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="relative z-10 flex min-h-[480px] flex-col justify-end gap-3 px-4 pb-8 pt-24 sm:px-8">
        {genre && (
          <div>
            <GenreTag name={genre} />
          </div>
        )}

        <h1 className="font-[Space_Grotesk] text-[32px] font-bold leading-[1.05] tracking-[-0.01em] text-[#F5F6FA] sm:text-[44px]">
          {event.title}
        </h1>

        {event.address && <p className="text-[15px] text-[#9A9FB0]">{event.address}</p>}
      </div>
    </section>
  );
}

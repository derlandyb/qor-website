/**
 * design-system.md §4.3 — 5-genre color table, ported near-verbatim. Genres
 * are a DB-backed lookup table (ARCHITECTURE §14.1, no genre-list endpoint
 * exists yet — STATE.md Todo), so this keys off the genre's display NAME,
 * not a numeric genre_id; an unrecognized name (any genre beyond these 5)
 * falls back to a neutral outline style rather than guessing a color.
 */
const TAG_CLASSES = "px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider font-[Space_Grotesk]";

export const KNOWN_GENRES = ["Rock", "Samba", "Sertanejo", "Eletrônico", "Reggae"] as const;
export type KnownGenre = (typeof KNOWN_GENRES)[number];

const GENRE_COLOR_CLASSES: Record<KnownGenre, string> = {
  Rock: "bg-[#FF8A1E]/15 text-[#FF8A1E]",
  Samba: "bg-[#FF2E7E]/15 text-[#FF2E7E]",
  Sertanejo: "bg-[#FF2E7E] text-[#12141D]",
  Eletrônico: "bg-[#B14EFF]/15 text-[#B14EFF]",
  Reggae: "bg-[#2EC5FF]/15 text-[#2EC5FF]",
};

const FALLBACK_CLASSES = "bg-transparent border border-[#2A2E3B] text-[#9A9FB0]";

function isKnownGenre(name: string): name is KnownGenre {
  return (KNOWN_GENRES as readonly string[]).includes(name);
}

export interface GenreTagProps {
  name: string;
}

export function GenreTag({ name }: GenreTagProps) {
  const colorClasses = isKnownGenre(name) ? GENRE_COLOR_CLASSES[name] : FALLBACK_CLASSES;
  return <span className={`${TAG_CLASSES} ${colorClasses}`}>{name}</span>;
}

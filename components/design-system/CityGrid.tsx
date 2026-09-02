import type { CSSProperties } from "react";
import Link from "next/link";
import { CITY_VALUES, CITY_LABELS, CITY_ACCENT, type CityAccent } from "../../lib/enums/city";

/**
 * design-system.md §4.2's hub-color table, ported near-verbatim from
 * CityFilterBar's ACCENT_ACTIVE_CLASSES — every class string below must
 * appear literally in source (not built from a template string) for
 * Tailwind's static scanner to generate the corresponding utility. Dark
 * text except Cariacica's purple (white text per the table).
 */
const ACCENT_TILE_CLASSES: Record<CityAccent, string> = {
  pink: "bg-[#FF2E7E] text-[#0B0D14]",
  blue: "bg-[#2EC5FF] text-[#0B0D14]",
  orange: "bg-[#FF8A1E] text-[#0B0D14]",
  purple: "bg-[#B14EFF] text-white",
};

/**
 * design-system.md's city hub grid — one tile per CITY_VALUES, linking
 * straight into /eventos pre-filtered to that city. No per-city event
 * counts: qor-api's public events-list endpoint doesn't cheaply expose
 * that, so fabricating copy like "12 eventos" would be misleading.
 */
export function CityGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 px-4">
      {CITY_VALUES.map((city, index) => (
        <Link
          key={city}
          href={`/eventos?city=${city}`}
          style={{ "--card-index": index } as CSSProperties}
          className={`animate-card-enter flex items-center justify-center rounded-2xl p-6 font-[Space_Grotesk] text-[18px] font-bold transition-transform duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-[1.03] ${ACCENT_TILE_CLASSES[CITY_ACCENT[city]]}`}
        >
          {CITY_LABELS[city]}
        </Link>
      ))}
    </div>
  );
}

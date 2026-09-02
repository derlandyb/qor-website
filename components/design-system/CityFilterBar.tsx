"use client";

import { CITY_VALUES, CITY_LABELS, CITY_ACCENT, type City, type CityAccent } from "../../lib/enums/city";

const BASE_CLASSES =
  "px-4 py-2 rounded-full text-[12px] font-semibold uppercase tracking-wide font-[Space_Grotesk] transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)]";

/**
 * design-system.md §4.2's hub-color table, ported near-verbatim — every
 * class string below must appear literally in source (not built from a
 * template string) for Tailwind's static scanner to generate the
 * corresponding utility. Active: solid fill + scale-105, dark text except
 * Cariacica's purple (white text per the table). Inactive: 15%-tint bg,
 * accent text, 25%-tint on hover.
 */
const ACCENT_ACTIVE_CLASSES: Record<CityAccent, string> = {
  pink: "bg-[#FF2E7E] text-[#0B0D14] scale-105",
  blue: "bg-[#2EC5FF] text-[#0B0D14] scale-105",
  orange: "bg-[#FF8A1E] text-[#0B0D14] scale-105",
  purple: "bg-[#B14EFF] text-white scale-105",
};

const ACCENT_INACTIVE_CLASSES: Record<CityAccent, string> = {
  pink: "bg-[#FF2E7E]/15 text-[#FF2E7E] hover:bg-[#FF2E7E]/25",
  blue: "bg-[#2EC5FF]/15 text-[#2EC5FF] hover:bg-[#2EC5FF]/25",
  orange: "bg-[#FF8A1E]/15 text-[#FF8A1E] hover:bg-[#FF8A1E]/25",
  purple: "bg-[#B14EFF]/15 text-[#B14EFF] hover:bg-[#B14EFF]/25",
};

export interface CityFilterBarProps {
  activeCity: City;
  onSelect: (city: City) => void;
}

/** design-system.md §4.2, ported near-verbatim. */
export function CityFilterBar({ activeCity, onSelect }: CityFilterBarProps) {
  return (
    <nav className="flex flex-wrap gap-2 px-4 py-3 overflow-x-auto">
      {CITY_VALUES.map((city) => {
        const isActive = city === activeCity;
        const accent = CITY_ACCENT[city];
        const stateClasses = isActive ? ACCENT_ACTIVE_CLASSES[accent] : ACCENT_INACTIVE_CLASSES[accent];

        return (
          <button
            key={city}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(city)}
            className={`${BASE_CLASSES} ${stateClasses}`}
          >
            {CITY_LABELS[city]}
          </button>
        );
      })}
    </nav>
  );
}

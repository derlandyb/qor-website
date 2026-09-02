/** Mirrors `QOR\App\Domain\Shared\Enum\City` (api/src/Domain/Shared/Enum/City.php). */
export const CITY_VALUES = ["vitoria", "vila_velha", "serra", "cariacica"] as const;
export type City = (typeof CITY_VALUES)[number];

export const CITY_LABELS: Record<City, string> = {
  vitoria: "Vitória",
  vila_velha: "Vila Velha",
  serra: "Serra",
  cariacica: "Cariacica",
};

/** design-system.md §4.2 — hub → accent color mapping for CityFilterBar. */
export type CityAccent = "pink" | "blue" | "orange" | "purple";

export const CITY_ACCENT: Record<City, CityAccent> = {
  vitoria: "pink",
  vila_velha: "blue",
  serra: "orange",
  cariacica: "purple",
};

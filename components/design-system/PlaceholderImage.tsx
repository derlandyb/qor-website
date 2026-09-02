/**
 * Fallback for EventCard's image holder (and anywhere else a flyer/artist
 * photo is missing) — matches the image holder's own dark surface
 * (design-system.md §4.1's `bg-[#12141D]`) rather than a blank box.
 */
export function PlaceholderImage() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#12141D] text-[#666B7D]">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-10 w-10"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    </div>
  );
}

export interface MarqueeProps {
  /** Short text items to display, repeated end-to-end along the ticker. */
  items: string[];
}

/**
 * Decorative, infinite-scroll horizontal ticker (design-system.md's motion
 * showcase — no fixed content of its own, callers supply `items`, e.g.
 * the home page's city names + taglines). The track renders `items` twice
 * back-to-back and animates translateX(-50%) via .animate-marquee, so the
 * duplicate seamlessly continues the original with no visible seam.
 * aria-hidden because it's purely decorative motion, not content.
 */
export function Marquee({ items }: MarqueeProps) {
  return (
    <div aria-hidden="true" className="overflow-hidden">
      <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap">
        {[...items, ...items].map((item, index) => (
          <span
            key={index}
            className="font-[Space_Grotesk] text-[14px] font-semibold uppercase tracking-wide text-[#9A9FB0]"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

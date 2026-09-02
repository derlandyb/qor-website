/**
 * design-system.md §4.4 — both CTA button variants ported near-verbatim.
 * Both deep-link out of the app (no in-app checkout): `target="_blank"
 * rel="noopener"`. 44px min height + rounded-xl (12px) per §4.4's closing
 * note; full-width (`flex-1`) when paired in a card's CTA row.
 */
export type CtaButtonVariant = "map" | "instagram";

const VARIANT_CLASSES: Record<CtaButtonVariant, string> = {
  map: "bg-[#2EC5FF]/10 border border-[#2EC5FF]/30 text-[#2EC5FF] transition-all duration-250 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:bg-[#2EC5FF] hover:text-[#0B0D14] hover:scale-[1.03]",
  instagram:
    "bg-gradient-to-r from-[#FF2E7E] to-[#B14EFF] bg-[length:200%_100%] bg-left text-white transition-[background-position,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-right hover:scale-[1.03]",
};

const VARIANT_LABEL: Record<CtaButtonVariant, string> = {
  map: "Ver no Mapa",
  instagram: "Ver Instagram",
};

export interface CtaButtonProps {
  variant: CtaButtonVariant;
  href: string;
}

export function CtaButton({ variant, href }: CtaButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className={`flex flex-1 min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-[Space_Grotesk] text-[14px] font-semibold tracking-[0.01em] ${VARIANT_CLASSES[variant]}`}
    >
      <svg className="w-4 h-4" aria-hidden="true" />
      {VARIANT_LABEL[variant]}
    </a>
  );
}

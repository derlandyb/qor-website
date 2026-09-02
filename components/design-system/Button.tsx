import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-[#FF2E7E] text-white hover:bg-[#FF2E7E]/90",
  secondary: "bg-transparent border border-[#2A2E3B] text-[#F5F6FA] hover:bg-white/5",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

/**
 * Plain form-submission button (CtaButton is anchor-only, for the two
 * deep-link CTAs per design-system.md §4.4) — primary uses the system's
 * "Primary CTA" accent (--accent-pink per §2.1's color-role table).
 */
export function Button({ variant = "primary", className = "", ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={`w-full rounded-[12px] px-4 py-2.5 font-[Space_Grotesk] text-[14px] font-semibold tracking-[0.01em] ${VARIANT_CLASSES[variant]} ${className}`}
    />
  );
}

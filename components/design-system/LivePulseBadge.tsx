/**
 * design-system.md §3 — "ao vivo agora" live-pulse dot, the system's one
 * continuous-loop animation. Replaces EventCard's date badge slot when an
 * event is currently live (see EventCard.tsx's isLive heuristic).
 */
export function LivePulseBadge() {
  return (
    <div className="flex items-center gap-1.5 rounded-lg bg-[#0B0D14]/80 px-2.5 py-1.5 backdrop-blur-sm border border-white/10">
      <span
        aria-hidden
        className="h-2 w-2 shrink-0 rounded-full bg-[#FF2E7E] animate-pulse-glow"
      />
      <span className="text-[10px] font-semibold uppercase tracking-wide text-[#FF2E7E] font-[Space_Grotesk]">
        Ao Vivo
      </span>
    </div>
  );
}

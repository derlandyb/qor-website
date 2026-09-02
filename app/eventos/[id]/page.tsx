"use client";

/**
 * W17 — event detail (DISC-07-13; Stitch screen
 * 391ebe25bee544b89dc309283b2b9008). Next.js 16 App Router: `params` is a
 * Promise — resolved via useEffect/useState (see qor-admin's own
 * eventos/[id]/editar page for why, same rationale applies here).
 *
 * Cancelled/ended events render a banner instead of full content
 * (event-discovery/design.md's Error Handling table) — the ticket button
 * is hidden in both cases, per that table's "instead of full content"
 * wording (the safest reading; not explicitly spelled out further).
 */
import { useEffect, useState } from "react";
import { CtaButton } from "../../../components/design-system/CtaButton";
import { GoogleMap } from "../../../components/design-system/GoogleMap";
import { PlaceholderImage } from "../../../components/design-system/PlaceholderImage";
import { useEventDetail } from "../../../hooks/useEvents";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-6 p-4">
      <p className="text-sm text-[#9A9FB0]">Carregando...</p>
    </div>
  );
}

async function shareEvent(title: string, url: string): Promise<"shared" | "copied" | "failed"> {
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
      return "shared";
    } catch {
      return "failed";
    }
  }
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(url);
    return "copied";
  }
  return "failed";
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const [id, setId] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    params.then((resolved) => {
      if (active) setId(resolved.id);
    });
    return () => {
      active = false;
    };
  }, [params]);

  const { event, loading, error } = useEventDetail(id === null ? 0 : Number(id));

  async function handleShare() {
    if (!event) return;
    const result = await shareEvent(event.title, window.location.href);
    setShareFeedback(result === "copied" ? "Link copiado!" : null);
  }

  if (id === null || loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6 p-4">
        <p role="alert" className="text-sm text-[#FF4D4D]">
          {error}
        </p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col gap-6 p-4">
        <p className="text-sm text-[#9A9FB0]">Evento não encontrado.</p>
      </div>
    );
  }

  if (event.status === "cancelled" || event.status === "ended") {
    return (
      <div className="flex flex-col gap-6 p-4">
        <h1 className="font-[Space_Grotesk] text-[22px] font-bold text-[#F5F6FA]">{event.title}</h1>
        <p role="status" className="rounded-[12px] bg-[#FF4D4D]/15 px-4 py-3 text-sm text-[#FF4D4D]">
          {event.status === "cancelled" ? "Evento cancelado" : "Este evento já aconteceu."}
        </p>
      </div>
    );
  }

  const startsAtDate = new Date(event.starts_at);

  return (
    <div className="flex flex-col gap-4 pb-12">
      <div className="relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-[14px] bg-[#12141D]">
        {event.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- flyer source is arbitrary organizer-uploaded media
          <img src={event.cover_image_url} alt={`${event.title} flyer`} className="h-full w-full object-cover" />
        ) : (
          <PlaceholderImage />
        )}
      </div>

      <div className="flex flex-col gap-3 px-4">
        <h1 className="font-[Space_Grotesk] text-[22px] font-bold text-[#F5F6FA]">{event.title}</h1>

        <div className="flex flex-wrap gap-4 text-[13px] text-[#9A9FB0]">
          <span>{startsAtDate.toLocaleDateString("pt-BR", { dateStyle: "long" })}</span>
          <span>{startsAtDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
          <span>{event.is_free ? "Gratuito" : "Pago"}</span>
        </div>

        <p className="text-[14px] text-[#F5F6FA]">{event.description}</p>

        <div className="flex gap-2">
          {!event.is_free && event.ticket_url && <CtaButton variant="map" href={event.ticket_url} />}
          <button
            type="button"
            onClick={() => void handleShare()}
            className="flex-1 rounded-[12px] border border-[#2A2E3B] px-4 py-2.5 text-[14px] font-semibold text-[#F5F6FA] hover:bg-white/5"
          >
            Compartilhar
          </button>
        </div>
        {shareFeedback && (
          <p role="status" className="text-[13px] text-[#2EC5FF]">
            {shareFeedback}
          </p>
        )}

        {event.address && (
          <div className="flex flex-col gap-2">
            <p className="text-[13px] text-[#9A9FB0]">{event.address}</p>
            <GoogleMap address={event.address} />
          </div>
        )}

        {event.tagged_promoters.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-[15px] font-semibold text-[#F5F6FA]">Organizadores</h2>
            {event.tagged_promoters.map((promoter) => (
              <div key={promoter.id} className="flex flex-col gap-1 rounded-[12px] border border-[#2A2E3B] p-3">
                <span className="text-[14px] font-semibold text-[#F5F6FA]">{promoter.name}</span>
                {promoter.instagram && (
                  <a
                    href={`https://instagram.com/${promoter.instagram.replace(/^@/, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] text-[#2EC5FF] underline"
                  >
                    {promoter.instagram}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

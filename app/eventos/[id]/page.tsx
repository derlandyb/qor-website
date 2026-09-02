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
import { useRouter } from "next/navigation";
import { CtaButton } from "../../../components/design-system/CtaButton";
import { EventCarousel } from "../../../components/design-system/EventCarousel";
import { EventHero } from "../../../components/design-system/EventHero";
import { GoogleMap } from "../../../components/design-system/GoogleMap";
import { useEventDetail, useEventList } from "../../../hooks/useEvents";
import { CITY_LABELS } from "../../../lib/enums/city";

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
  const router = useRouter();
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

  const { event, loading, error } = useEventDetail(id === null ? null : Number(id));
  // Called unconditionally (rules of hooks) even before `event` resolves —
  // `city: undefined` just fetches the unfiltered list until the detail
  // fetch resolves and the effect re-fires with the real city.
  const { events: cityEvents } = useEventList({ city: event?.city });

  // "Ver no mapa" links to `#map`, but this page renders a loading state
  // until `event` resolves, so the `#map` element doesn't exist yet when
  // the browser/router first tries to scroll to it. Once `event` is
  // populated (and the map section renders), scroll to it manually.
  useEffect(() => {
    if (!event) return;
    if (window.location.hash === "#map") {
      document.getElementById("map")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [event]);

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
  const hasTicketButton = !event.is_free && Boolean(event.ticket_url);
  const otherCityEvents = Array.isArray(cityEvents)
    ? cityEvents.filter((candidate) => candidate.id !== event.id)
    : [];

  return (
    <div className="flex flex-col gap-6 pb-12">
      <EventHero event={event} onBack={() => router.back()} onShare={() => void handleShare()} />

      <div className="flex flex-col gap-3 px-4 sm:px-8">
        <div className="flex flex-wrap gap-4 text-[13px] text-[#9A9FB0]">
          <span>{startsAtDate.toLocaleDateString("pt-BR", { dateStyle: "long" })}</span>
          <span>{startsAtDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
          <span>{event.is_free ? "Gratuito" : "Pago"}</span>
        </div>

        {shareFeedback && (
          <p role="status" className="text-[13px] text-[#2EC5FF]">
            {shareFeedback}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-6 px-4 sm:px-8 lg:grid lg:grid-cols-3 lg:items-start lg:gap-8">
        <div className="flex flex-col gap-3 lg:col-span-2">
          <p className="text-[14px] text-[#F5F6FA]">{event.description}</p>

          {event.address && (
            <div id="map" className="flex flex-col gap-2">
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

        {hasTicketButton && event.ticket_url && (
          <aside className="lg:col-span-1">
            <div className="flex flex-col gap-3 rounded-[14px] border border-[#2A2E3B] p-4 lg:sticky lg:top-24">
              <span className="text-[13px] text-[#9A9FB0]">
                {startsAtDate.toLocaleDateString("pt-BR", { dateStyle: "long" })}
              </span>
              <CtaButton variant="map" href={event.ticket_url} />
            </div>
          </aside>
        )}
      </div>

      {otherCityEvents.length > 0 && (
        <div className="flex flex-col gap-3 px-4 sm:px-8">
          <h2 className="text-[15px] font-semibold text-[#F5F6FA]">Mais eventos em {CITY_LABELS[event.city]}</h2>
          <EventCarousel events={otherCityEvents} />
        </div>
      )}
    </div>
  );
}

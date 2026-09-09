"use client";

/**
 * T21 — Favoritos (FAVUI-01..04). Auth-gated by lib/api/http.ts's
 * PUBLIC_PATHS pattern: `/favoritos` isn't public, so a 401 from
 * useFavorites' background `/profile/favorites` fetch redirects the
 * unauthenticated visitor to /entrar as a side effect (same mechanism
 * app/perfil/page.tsx already relies on — no separate route-guard needed).
 * Reuses EventCard/EmptyState per Stitch's "Meus Favoritos" layout; each
 * card gets its own "Remover dos favoritos" action since EventCard itself
 * carries no favorite-toggle affordance yet (out of this task's scope —
 * see tasks.md T21's Where/Reuses).
 */
import Link from "next/link";
import { EventCard } from "../../components/design-system/EventCard";
import { EmptyState } from "../../components/design-system/EmptyState";
import { useFavorites } from "../../hooks/useFavorites";

export default function FavoritosPage() {
  const { events, loading, error, removeFavorite } = useFavorites();

  return (
    <main className="flex flex-col gap-4 pb-12">
      <div className="px-4 pt-4">
        <h1 className="font-[Space_Grotesk] text-[22px] font-bold text-[#F5F6FA]">Meus Favoritos</h1>
      </div>

      {error && (
        <p role="alert" className="px-4 text-sm text-[#FF4D4D]">
          {error}
        </p>
      )}

      {loading ? (
        <p className="px-4 text-sm text-[#9A9FB0]">Carregando...</p>
      ) : events.length === 0 ? (
        <EmptyState message="Você ainda não favoritou nenhum evento." />
      ) : (
        <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event, index) => (
            <div key={event.id} className="flex flex-col gap-2">
              <Link href={`/eventos/${event.id}`}>
                <EventCard
                  title={event.title}
                  flyerUrl={event.cover_image_url}
                  startsAt={event.starts_at}
                  status={event.status}
                  location={event.address}
                  city={event.city}
                  genre={event.genre}
                  index={index}
                />
              </Link>
              <button
                type="button"
                onClick={() => {
                  // useFavorites already reconciles error/rollback state on
                  // failure — this click handler just needs to not leave an
                  // unhandled rejection behind.
                  removeFavorite(event.id).catch(() => {});
                }}
                className="text-left text-[13px] text-[#FF2E7E] underline"
              >
                Remover dos favoritos
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

/**
 * T21 — Favoritos hook wrapping lib/api/client.ts's `/profile/favorites`
 * (list) and `/events/{id}/favorite` (toggle) endpoints. `removeFavorite`
 * is the Favoritos list's only toggle surface (FAVUI-01's optimistic-toggle
 * AC and FAVUI-04's "remove without a full reload" AC collapse into the
 * same action here): the item is optimistically dropped from `events`
 * immediately, then reconciled — per design.md's Error Handling Strategy
 * ("Favorite toggle fails... rolls back to server-confirmed state on
 * error") — by restoring the pre-toggle list if the request fails.
 */
import { useCallback, useEffect, useState } from "react";
import { getFavorites, toggleFavorite } from "../lib/api/client";
import { ApiError, UnauthenticatedError } from "../lib/api/http";
import type { Event } from "../lib/api/types";

function messageOf(err: unknown): string {
  return err instanceof ApiError ? err.message : "Erro inesperado.";
}

export interface Favorites {
  events: Event[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  removeFavorite: (id: number) => Promise<void>;
}

export function useFavorites(): Favorites {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getFavorites();
      setEvents(result.data);
    } catch (err) {
      // An unauthenticated visitor never reaches this hook in practice —
      // http.ts's 401 handling already redirects to /entrar before this
      // resolves — but guard the same way useSession does regardless.
      if (!(err instanceof UnauthenticatedError)) {
        setError(messageOf(err));
      }
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refetch();
  }, [refetch]);

  const removeFavorite = useCallback(
    async (id: number) => {
      const previous = events;
      setEvents((current) => current.filter((event) => event.id !== id));
      setError(null);
      try {
        await toggleFavorite(id);
      } catch (err) {
        setEvents(previous);
        setError(messageOf(err));
        throw err;
      }
    },
    [events],
  );

  return { events, loading, error, refetch, removeFavorite };
}

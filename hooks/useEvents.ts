/**
 * Thin hooks wrapping the public event-discovery endpoints (lib/api/client.ts's
 * listEvents/getEvent). `useEventList` polls per EVENT_LIST_POLLING_INTERVAL_
 * SECONDS (design.md: "short-interval refetch... rather than a websocket/SSE
 * push channel") in addition to a manual refetch, and supports cursor-based
 * pagination via loadMore(). A filter change (city/genre) replaces the whole
 * list from page 1, same as the initial load.
 */
import { useCallback, useEffect, useState } from "react";
import { getEvent, listEvents, type ListEventsFilters } from "../lib/api/client";
import { ApiError } from "../lib/api/http";
import { EVENT_LIST_POLLING_INTERVAL_SECONDS } from "../lib/config";
import type { Event, EventDetail } from "../lib/api/types";

function messageOf(err: unknown): string {
  return err instanceof ApiError ? err.message : "Erro inesperado.";
}

export interface EventList {
  events: Event[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useEventList(filters: ListEventsFilters = {}): EventList {
  const { city, genre } = filters;
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listEvents({ city, genre });
      setEvents(result.data);
      setNextCursor(result.next_cursor);
    } catch (err) {
      setError(messageOf(err));
      setEvents([]);
      setNextCursor(null);
    } finally {
      setLoading(false);
    }
  }, [city, genre]);

  // Fetch-on-mount/filter-change is the intended synchronization with the
  // server-owned event list (not derivable from props/state), same
  // rationale as qor-admin's hooks.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refetch();
  }, [refetch]);

  useEffect(() => {
    const id = setInterval(() => {
      void refetch();
    }, EVENT_LIST_POLLING_INTERVAL_SECONDS * 1000);

    return () => clearInterval(id);
  }, [refetch]);

  const loadMore = useCallback(async () => {
    if (nextCursor === null) return;
    try {
      const result = await listEvents({ city, genre, cursor: nextCursor });
      setEvents((prev) => [...prev, ...result.data]);
      setNextCursor(result.next_cursor);
    } catch (err) {
      setError(messageOf(err));
    }
  }, [city, genre, nextCursor]);

  return { events, loading, error, hasMore: nextCursor !== null, loadMore, refetch };
}

export interface EventDetailState {
  event: EventDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * `id` is `null` until the caller has a real one to fetch (e.g. Next.js 16's
 * async `params` hasn't resolved yet) — skipping the fetch entirely in that
 * case, rather than substituting a placeholder like `0`, avoids a real race:
 * a placeholder-id request and the real-id request can resolve out of
 * order, letting the placeholder's 404 clobber the real event after it
 * already loaded.
 */
export function useEventDetail(id: number | null): EventDetailState {
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (id === null) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getEvent(id);
      setEvent(result.data);
    } catch (err) {
      setError(messageOf(err));
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refetch();
  }, [refetch]);

  return { event, loading: id === null || loading, error, refetch };
}

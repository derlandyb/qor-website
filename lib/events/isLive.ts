import type { EventStatus } from "../enums/event-status";

/**
 * "Happening right now" heuristic (ARCHITECTURE §1.2 — domain logic belongs
 * in lib/, not inline in a component): an event is live when it's published
 * and its starts_at has already passed. qor-api's Event has no explicit
 * `ends_at`/"currently happening" field, so a long-running event shows as
 * live indefinitely until a Super Admin marks it Ended — a real API gap
 * (STATE.md Todo), not something this heuristic can fully solve client-side.
 * User-confirmed as the deliberate stopgap for MVP Core.
 */
export function isEventLive(status: EventStatus, startsAt: string): boolean {
  return status === "published" && new Date(startsAt).getTime() <= Date.now();
}

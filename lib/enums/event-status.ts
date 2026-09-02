/** Mirrors `QOR\App\Domain\Event\Enum\EventStatus` (api/src/Domain/Event/Enum/EventStatus.php). */
export const EVENT_STATUS_VALUES = [
  "draft",
  "pending_review",
  "published",
  "cancelled",
  "ended",
] as const;
export type EventStatus = (typeof EVENT_STATUS_VALUES)[number];

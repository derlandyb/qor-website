import type { City } from "../enums/city";
import type { EventStatus } from "../enums/event-status";

export interface EventPromoter {
  id: number;
  name: string;
  contact_phone: string;
  contact_email: string;
  instagram: string | null;
  tiktok: string | null;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  cover_image_url: string | null;
  starts_at: string;
  city: City;
  genre_id: number;
  address: string | null;
  is_free: boolean;
  ticket_url: string | null;
  capacity: number | null;
  age_rating: string | null;
  notes: string | null;
  status: EventStatus;
}

export interface EventDetail extends Event {
  tagged_promoters: EventPromoter[];
}

export interface CursorPage<T> {
  data: T[];
  next_cursor: string | null;
}

export interface DataEnvelope<T> {
  data: T;
}

export interface MessageEnvelope {
  message: string;
}

export interface FanUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  birthdate: string;
  profile_picture_url: string | null;
  email_verified: boolean;
}

export interface UpdatedFanUser extends FanUser {
  pending_email: string | null;
}

export interface Address {
  city: string;
  state: string;
  street: string;
  number: string;
  complement: string | null;
  source: string;
  radius_km: number;
}

export interface Preferences {
  genre_ids: number[];
  radius_km: number | null;
}

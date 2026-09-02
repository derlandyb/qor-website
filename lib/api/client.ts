/**
 * Typed request builders for every fan-facing `/api/v1` route in
 * api/routes/api_v1.php. One function per endpoint — call sites (hooks, a
 * later session) never build fetch requests directly.
 */
import { apiRequest } from "./http";
import type {
  Address,
  CursorPage,
  DataEnvelope,
  Event,
  EventDetail,
  FanUser,
  MessageEnvelope,
  Preferences,
  UpdatedFanUser,
} from "./types";
import type { City } from "../enums/city";
import type { ConsentType } from "../enums/consent";

// --- Event discovery (public) ---

export interface ListEventsFilters {
  city?: City;
  genre?: number;
  cursor?: string;
}

export function listEvents(filters: ListEventsFilters = {}) {
  return apiRequest<CursorPage<Event>>("/events", {
    query: { city: filters.city, genre: filters.genre, cursor: filters.cursor },
  });
}

export function getEvent(id: number) {
  return apiRequest<DataEnvelope<EventDetail>>(`/events/${id}`);
}

// --- Auth ---

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  birthdate: string;
  phone?: string;
  terms_accepted: true;
}

export function register(payload: RegisterPayload) {
  return apiRequest<DataEnvelope<FanUser>>("/auth/register", {
    method: "POST",
    json: payload,
  });
}

export interface LoginPayload {
  email: string;
  password: string;
}

/** Cookie-based session is established as a side effect; the response's `token` field is intentionally ignored (see lib/api/http.ts). */
export function login(payload: LoginPayload) {
  return apiRequest<DataEnvelope<FanUser> & { token: string }>("/auth/login", {
    method: "POST",
    json: payload,
  });
}

export interface GoogleLoginPayload {
  google_id: string;
  email: string;
  name: string;
  profile_picture_url?: string;
  terms_accepted?: boolean;
}

export function loginWithGoogle(payload: GoogleLoginPayload) {
  return apiRequest<DataEnvelope<FanUser> & { token: string }>("/auth/google", {
    method: "POST",
    json: payload,
  });
}

export function logout() {
  return apiRequest<MessageEnvelope>("/auth/logout", { method: "POST" });
}

export function forgotPassword(email: string) {
  return apiRequest<MessageEnvelope>("/auth/password/forgot", {
    method: "POST",
    json: { email },
  });
}

export interface ResetPasswordPayload {
  email: string;
  token: string;
  password: string;
}

export function resetPassword(payload: ResetPasswordPayload) {
  return apiRequest<MessageEnvelope>("/auth/password/reset", {
    method: "POST",
    json: payload,
  });
}

export function resendVerification(email: string) {
  return apiRequest<MessageEnvelope>("/auth/email/verification-notification", {
    method: "POST",
    json: { email },
  });
}

export function verifyEmailCode(email: string, code: string) {
  return apiRequest<DataEnvelope<FanUser | null>>("/auth/email/verify-code", {
    method: "POST",
    json: { email, code },
  });
}

export function verifyPasswordResetCode(email: string, code: string) {
  return apiRequest<DataEnvelope<{ token: string }>>("/auth/password/verify-code", {
    method: "POST",
    json: { email, code },
  });
}

// --- Profile ---

export function getProfile() {
  return apiRequest<DataEnvelope<FanUser>>("/profile");
}

export interface UpdateProfileFields {
  name?: string;
  phone?: string;
  email?: string;
}

export function updateProfile(fields: UpdateProfileFields) {
  return apiRequest<DataEnvelope<UpdatedFanUser>>("/profile", {
    method: "PATCH",
    json: fields,
  });
}

export function uploadProfilePicture(picture: File) {
  const form = new FormData();
  form.append("picture", picture);
  return apiRequest<DataEnvelope<FanUser>>("/profile/picture", {
    method: "POST",
    form,
  });
}

export function getDataRightsAccess() {
  return apiRequest<DataEnvelope<unknown>>("/profile/data-rights/access");
}

export function exportDataRights() {
  return apiRequest<DataEnvelope<unknown>>("/profile/data-rights/export");
}

export function deleteAccount() {
  return apiRequest<MessageEnvelope>("/profile/data-rights/delete", { method: "POST" });
}

export function revokeConsent(consentType: ConsentType) {
  return apiRequest<MessageEnvelope>("/profile/data-rights/revoke", {
    method: "POST",
    json: { consent_type: consentType },
  });
}

export function getAddress() {
  return apiRequest<DataEnvelope<Address | null>>("/profile/address");
}

export interface UpdateAddressPayload {
  city: string;
  state: string;
  street: string;
  number: string;
  complement?: string;
}

export function updateAddress(payload: UpdateAddressPayload) {
  return apiRequest<DataEnvelope<Address>>("/profile/address", {
    method: "PATCH",
    json: payload,
  });
}

export function getPreferences() {
  return apiRequest<DataEnvelope<Preferences>>("/profile/preferences");
}

export interface UpdatePreferencesPayload {
  genre_ids?: number[];
  radius_km?: number;
}

export function updatePreferences(payload: UpdatePreferencesPayload) {
  return apiRequest<DataEnvelope<Preferences>>("/profile/preferences", {
    method: "PATCH",
    json: payload,
  });
}

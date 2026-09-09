import { renderHook, waitFor, act } from "@testing-library/react";
import { useFavorites } from "./useFavorites";
import * as client from "../lib/api/client";
import { ApiError, UnauthenticatedError } from "../lib/api/http";
import type { City } from "../lib/enums/city";
import type { CursorPage, Event } from "../lib/api/types";

jest.mock("../lib/api/client");

const mockedClient = client as jest.Mocked<typeof client>;

function makeEvent(overrides?: Partial<Event>): Event {
  return {
    id: 1,
    title: "Show",
    description: "desc",
    cover_image_url: null,
    starts_at: "2099-12-31T22:00:00Z",
    city: "vitoria" as City,
    genre_id: 1,
    genre: "Rock",
    address: "Rua das Flores, 100",
    is_free: true,
    ticket_url: null,
    capacity: null,
    age_rating: null,
    notes: null,
    status: "published",
    ...overrides,
  };
}

function makePage(overrides?: Partial<CursorPage<Event>>): CursorPage<Event> {
  return { data: [makeEvent()], next_cursor: null, ...overrides };
}

describe("useFavorites", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("GIVEN the hook mounts WHEN getFavorites resolves THEN it exposes the favorited events", async () => {
    mockedClient.getFavorites.mockResolvedValue(makePage());

    const { result } = renderHook(() => useFavorites());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.events).toEqual([makeEvent()]);
    expect(result.current.error).toBeNull();
  });

  test("GIVEN no favorites WHEN getFavorites resolves THEN events is an empty array", async () => {
    mockedClient.getFavorites.mockResolvedValue(makePage({ data: [] }));

    const { result } = renderHook(() => useFavorites());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.events).toEqual([]);
  });

  test("GIVEN getFavorites rejects with a non-auth error WHEN the hook mounts THEN it surfaces the ApiError message", async () => {
    mockedClient.getFavorites.mockRejectedValue(new ApiError(500, "Erro interno."));

    const { result } = renderHook(() => useFavorites());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Erro interno.");
    expect(result.current.events).toEqual([]);
  });

  test("GIVEN getFavorites rejects with UnauthenticatedError WHEN the hook mounts THEN it leaves error unset (redirect already handled in http.ts)", async () => {
    mockedClient.getFavorites.mockRejectedValue(new UnauthenticatedError("Não autenticado."));

    const { result } = renderHook(() => useFavorites());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.events).toEqual([]);
  });

  test("GIVEN a favorited event WHEN removeFavorite succeeds THEN the event is removed from the list without a refetch", async () => {
    mockedClient.getFavorites.mockResolvedValue(makePage({ data: [makeEvent({ id: 1 }), makeEvent({ id: 2 })] }));
    mockedClient.toggleFavorite.mockResolvedValue({ data: { event_id: 1, favorited: false } });

    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.events).toHaveLength(2);

    await act(async () => {
      await result.current.removeFavorite(1);
    });

    expect(result.current.events.map((e) => e.id)).toEqual([2]);
    expect(mockedClient.getFavorites).toHaveBeenCalledTimes(1);
  });

  test("GIVEN a favorited event WHEN removeFavorite's toggle request fails THEN the list rolls back to the server-confirmed state", async () => {
    mockedClient.getFavorites.mockResolvedValue(makePage({ data: [makeEvent({ id: 1 }), makeEvent({ id: 2 })] }));
    mockedClient.toggleFavorite.mockRejectedValue(new ApiError(500, "Erro ao remover favorito."));

    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await expect(result.current.removeFavorite(1)).rejects.toThrow();
    });

    expect(result.current.events.map((e) => e.id)).toEqual([1, 2]);
    expect(result.current.error).toBe("Erro ao remover favorito.");
  });
});

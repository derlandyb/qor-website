import { renderHook, waitFor, act } from "@testing-library/react";
import { useEventList, useEventDetail, useMapEvents } from "./useEvents";
import * as client from "../lib/api/client";
import { ApiError } from "../lib/api/http";
import type { City } from "../lib/enums/city";
import type { CursorPage, DataEnvelope, Event, EventDetail, MapEvent } from "../lib/api/types";

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

describe("useEventList", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("GIVEN the hook mounts WHEN listEvents resolves THEN it exposes the events and stops loading", async () => {
    mockedClient.listEvents.mockResolvedValue(makePage());

    const { result } = renderHook(() => useEventList());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.events).toEqual([makeEvent()]);
    expect(result.current.error).toBeNull();
  });

  test("GIVEN an empty result WHEN listEvents resolves THEN events is an empty array", async () => {
    mockedClient.listEvents.mockResolvedValue(makePage({ data: [] }));

    const { result } = renderHook(() => useEventList());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.events).toEqual([]);
  });

  test("GIVEN listEvents rejects WHEN the hook mounts THEN it surfaces the ApiError message", async () => {
    mockedClient.listEvents.mockRejectedValue(new ApiError(500, "Erro interno."));

    const { result } = renderHook(() => useEventList());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Erro interno.");
    expect(result.current.events).toEqual([]);
  });

  test("GIVEN a filter change WHEN city changes THEN it refetches with the new city param", async () => {
    mockedClient.listEvents.mockResolvedValue(makePage());

    const { result, rerender } = renderHook(({ city }) => useEventList({ city }), {
      initialProps: { city: "vitoria" as City },
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    rerender({ city: "serra" as City });
    await waitFor(() =>
      expect(mockedClient.listEvents).toHaveBeenLastCalledWith(
        expect.objectContaining({ city: "serra" }),
      ),
    );
  });

  test("GIVEN a next_cursor WHEN loadMore is called THEN it appends the next page's events", async () => {
    mockedClient.listEvents.mockResolvedValueOnce(makePage({ next_cursor: "abc" }));
    const { result } = renderHook(() => useEventList());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hasMore).toBe(true);

    mockedClient.listEvents.mockResolvedValueOnce(makePage({ data: [makeEvent({ id: 2 })], next_cursor: null }));
    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.events).toHaveLength(2);
    expect(result.current.hasMore).toBe(false);
  });

  test("GIVEN the polling interval elapses WHEN time passes THEN it refetches automatically", async () => {
    jest.useFakeTimers({ legacyFakeTimers: false });
    mockedClient.listEvents.mockResolvedValue(makePage());

    renderHook(() => useEventList());
    await waitFor(() => expect(mockedClient.listEvents).toHaveBeenCalledTimes(1));

    await act(async () => {
      jest.advanceTimersByTime(60_000);
    });
    await waitFor(() => expect(mockedClient.listEvents).toHaveBeenCalledTimes(2));

    jest.useRealTimers();
  });
});

describe("useEventDetail", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  function makeEventDetail(overrides?: Partial<EventDetail>): EventDetail {
    return { ...makeEvent(), tagged_promoters: [], ...overrides };
  }

  test("GIVEN an id WHEN getEvent resolves THEN it exposes the event", async () => {
    mockedClient.getEvent.mockResolvedValue({ data: makeEventDetail() });

    const { result } = renderHook(() => useEventDetail(1));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.event).toEqual(makeEventDetail());
  });

  test("GIVEN getEvent rejects WHEN the hook mounts THEN it surfaces the ApiError message", async () => {
    mockedClient.getEvent.mockRejectedValue(new ApiError(404, "Evento não encontrado."));

    const { result } = renderHook(() => useEventDetail(999));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Evento não encontrado.");
    expect(result.current.event).toBeNull();
  });
});

function makeMapEvent(overrides?: Partial<MapEvent>): MapEvent {
  return { ...makeEvent(), latitude: -20.3, longitude: -40.3, ...overrides };
}

describe("useMapEvents", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("GIVEN a city query WHEN getMapEvents resolves THEN it exposes the geocoded events", async () => {
    mockedClient.getMapEvents.mockResolvedValue({ data: [makeMapEvent()] } as DataEnvelope<MapEvent[]>);

    const { result } = renderHook(() => useMapEvents({ city: "vitoria" as City }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.events).toEqual([makeMapEvent()]);
    expect(mockedClient.getMapEvents).toHaveBeenCalledWith({ city: "vitoria", bounds: undefined });
  });

  test("GIVEN getMapEvents rejects WHEN the hook mounts THEN it surfaces the ApiError message", async () => {
    mockedClient.getMapEvents.mockRejectedValue(new ApiError(422, "Informe uma cidade ou os quatro limites do mapa."));

    const { result } = renderHook(() => useMapEvents({}));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Informe uma cidade ou os quatro limites do mapa.");
    expect(result.current.events).toEqual([]);
  });

  test("GIVEN a bounds query WHEN the bounds change THEN it re-queries with the new bounds (MAPUI-03)", async () => {
    mockedClient.getMapEvents.mockResolvedValue({ data: [makeMapEvent({ id: 1 })] } as DataEnvelope<MapEvent[]>);

    const { result, rerender } = renderHook(({ bounds }) => useMapEvents({ bounds }), {
      initialProps: { bounds: { north: 1, south: 0, east: 1, west: 0 } },
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockedClient.getMapEvents).toHaveBeenCalledTimes(1);

    mockedClient.getMapEvents.mockResolvedValueOnce({ data: [makeMapEvent({ id: 2 })] } as DataEnvelope<MapEvent[]>);
    rerender({ bounds: { north: 2, south: 1, east: 2, west: 1 } });

    await waitFor(() => expect(mockedClient.getMapEvents).toHaveBeenCalledTimes(2));
    expect(mockedClient.getMapEvents).toHaveBeenLastCalledWith({
      city: undefined,
      bounds: { north: 2, south: 1, east: 2, west: 1 },
    });
    await waitFor(() => expect(result.current.events).toEqual([makeMapEvent({ id: 2 })]));
  });

  test("GIVEN a city query WHEN the city changes THEN it re-queries with the new city (MAPUI-03)", async () => {
    mockedClient.getMapEvents.mockResolvedValue({ data: [] } as unknown as DataEnvelope<MapEvent[]>);

    const { result, rerender } = renderHook(({ city }) => useMapEvents({ city }), {
      initialProps: { city: "vitoria" as City },
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    rerender({ city: "serra" as City });

    await waitFor(() =>
      expect(mockedClient.getMapEvents).toHaveBeenLastCalledWith({ city: "serra", bounds: undefined }),
    );
  });
});

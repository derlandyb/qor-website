/**
 * Integration test for W11's event hooks: unlike useEvents.test.ts (which
 * mocks lib/api/client.ts directly), this exercises the real hook -> client
 * -> http.ts stack against a mocked global fetch.
 */
import { renderHook, waitFor } from "@testing-library/react";
import { useEventList, useEventDetail } from "../useEvents";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("event hooks (integration, real client + http stack)", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("GIVEN a city filter WHEN useEventList() mounts THEN it fetches /events with the city query param", async () => {
    const fetchMock = jest.fn().mockResolvedValue(jsonResponse({ data: [], next_cursor: null }));
    global.fetch = fetchMock;

    const { result } = renderHook(() => useEventList({ city: "vitoria" }));

    await waitFor(() => expect(result.current.loading).toBe(false));

    const [url] = fetchMock.mock.calls.at(-1)!;
    expect(String(url)).toContain("/api/v1/events");
    expect(String(url)).toContain("city=vitoria");
  });

  test("GIVEN an id WHEN useEventDetail() mounts THEN it fetches /events/{id}", async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      jsonResponse({
        data: {
          id: 42,
          title: "Show",
          description: "desc",
          cover_image_url: null,
          starts_at: "2099-12-31T22:00:00Z",
          city: "vitoria",
          genre_id: 1,
          address: "Rua X",
          is_free: true,
          ticket_url: null,
          capacity: null,
          age_rating: null,
          notes: null,
          status: "published",
          tagged_promoters: [],
        },
      }),
    );
    global.fetch = fetchMock;

    const { result } = renderHook(() => useEventDetail(42));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.event?.id).toBe(42);
    const [url] = fetchMock.mock.calls.at(-1)!;
    expect(String(url)).toContain("/api/v1/events/42");
  });

  test("GIVEN a null id WHEN useEventDetail() mounts THEN it never fetches", async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock;

    const { result } = renderHook(() => useEventDetail(null));

    expect(result.current.loading).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  function eventPayload(id: number) {
    return jsonResponse({
      data: {
        id,
        title: `Show ${id}`,
        description: "desc",
        cover_image_url: null,
        starts_at: "2099-12-31T22:00:00Z",
        city: "vitoria",
        genre_id: 1,
        address: "Rua X",
        is_free: true,
        ticket_url: null,
        capacity: null,
        age_rating: null,
        notes: null,
        status: "published",
        tagged_promoters: [],
      },
    });
  }

  test("GIVEN the id changes before the first fetch resolves WHEN both responses arrive out of order THEN the stale one never overwrites the current event", async () => {
    // Same class of race useEventDetail(0)-as-placeholder used to hit: the
    // App Router reuses this hook's mounted instance across a client-side
    // id change without remounting it, so an in-flight fetch for the old id
    // can resolve after the new id's fetch. Here id 5's response resolves
    // deliberately last, after id 7's — the final state must still be 7.
    let resolveFirst!: (r: Response) => void;
    const firstResponse = new Promise<Response>((resolve) => {
      resolveFirst = resolve;
    });
    const fetchMock = jest
      .fn()
      .mockImplementationOnce(() => firstResponse)
      .mockImplementationOnce(() => Promise.resolve(eventPayload(7)));
    global.fetch = fetchMock;

    const { result, rerender } = renderHook(({ id }) => useEventDetail(id), { initialProps: { id: 5 } });
    rerender({ id: 7 });

    await waitFor(() => expect(result.current.event?.id).toBe(7));

    resolveFirst(eventPayload(5));
    await new Promise((r) => setTimeout(r, 0));

    expect(result.current.event?.id).toBe(7);
  });
});

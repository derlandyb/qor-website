import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MapaPage from "./page";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

/**
 * GoogleMap's own rendering (marker creation, click wiring, idle/bounds
 * handling) is covered by components/design-system/GoogleMap.test.tsx
 * against a fake `window.google`. This page test isolates what the page
 * itself owns — building `pins` from the fetched events and wiring
 * onPinClick/onBoundsChanged/city changes to the right query — so it stubs
 * GoogleMap down to its props instead of re-mocking `window.google` here.
 */
jest.mock("../../components/design-system/GoogleMap", () => ({
  GoogleMap: ({
    pins,
    onPinClick,
    onBoundsChanged,
  }: {
    pins: { id: number; lat: number; lng: number; title: string }[];
    onPinClick?: (id: number) => void;
    onBoundsChanged?: (bounds: { north: number; south: number; east: number; west: number }) => void;
  }) => (
    <div data-testid="google-map">
      {pins.map((pin) => (
        <button key={pin.id} type="button" onClick={() => onPinClick?.(pin.id)}>
          {pin.title}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onBoundsChanged?.({ north: 1, south: 0, east: 1, west: 0 })}
      >
        simulate-pan
      </button>
    </div>
  ),
}));

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function baseMapEvent(overrides: Record<string, unknown>): Record<string, unknown> {
  return {
    id: 1,
    title: "Show A",
    description: "desc",
    cover_image_url: null,
    starts_at: "2099-12-31T22:00:00Z",
    city: "vitoria",
    genre_id: 1,
    genre: "Rock",
    address: "Rua A, 100",
    latitude: -20.3,
    longitude: -40.3,
    is_free: true,
    ticket_url: null,
    capacity: null,
    age_rating: null,
    notes: null,
    status: "published",
    ...overrides,
  };
}

describe("app/mapa/page.tsx (mapa, integration)", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    pushMock.mockClear();
  });

  test("GIVEN geocoded events WHEN the page mounts THEN it passes one pin per event to the map, city=vitoria by default (MAPUI-01)", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(jsonResponse({ data: [baseMapEvent({ id: 1, title: "Show A" })] }));
    global.fetch = fetchMock;

    render(<MapaPage />);

    await waitFor(() => expect(screen.getByText("Show A")).toBeInTheDocument());
    const firstCall = fetchMock.mock.calls[0]!;
    expect(String(firstCall[0])).toContain("city=vitoria");
  });

  test("GIVEN a rendered pin WHEN it is clicked THEN it navigates to that event's detail page (MAPUI-02)", async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse({ data: [baseMapEvent({ id: 42, title: "Show A" })] }));

    const user = userEvent.setup();
    render(<MapaPage />);
    await waitFor(() => expect(screen.getByText("Show A")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Show A" }));

    expect(pushMock).toHaveBeenCalledWith("/eventos/42");
  });

  test("GIVEN a city filter change WHEN a new city is selected THEN it re-queries the map endpoint with the new city (MAPUI-03)", async () => {
    const fetchMock = jest.fn().mockResolvedValue(jsonResponse({ data: [] }));
    global.fetch = fetchMock;

    const user = userEvent.setup();
    render(<MapaPage />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole("button", { name: "Serra" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const secondCall = fetchMock.mock.calls[1]!;
    expect(String(secondCall[0])).toContain("city=serra");
  });

  test("GIVEN the map viewport changes WHEN onBoundsChanged fires THEN it re-queries with the new bounds instead of filtering the static fetch (MAPUI-03)", async () => {
    const fetchMock = jest.fn().mockResolvedValue(jsonResponse({ data: [] }));
    global.fetch = fetchMock;

    const user = userEvent.setup();
    render(<MapaPage />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole("button", { name: "simulate-pan" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const secondCall = fetchMock.mock.calls[1]!;
    expect(String(secondCall[0])).toContain("north=1");
    expect(String(secondCall[0])).not.toContain("city=");
  });

  test("GIVEN zero geocoded events in view WHEN the page mounts THEN it shows the empty state (no error) per the Error Handling Strategy", async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse({ data: [] }));

    render(<MapaPage />);

    await waitFor(() =>
      expect(screen.getByText("Nenhum evento encontrado nesta área.")).toBeInTheDocument(),
    );
  });

  test("GIVEN the map endpoint fails WHEN the page mounts THEN it shows the pt-BR error message", async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse({ message: "Erro interno." }, 500));

    render(<MapaPage />);

    await screen.findByText("Erro interno.");
  });
});

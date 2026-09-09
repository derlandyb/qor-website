import { render, screen, waitFor } from "@testing-library/react";
import HubPage from "./page";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function baseEvent(overrides: Record<string, unknown>): Record<string, unknown> {
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
    is_free: true,
    ticket_url: null,
    capacity: null,
    age_rating: null,
    notes: null,
    status: "published",
    ...overrides,
  };
}

function paramsFor(city: string): Promise<{ city: string }> {
  return Promise.resolve({ city });
}

describe("app/hubs/[city]/page.tsx (hub, integration)", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test.each(["vitoria", "vila_velha", "serra", "cariacica"])(
    "GIVEN the %s hub WHEN it mounts THEN it queries GET /events?city=%s and renders only that city's events (HUB-01)",
    async (city) => {
      const fetchMock = jest
        .fn()
        .mockResolvedValue(jsonResponse({ data: [baseEvent({ id: 1, title: "Show A", city })], next_cursor: null }));
      global.fetch = fetchMock;

      render(<HubPage params={paramsFor(city)} />);

      await waitFor(() => expect(screen.getByText("Show A")).toBeInTheDocument());
      const firstCall = fetchMock.mock.calls[0]!;
      expect(String(firstCall[0])).toContain(`city=${city}`);
    },
  );

  test("GIVEN a city with zero published events WHEN the hub mounts THEN it shows the EmptyState (HUB-03)", async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse({ data: [], next_cursor: null }));

    render(<HubPage params={paramsFor("serra")} />);

    await waitFor(() => expect(screen.getByText("Nenhum evento encontrado em Serra.")).toBeInTheDocument());
  });

  test("GIVEN a hub deep-link with no stored city preference WHEN it mounts THEN it still renders that specific city's hub from the URL param", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(jsonResponse({ data: [baseEvent({ id: 1, title: "Show Cariacica", city: "cariacica" })], next_cursor: null }));

    render(<HubPage params={paramsFor("cariacica")} />);

    await waitFor(() => expect(screen.getByRole("heading", { level: 1, name: "Cariacica" })).toBeInTheDocument());
    await screen.findByText("Show Cariacica");
  });

  test("GIVEN an invalid city param WHEN it mounts THEN it shows a pt-BR not-found message instead of crashing", async () => {
    global.fetch = jest.fn();

    render(<HubPage params={paramsFor("nowhere")} />);

    await waitFor(() => expect(screen.getByText("Cidade não encontrada.")).toBeInTheDocument());
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("GIVEN the events request fails WHEN the hub mounts THEN it renders the pt-BR error message", async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse({ message: "Erro interno." }, 500));

    render(<HubPage params={paramsFor("vitoria")} />);

    await screen.findByText("Erro interno.");
  });
});

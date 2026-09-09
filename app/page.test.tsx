/**
 * Integration test for W15's home feed page: exercises the rendered page
 * against a mocked global fetch, same technique as qor-admin's page tests.
 */
import { render, screen, waitFor } from "@testing-library/react";
import HomePage from "./page";

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

describe("app/page.tsx (home feed, integration)", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("GIVEN events WHEN the page mounts THEN it renders the hero, carousel heading, and city grid", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({ data: [baseEvent({ id: 1, title: "Show A" })], next_cursor: null }),
    );

    render(<HomePage />);

    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1, name: "Show A" })).toBeInTheDocument(),
    );
    expect(screen.getByRole("heading", { level: 2, name: "Próximos eventos" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Vitória" })).toBeInTheDocument();
  });

  test("GIVEN events WHEN the page mounts THEN it offers a Hub entry point per city alongside CityGrid's own link (HUB-02)", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({ data: [baseEvent({ id: 1, title: "Show A" })], next_cursor: null }),
    );

    render(<HomePage />);

    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1, name: "Show A" })).toBeInTheDocument(),
    );
    // CityGrid's existing link stays /eventos?city=... — the Hub link is additive, not a replacement.
    expect(screen.getByRole("link", { name: "Vitória" })).toHaveAttribute("href", "/eventos?city=vitoria");
    expect(screen.getByRole("link", { name: "Hub de Vitória" })).toHaveAttribute("href", "/hubs/vitoria");
    expect(screen.getByRole("link", { name: "Hub de Vila Velha" })).toHaveAttribute("href", "/hubs/vila_velha");
    expect(screen.getByRole("link", { name: "Hub de Serra" })).toHaveAttribute("href", "/hubs/serra");
    expect(screen.getByRole("link", { name: "Hub de Cariacica" })).toHaveAttribute("href", "/hubs/cariacica");
  });

  test("GIVEN events WHEN the page mounts THEN useEventList is called without a city filter", async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      jsonResponse({ data: [baseEvent({ id: 1, title: "Show A" })], next_cursor: null }),
    );
    global.fetch = fetchMock;

    render(<HomePage />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    const lastCall = fetchMock.mock.calls.at(-1)!;
    expect(String(lastCall[0])).not.toContain("city=");
  });

  test("GIVEN no events WHEN the page mounts THEN it shows the empty state", async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse({ data: [], next_cursor: null }));

    render(<HomePage />);

    await waitFor(() =>
      expect(screen.getByText("Nenhum evento encontrado.")).toBeInTheDocument(),
    );
  });

  test("GIVEN the events request fails WHEN the page mounts THEN it renders the pt-BR error message", async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse({ message: "Erro ao carregar eventos." }, 500));

    render(<HomePage />);

    await waitFor(() => expect(screen.getByText("Erro ao carregar eventos.")).toBeInTheDocument());
  });

  test("GIVEN events WHEN the page mounts THEN it shows the Stitch landing tagline below the hero (REFRESH-01)", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({ data: [baseEvent({ id: 1, title: "Show A" })], next_cursor: null }),
    );

    render(<HomePage />);

    await waitFor(() =>
      expect(
        screen.getByText(
          "Os melhores shows, baladas, barzinhos e festivais de Vitória, Vila Velha, Serra e Cariacica em um só lugar.",
        ),
      ).toBeInTheDocument(),
    );
  });

  test("GIVEN events WHEN the page mounts THEN it uses no hardcoded colors outside the reconciled token set (REFRESH-02)", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({ data: [baseEvent({ id: 1, title: "Show A" })], next_cursor: null }),
    );

    const { container } = render(<HomePage />);
    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1, name: "Show A" })).toBeInTheDocument(),
    );

    const allowedHexes = [
      "#F5F6FA",
      "#9A9FB0",
      "#666B7D",
      "#2A2E3B",
      "#1B1E29",
      "#12141D",
      "#0B0D14",
      "#FF2E7E",
      "#FF8A1E",
      "#B14EFF",
      "#2EC5FF",
      "#FF4D4D",
    ];
    const hexMatches = container.innerHTML.match(/#[0-9A-Fa-f]{6}/g) ?? [];
    for (const hex of hexMatches) {
      expect(allowedHexes.map((h) => h.toUpperCase())).toContain(hex.toUpperCase());
    }
  });
});

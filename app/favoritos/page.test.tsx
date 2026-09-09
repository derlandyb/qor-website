import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FavoritosPage from "./page";

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

describe("app/favoritos/page.tsx (favoritos, integration)", () => {
  beforeEach(() => {
    document.cookie = "XSRF-TOKEN=token";
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("GIVEN favorited events WHEN the page mounts THEN it renders them via EventCard (FAVUI-02)", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(jsonResponse({ data: [baseEvent({ id: 1, title: "Show A" })], next_cursor: null }));

    render(<FavoritosPage />);

    await waitFor(() => expect(screen.getByText("Show A")).toBeInTheDocument());
  });

  test("GIVEN no favorites WHEN the page mounts THEN it shows the empty state", async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse({ data: [], next_cursor: null }));

    render(<FavoritosPage />);

    await waitFor(() =>
      expect(screen.getByText("Você ainda não favoritou nenhum evento.")).toBeInTheDocument(),
    );
  });

  test("GIVEN a favorited event WHEN 'Remover dos favoritos' is clicked THEN it is removed from the list without a full reload (FAVUI-01, FAVUI-04)", async () => {
    const fetchMock = jest.fn().mockImplementation((input: string | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/sanctum/csrf-cookie")) return Promise.resolve(new Response(null, { status: 204 }));
      if (init?.method === "POST" && url.includes("/favorite")) {
        return Promise.resolve(jsonResponse({ data: { event_id: 1, favorited: false } }));
      }
      return Promise.resolve(
        jsonResponse({ data: [baseEvent({ id: 1, title: "Show A" })], next_cursor: null }),
      );
    });
    global.fetch = fetchMock;

    const user = userEvent.setup();
    render(<FavoritosPage />);
    await waitFor(() => expect(screen.getByText("Show A")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Remover dos favoritos" }));

    await waitFor(() => expect(screen.getByText("Você ainda não favoritou nenhum evento.")).toBeInTheDocument());
    // No second GET to /profile/favorites was needed for the removal itself —
    // only the initial list fetch plus the CSRF bootstrap + toggle POST.
    const favoritesGetCalls = fetchMock.mock.calls.filter(([reqUrl]: [string | URL]) =>
      String(reqUrl).includes("/profile/favorites"),
    );
    expect(favoritesGetCalls).toHaveLength(1);
  });

  test("GIVEN removing a favorite fails WHEN the toggle request rejects THEN the item reappears (rollback) and an error is shown", async () => {
    const fetchMock = jest.fn().mockImplementation((input: string | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/sanctum/csrf-cookie")) return Promise.resolve(new Response(null, { status: 204 }));
      if (init?.method === "POST" && url.includes("/favorite")) {
        return Promise.resolve(jsonResponse({ message: "Erro ao remover favorito." }, 500));
      }
      return Promise.resolve(
        jsonResponse({ data: [baseEvent({ id: 1, title: "Show A" })], next_cursor: null }),
      );
    });
    global.fetch = fetchMock;

    const user = userEvent.setup();
    render(<FavoritosPage />);
    await waitFor(() => expect(screen.getByText("Show A")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Remover dos favoritos" }));

    await waitFor(() => expect(screen.getByText("Erro ao remover favorito.")).toBeInTheDocument());
    expect(screen.getByText("Show A")).toBeInTheDocument();
  });
});

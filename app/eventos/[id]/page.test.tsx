import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EventDetailPage from "./page";

const backMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ back: backMock, push: jest.fn() }),
}));

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function listResponse(events: unknown[]): Response {
  return jsonResponse({ data: events, next_cursor: null });
}

/** Detail requests hit `/events/<id>`; list requests hit `/events` (with or without a `city` query). */
function isDetailRequest(input: string | URL): boolean {
  return /\/events\/\d+/.test(String(input));
}

function baseEvent(overrides: Record<string, unknown>): Record<string, unknown> {
  return {
    id: 1,
    title: "Show A",
    description: "Descrição do show.",
    cover_image_url: null,
    starts_at: "2099-12-31T22:00:00Z",
    city: "vitoria",
    genre_id: 1,
    address: "Rua A, 100",
    is_free: true,
    ticket_url: null,
    capacity: null,
    age_rating: null,
    notes: null,
    status: "published",
    tagged_promoters: [],
    ...overrides,
  };
}

describe("app/eventos/[id]/page.tsx (event detail, integration)", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    backMock.mockClear();
  });

  test("GIVEN a published free event WHEN it renders THEN it shows the details without a ticket button", async () => {
    // .mockImplementation (not .mockResolvedValue) — this page now makes two
    // fetch calls (detail + same-city list) and a `Response` body can only be
    // read once, so each call needs its own fresh instance.
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve(jsonResponse({ data: baseEvent({ title: "Show A" }) })),
    );

    render(<EventDetailPage params={Promise.resolve({ id: "1" })} />);

    await screen.findByText("Show A");
    expect(screen.getByText("Descrição do show.")).toBeInTheDocument();
    expect(screen.getByText("Gratuito")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /ver no mapa/i })).not.toBeInTheDocument();
  });

  test("GIVEN a paid event with a ticket_url WHEN it renders THEN it shows the ticket button", async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve(
        jsonResponse({
          data: baseEvent({ is_free: false, ticket_url: "https://ingressos.example.com/x" }),
        }),
      ),
    );

    render(<EventDetailPage params={Promise.resolve({ id: "1" })} />);

    const ticketLink = await screen.findByRole("link", { name: /ver no mapa/i });
    expect(ticketLink).toHaveAttribute("href", "https://ingressos.example.com/x");
  });

  test("GIVEN a cancelled event WHEN it renders THEN it shows the cancelled banner instead of full content, no ticket button", async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve(
        jsonResponse({
          data: baseEvent({ status: "cancelled", is_free: false, ticket_url: "https://x.com" }),
        }),
      ),
    );

    render(<EventDetailPage params={Promise.resolve({ id: "1" })} />);

    await screen.findByText("Evento cancelado");
    expect(screen.queryByText("Descrição do show.")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /ver no mapa/i })).not.toBeInTheDocument();
  });

  test("GIVEN an ended event WHEN it renders THEN it shows the ended banner instead of full content", async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve(jsonResponse({ data: baseEvent({ status: "ended" }) })),
    );

    render(<EventDetailPage params={Promise.resolve({ id: "1" })} />);

    await screen.findByText("Este evento já aconteceu.");
    expect(screen.queryByText("Descrição do show.")).not.toBeInTheDocument();
  });

  test("GIVEN a promoter with no Instagram field WHEN it renders THEN that field is simply omitted", async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve(
        jsonResponse({
          data: baseEvent({
            tagged_promoters: [
              { id: 1, name: "Produtora X", contact_phone: "1", contact_email: "a@a.com", instagram: null, tiktok: null },
            ],
          }),
        }),
      ),
    );

    render(<EventDetailPage params={Promise.resolve({ id: "1" })} />);

    await screen.findByText("Produtora X");
    expect(screen.queryByRole("link", { name: /instagram/i })).not.toBeInTheDocument();
  });

  test("GIVEN navigator.share is unavailable but clipboard is WHEN Compartilhar is clicked THEN it copies the link and shows feedback", async () => {
    global.fetch = jest.fn().mockImplementation(() => Promise.resolve(jsonResponse({ data: baseEvent({}) })));
    // jsdom has no navigator.share implementation (undefined) but does
    // implement a real navigator.clipboard.writeText — the component's
    // clipboard-fallback branch runs against that real implementation, so
    // this only needs to assert the resulting user-visible feedback, not
    // intercept the browser API call itself.

    const user = userEvent.setup();
    render(<EventDetailPage params={Promise.resolve({ id: "1" })} />);
    await screen.findByText("Show A");

    await user.click(screen.getByRole("button", { name: "Compartilhar" }));

    await screen.findByText("Link copiado!");
  });

  test("GIVEN the same-city carousel has other events WHEN the page renders THEN the section heading and those events' titles appear", async () => {
    global.fetch = jest.fn().mockImplementation((input: string | URL) => {
      if (isDetailRequest(input)) {
        return Promise.resolve(jsonResponse({ data: baseEvent({ title: "Show A" }) }));
      }
      return Promise.resolve(
        listResponse([
          baseEvent({ id: 1, title: "Show A" }),
          baseEvent({ id: 2, title: "Show B" }),
          baseEvent({ id: 3, title: "Show C" }),
        ]),
      );
    });

    render(<EventDetailPage params={Promise.resolve({ id: "1" })} />);

    await screen.findByText("Show A");
    await screen.findByText("Mais eventos em Vitória");
    expect(screen.getByText("Show B")).toBeInTheDocument();
    expect(screen.getByText("Show C")).toBeInTheDocument();
  });

  test("GIVEN the same-city list has only the current event WHEN the page renders THEN no 'Mais eventos em...' section appears", async () => {
    global.fetch = jest.fn().mockImplementation((input: string | URL) => {
      if (isDetailRequest(input)) {
        return Promise.resolve(jsonResponse({ data: baseEvent({ title: "Show A" }) }));
      }
      return Promise.resolve(listResponse([baseEvent({ id: 1, title: "Show A" })]));
    });

    render(<EventDetailPage params={Promise.resolve({ id: "1" })} />);

    await screen.findByText("Show A");
    expect(screen.queryByText(/Mais eventos em/)).not.toBeInTheDocument();
  });

  test("GIVEN the back button in EventHero WHEN clicked THEN router.back is called", async () => {
    global.fetch = jest.fn().mockImplementation((input: string | URL) => {
      if (isDetailRequest(input)) {
        return Promise.resolve(jsonResponse({ data: baseEvent({ title: "Show A" }) }));
      }
      return Promise.resolve(listResponse([]));
    });

    const user = userEvent.setup();
    render(<EventDetailPage params={Promise.resolve({ id: "1" })} />);
    await screen.findByText("Show A");

    await user.click(screen.getByRole("button", { name: "Voltar" }));

    expect(backMock).toHaveBeenCalledTimes(1);
  });

  test("GIVEN the address block renders WHEN it has the #map anchor THEN its wrapper carries id=\"map\"", async () => {
    global.fetch = jest.fn().mockImplementation((input: string | URL) => {
      if (isDetailRequest(input)) {
        return Promise.resolve(jsonResponse({ data: baseEvent({ address: "Rua A, 100" }) }));
      }
      return Promise.resolve(listResponse([]));
    });

    const { container } = render(<EventDetailPage params={Promise.resolve({ id: "1" })} />);

    await screen.findByText("Show A");
    const mapAnchor = container.querySelector("#map");
    expect(mapAnchor).toBeInTheDocument();
    expect(mapAnchor).toHaveTextContent("Rua A, 100");
  });

  test("GIVEN the URL hash is #map WHEN the event finishes loading THEN it scrolls the map element into view", async () => {
    Element.prototype.scrollIntoView = jest.fn();
    window.location.hash = "#map";

    global.fetch = jest.fn().mockImplementation((input: string | URL) => {
      if (isDetailRequest(input)) {
        return Promise.resolve(jsonResponse({ data: baseEvent({ address: "Rua A, 100" }) }));
      }
      return Promise.resolve(listResponse([]));
    });

    render(<EventDetailPage params={Promise.resolve({ id: "1" })} />);

    await screen.findByText("Show A");

    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });

    window.location.hash = "";
  });

  test("GIVEN the URL hash is not #map WHEN the event finishes loading THEN it does not scroll", async () => {
    Element.prototype.scrollIntoView = jest.fn();
    window.location.hash = "";

    global.fetch = jest.fn().mockImplementation((input: string | URL) => {
      if (isDetailRequest(input)) {
        return Promise.resolve(jsonResponse({ data: baseEvent({ address: "Rua A, 100" }) }));
      }
      return Promise.resolve(listResponse([]));
    });

    render(<EventDetailPage params={Promise.resolve({ id: "1" })} />);

    await screen.findByText("Show A");

    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EventDetailPage from "./page";

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
  });

  test("GIVEN a published free event WHEN it renders THEN it shows the details without a ticket button", async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse({ data: baseEvent({ title: "Show A" }) }));

    render(<EventDetailPage params={Promise.resolve({ id: "1" })} />);

    await screen.findByText("Show A");
    expect(screen.getByText("Descrição do show.")).toBeInTheDocument();
    expect(screen.getByText("Gratuito")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /ver no mapa/i })).not.toBeInTheDocument();
  });

  test("GIVEN a paid event with a ticket_url WHEN it renders THEN it shows the ticket button", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({
        data: baseEvent({ is_free: false, ticket_url: "https://ingressos.example.com/x" }),
      }),
    );

    render(<EventDetailPage params={Promise.resolve({ id: "1" })} />);

    const ticketLink = await screen.findByRole("link", { name: /ver no mapa/i });
    expect(ticketLink).toHaveAttribute("href", "https://ingressos.example.com/x");
  });

  test("GIVEN a cancelled event WHEN it renders THEN it shows the cancelled banner instead of full content, no ticket button", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({
        data: baseEvent({ status: "cancelled", is_free: false, ticket_url: "https://x.com" }),
      }),
    );

    render(<EventDetailPage params={Promise.resolve({ id: "1" })} />);

    await screen.findByText("Evento cancelado");
    expect(screen.queryByText("Descrição do show.")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /ver no mapa/i })).not.toBeInTheDocument();
  });

  test("GIVEN an ended event WHEN it renders THEN it shows the ended banner instead of full content", async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse({ data: baseEvent({ status: "ended" }) }));

    render(<EventDetailPage params={Promise.resolve({ id: "1" })} />);

    await screen.findByText("Este evento já aconteceu.");
    expect(screen.queryByText("Descrição do show.")).not.toBeInTheDocument();
  });

  test("GIVEN a promoter with no Instagram field WHEN it renders THEN that field is simply omitted", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({
        data: baseEvent({
          tagged_promoters: [
            { id: 1, name: "Produtora X", contact_phone: "1", contact_email: "a@a.com", instagram: null, tiktok: null },
          ],
        }),
      }),
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
});

/**
 * Integration test for W15's home feed page: exercises the rendered page
 * against a mocked global fetch, same technique as qor-admin's page tests.
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  test("GIVEN events for the default city WHEN the page mounts THEN it renders the event cards", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({ data: [baseEvent({ id: 1, title: "Show A" })], next_cursor: null }),
    );

    render(<HomePage />);

    await waitFor(() => expect(screen.getByText("Show A")).toBeInTheDocument());
  });

  test("GIVEN no events WHEN the page mounts THEN it shows the empty state", async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse({ data: [], next_cursor: null }));

    render(<HomePage />);

    await waitFor(() =>
      expect(screen.getByText("Nenhum evento encontrado para esta cidade.")).toBeInTheDocument(),
    );
  });

  test("GIVEN a city filter click WHEN Serra is selected THEN it refetches with that city", async () => {
    const fetchMock = jest.fn().mockResolvedValue(jsonResponse({ data: [], next_cursor: null }));
    global.fetch = fetchMock;

    render(<HomePage />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    await userEvent.click(screen.getByRole("button", { name: "Serra" }));

    await waitFor(() => {
      const lastCall = fetchMock.mock.calls.at(-1)!;
      expect(String(lastCall[0])).toContain("city=serra");
    });
  });

  test("GIVEN the events request fails WHEN the page mounts THEN it renders the pt-BR error message", async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse({ message: "Erro ao carregar eventos." }, 500));

    render(<HomePage />);

    await waitFor(() => expect(screen.getByText("Erro ao carregar eventos.")).toBeInTheDocument());
  });
});

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSearchParams } from "next/navigation";
import ExplorePage from "./page";

jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
}));

const mockedUseSearchParams = useSearchParams as unknown as jest.Mock<URLSearchParams>;

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

describe("app/eventos/page.tsx (explore, integration)", () => {
  beforeEach(() => {
    mockedUseSearchParams.mockReturnValue(new URLSearchParams());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("GIVEN events WHEN the page mounts THEN it renders the event cards", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(jsonResponse({ data: [baseEvent({ id: 1, title: "Show A" })], next_cursor: null }));

    render(<ExplorePage />);

    await waitFor(() => expect(screen.getByText("Show A")).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: "Carregar mais" })).not.toBeInTheDocument();
  });

  test("GIVEN a next_cursor WHEN more results exist THEN Carregar mais loads the next page", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse({ data: [baseEvent({ id: 1, title: "Show A" })], next_cursor: "abc" }));
    global.fetch = fetchMock;

    render(<ExplorePage />);
    await waitFor(() => expect(screen.getByText("Show A")).toBeInTheDocument());

    fetchMock.mockResolvedValueOnce(
      jsonResponse({ data: [baseEvent({ id: 2, title: "Show B" })], next_cursor: null }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Carregar mais" }));

    await waitFor(() => expect(screen.getByText("Show B")).toBeInTheDocument());
    expect(screen.getByText("Show A")).toBeInTheDocument();
  });

  test("GIVEN no events WHEN the page mounts THEN it shows the empty state", async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse({ data: [], next_cursor: null }));

    render(<ExplorePage />);

    await waitFor(() =>
      expect(screen.getByText("Nenhum evento encontrado para esta cidade.")).toBeInTheDocument(),
    );
  });

  test("GIVEN ?city=serra in the URL WHEN the page mounts THEN the initial fetch request's URL contains city=serra", async () => {
    mockedUseSearchParams.mockReturnValue(new URLSearchParams("city=serra"));
    const fetchMock = jest.fn().mockResolvedValue(jsonResponse({ data: [], next_cursor: null }));
    global.fetch = fetchMock;

    render(<ExplorePage />);

    await waitFor(() => {
      const firstCall = fetchMock.mock.calls[0]!;
      expect(String(firstCall[0])).toContain("city=serra");
    });
  });

  test("GIVEN no city param WHEN the page mounts THEN it falls back to vitoria", async () => {
    mockedUseSearchParams.mockReturnValue(new URLSearchParams());
    const fetchMock = jest.fn().mockResolvedValue(jsonResponse({ data: [], next_cursor: null }));
    global.fetch = fetchMock;

    render(<ExplorePage />);

    await waitFor(() => {
      const firstCall = fetchMock.mock.calls[0]!;
      expect(String(firstCall[0])).toContain("city=vitoria");
    });
  });

  test("GIVEN an invalid city param WHEN the page mounts THEN it falls back to vitoria", async () => {
    mockedUseSearchParams.mockReturnValue(new URLSearchParams("city=nowhere"));
    const fetchMock = jest.fn().mockResolvedValue(jsonResponse({ data: [], next_cursor: null }));
    global.fetch = fetchMock;

    render(<ExplorePage />);

    await waitFor(() => {
      const firstCall = fetchMock.mock.calls[0]!;
      expect(String(firstCall[0])).toContain("city=vitoria");
    });
  });
});

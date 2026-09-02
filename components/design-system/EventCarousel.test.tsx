import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EventCarousel } from "./EventCarousel";
import type { Event } from "../../lib/api/types";

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: 1,
    title: "Baile do Zé",
    description: "desc",
    cover_image_url: null,
    starts_at: "2026-10-10T22:00:00Z",
    city: "vitoria",
    genre_id: 1,
    address: "Rua X, 100",
    is_free: false,
    ticket_url: null,
    capacity: null,
    age_rating: null,
    notes: null,
    status: "published",
    ...overrides,
  };
}

describe("EventCarousel", () => {
  test("GIVEN a list of events WHEN the carousel renders THEN each event's title appears and each is wrapped in a link to the right /eventos/<id> href", () => {
    const events = [
      makeEvent({ id: 1, title: "Baile do Zé" }),
      makeEvent({ id: 2, title: "Show da Maria" }),
    ];

    render(<EventCarousel events={events} />);

    expect(screen.getByText("Baile do Zé")).toBeInTheDocument();
    expect(screen.getByText("Show da Maria")).toBeInTheDocument();

    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveAttribute("href", "/eventos/1");
    expect(links[1]).toHaveAttribute("href", "/eventos/2");
  });

  test("GIVEN a list of events WHEN the carousel renders THEN the scroll container hides its native scrollbar", () => {
    const events = [makeEvent({ id: 1, title: "Baile do Zé" })];

    const { container } = render(<EventCarousel events={events} />);

    const scrollContainer = container.querySelector(".overflow-x-auto");
    expect(scrollContainer).toHaveClass("scrollbar-hide");
  });

  test("GIVEN an empty events array WHEN the carousel renders THEN nothing is rendered", () => {
    const { container } = render(<EventCarousel events={[]} />);

    expect(container.firstChild).toBeNull();
  });

  test("GIVEN the next-arrow WHEN clicked THEN scrollBy is called on the scroll container with smooth behavior", async () => {
    Element.prototype.scrollBy = jest.fn();
    const user = userEvent.setup();
    const events = [makeEvent({ id: 1, title: "Baile do Zé" })];

    render(<EventCarousel events={events} />);

    await user.click(screen.getByRole("button", { name: /próximo/i }));

    expect(Element.prototype.scrollBy).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "smooth" }),
    );
  });

  test("GIVEN the prev-arrow WHEN clicked THEN scrollBy is called on the scroll container with a negative left offset", async () => {
    Element.prototype.scrollBy = jest.fn();
    const user = userEvent.setup();
    const events = [makeEvent({ id: 1, title: "Baile do Zé" })];

    render(<EventCarousel events={events} />);

    await user.click(screen.getByRole("button", { name: /anterior/i }));

    expect(Element.prototype.scrollBy).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "smooth", left: expect.any(Number) }),
    );
    const call = (Element.prototype.scrollBy as jest.Mock).mock.calls[0][0];
    expect(call.left).toBeLessThan(0);
  });
});

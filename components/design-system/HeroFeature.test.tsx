import { render, screen } from "@testing-library/react";
import { HeroFeature } from "./HeroFeature";
import type { Event } from "../../lib/api/types";

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: 1,
    title: "Baile do Zé",
    description: "desc",
    cover_image_url: "https://example.com/flyer.jpg",
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

describe("components/design-system/HeroFeature.tsx", () => {
  test("GIVEN an event with a cover_image_url WHEN rendered THEN the title, address, and both CTAs (with correct hrefs) appear", () => {
    const event = makeEvent({ id: 42, title: "Baile do Zé", address: "Rua X, 100" });

    render(<HeroFeature event={event} />);

    expect(screen.getByText("Baile do Zé")).toBeInTheDocument();
    expect(screen.getByText("Rua X, 100")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ver detalhes/i })).toHaveAttribute("href", "/eventos/42");
    expect(screen.getByRole("link", { name: /ver no mapa/i })).toHaveAttribute("href", "/eventos/42#map");
  });

  test("GIVEN an event with cover_image_url: null WHEN rendered THEN the fallback gradient path renders instead of an image, and the rest of the content still renders correctly", () => {
    const event = makeEvent({ cover_image_url: null, title: "Show sem flyer" });

    render(<HeroFeature event={event} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("Show sem flyer")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ver detalhes/i })).toBeInTheDocument();
  });

  test("GIVEN an event with address: null WHEN rendered THEN the Ver no mapa link is absent and no address subtitle line is rendered", () => {
    const event = makeEvent({ address: null });

    render(<HeroFeature event={event} />);

    expect(screen.queryByRole("link", { name: /ver no mapa/i })).not.toBeInTheDocument();
    expect(screen.queryByText("Rua X, 100")).not.toBeInTheDocument();
  });

  test("GIVEN is_free: true WHEN rendered THEN the meta chip shows Gratuito", () => {
    const event = makeEvent({ is_free: true });

    render(<HeroFeature event={event} />);

    expect(screen.getByText("Gratuito")).toBeInTheDocument();
  });

  test("GIVEN is_free: false WHEN rendered THEN the meta chip shows Pago", () => {
    const event = makeEvent({ is_free: false });

    render(<HeroFeature event={event} />);

    expect(screen.getByText("Pago")).toBeInTheDocument();
  });
});

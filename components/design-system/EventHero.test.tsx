import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Event } from "../../lib/api/types";
import { EventHero } from "./EventHero";

const baseEvent: Event = {
  id: 1,
  title: "Show de Rock",
  description: "Uma noite de rock",
  cover_image_url: "https://cdn.example.com/flyer.jpg",
  starts_at: "2099-12-31T22:00:00Z",
  city: "vitoria",
  genre_id: 1,
  address: "Rua das Flores, 123",
  is_free: false,
  ticket_url: null,
  capacity: null,
  age_rating: null,
  notes: null,
  status: "published",
};

const noop = () => {};

describe("EventHero", () => {
  test("GIVEN an event WHEN rendered THEN the title and address appear", () => {
    render(<EventHero event={baseEvent} onBack={noop} onShare={noop} />);

    expect(screen.getByText("Show de Rock")).toBeInTheDocument();
    expect(screen.getByText("Rua das Flores, 123")).toBeInTheDocument();
  });

  test("GIVEN address: null WHEN rendered THEN no address subtitle renders", () => {
    render(<EventHero event={{ ...baseEvent, address: null }} onBack={noop} onShare={noop} />);

    expect(screen.queryByText("Rua das Flores, 123")).not.toBeInTheDocument();
  });

  test("GIVEN a genre prop WHEN rendered THEN the genre pill appears", () => {
    render(<EventHero event={baseEvent} onBack={noop} onShare={noop} genre="Rock" />);

    expect(screen.getByText("Rock")).toBeInTheDocument();
  });

  test("GIVEN no genre prop WHEN rendered THEN no genre pill appears", () => {
    render(<EventHero event={baseEvent} onBack={noop} onShare={noop} />);

    expect(screen.queryByText("Rock")).not.toBeInTheDocument();
  });

  test("GIVEN the back button WHEN clicked THEN onBack is called", async () => {
    const onBack = jest.fn();
    const user = userEvent.setup();
    render(<EventHero event={baseEvent} onBack={onBack} onShare={noop} />);

    await user.click(screen.getByRole("button", { name: /voltar/i }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  test("GIVEN the share button WHEN clicked THEN onShare is called", async () => {
    const onShare = jest.fn();
    const user = userEvent.setup();
    render(<EventHero event={baseEvent} onBack={noop} onShare={onShare} />);

    await user.click(screen.getByRole("button", { name: /compartilhar/i }));

    expect(onShare).toHaveBeenCalledTimes(1);
  });

  test("GIVEN the favorite button THEN it is disabled and clicking it does nothing", async () => {
    const user = userEvent.setup();
    render(<EventHero event={baseEvent} onBack={noop} onShare={noop} />);

    const favoriteButton = screen.getByRole("button", { name: /favoritar/i });
    expect(favoriteButton).toBeDisabled();

    await expect(user.click(favoriteButton)).resolves.not.toThrow();
  });

  test("GIVEN cover_image_url: null WHEN rendered THEN the gradient fallback renders and content is unaffected", () => {
    render(<EventHero event={{ ...baseEvent, cover_image_url: null }} onBack={noop} onShare={noop} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("Show de Rock")).toBeInTheDocument();
    expect(screen.getByText("Rua das Flores, 123")).toBeInTheDocument();
  });
});

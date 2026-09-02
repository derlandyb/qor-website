import { render, screen } from "@testing-library/react";
import { EventCard } from "./EventCard";

const baseProps = {
  title: "Show de Rock",
  flyerUrl: "https://cdn.example.com/flyer.jpg",
  startsAt: "2099-12-31T22:00:00Z",
  status: "published" as const,
  location: "Casa X",
  city: "vitoria" as const,
  genre: "Rock",
  mapsUrl: "https://maps.example.com/x",
  instagramUrl: "https://instagram.com/casax",
  index: 0,
};

describe("EventCard", () => {
  test("GIVEN full event data WHEN it renders THEN every field is present", () => {
    render(<EventCard {...baseProps} />);

    expect(screen.getByText("Show de Rock")).toBeInTheDocument();
    expect(screen.getByText("Casa X")).toBeInTheDocument();
    expect(screen.getByText("Vitória")).toBeInTheDocument();
    expect(screen.getByText("Rock")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ver no mapa/i })).toHaveAttribute("href", baseProps.mapsUrl);
    expect(screen.getByRole("link", { name: /ver instagram/i })).toHaveAttribute(
      "href",
      baseProps.instagramUrl,
    );
  });

  test("GIVEN no location WHEN it renders THEN it shows the fallback location text", () => {
    render(<EventCard {...baseProps} location={null} />);

    expect(screen.getByText("Local a confirmar")).toBeInTheDocument();
  });

  test("GIVEN no genre WHEN it renders THEN no genre tag is shown", () => {
    render(<EventCard {...baseProps} genre={undefined} />);

    expect(screen.queryByText("Rock")).not.toBeInTheDocument();
  });

  test("GIVEN no mapsUrl or instagramUrl WHEN it renders THEN no CTA row is shown", () => {
    render(<EventCard {...baseProps} mapsUrl={undefined} instagramUrl={undefined} />);

    expect(screen.queryByRole("link", { name: /ver no mapa/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /ver instagram/i })).not.toBeInTheDocument();
  });

  test("GIVEN a future published event WHEN it renders THEN it shows the date badge, not the live badge", () => {
    render(<EventCard {...baseProps} />);

    expect(screen.getByText("DEZ")).toBeInTheDocument();
    expect(screen.queryByText("Ao Vivo")).not.toBeInTheDocument();
  });

  test("GIVEN a published event whose starts_at has already passed WHEN it renders THEN it shows the live-pulse badge instead of the date badge", () => {
    render(<EventCard {...baseProps} startsAt="2020-01-01T22:00:00Z" />);

    expect(screen.getByText("Ao Vivo")).toBeInTheDocument();
    expect(screen.queryByText("JAN")).not.toBeInTheDocument();
  });

  test("GIVEN an ended event whose starts_at has passed WHEN it renders THEN it still shows the date badge, not the live badge", () => {
    render(<EventCard {...baseProps} startsAt="2020-01-01T22:00:00Z" status="ended" />);

    expect(screen.queryByText("Ao Vivo")).not.toBeInTheDocument();
    expect(screen.getByText("JAN")).toBeInTheDocument();
  });

  test("GIVEN no flyer image WHEN it renders THEN it falls back to the placeholder image", () => {
    render(<EventCard {...baseProps} flyerUrl={null} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  test("GIVEN a render-loop index WHEN it renders THEN --card-index is set on the card for the stagger delay", () => {
    const { container } = render(<EventCard {...baseProps} index={3} />);

    const card = container.querySelector("article")!;
    expect(card.style.getPropertyValue("--card-index")).toBe("3");
    expect(card).toHaveClass("animate-card-enter");
  });

  test("GIVEN the card renders THEN the scrim element is present behind the badges", () => {
    render(<EventCard {...baseProps} />);

    expect(screen.getByTestId("event-card-scrim")).toBeInTheDocument();
  });
});

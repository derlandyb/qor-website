import { render, screen } from "@testing-library/react";
import { LivePulseBadge } from "./LivePulseBadge";

describe("LivePulseBadge", () => {
  test("GIVEN it renders THEN it shows the Ao Vivo label with the pulse-glow animation class", () => {
    render(<LivePulseBadge />);

    expect(screen.getByText("Ao Vivo")).toBeInTheDocument();
    const dot = document.querySelector(".animate-pulse-glow");
    expect(dot).not.toBeNull();
  });
});

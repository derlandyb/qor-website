import { render, screen } from "@testing-library/react";
import { CtaButton } from "./CtaButton";

describe("CtaButton", () => {
  test("GIVEN variant map WHEN it renders THEN it shows the Ver no Mapa label and blue-outline classes", () => {
    render(<CtaButton variant="map" href="https://maps.example.com/x" />);

    const link = screen.getByRole("link", { name: /ver no mapa/i });
    expect(link).toHaveAttribute("href", "https://maps.example.com/x");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener");
    expect(link).toHaveClass("bg-[#2EC5FF]/10", "border", "text-[#2EC5FF]");
  });

  test("GIVEN variant instagram WHEN it renders THEN it shows the Ver Instagram label and the gradient classes", () => {
    render(<CtaButton variant="instagram" href="https://instagram.com/x" />);

    const link = screen.getByRole("link", { name: /ver instagram/i });
    expect(link).toHaveClass("bg-gradient-to-r", "from-[#FF2E7E]", "to-[#B14EFF]", "text-white");
  });
});

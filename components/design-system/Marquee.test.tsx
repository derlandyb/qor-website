import { render, screen } from "@testing-library/react";
import { Marquee } from "./Marquee";

describe("Marquee", () => {
  test("GIVEN a list of items WHEN the component renders THEN the items appear twice (duplicated track)", () => {
    render(<Marquee items={["Vitória", "Vila Velha", "Serra", "Cariacica"]} />);

    expect(screen.getAllByText("Vitória")).toHaveLength(2);
    expect(screen.getAllByText("Vila Velha")).toHaveLength(2);
    expect(screen.getAllByText("Serra")).toHaveLength(2);
    expect(screen.getAllByText("Cariacica")).toHaveLength(2);
  });

  test("GIVEN the component renders THEN the container has aria-hidden=true", () => {
    const { container } = render(<Marquee items={["Vitória"]} />);

    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });
});

import { render, screen } from "@testing-library/react";
import { Footer } from "./Footer";

describe("Footer", () => {
  test("GIVEN the footer renders WHEN mounted THEN it shows a link to / and a link to /eventos", () => {
    render(<Footer />);

    expect(screen.getByRole("link", { name: "Início" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Explorar" })).toHaveAttribute("href", "/eventos");
  });

  test("GIVEN the footer renders WHEN mounted THEN it shows the QOR brand name and pt-BR tagline", () => {
    render(<Footer />);

    expect(screen.getByText("QOR")).toBeInTheDocument();
    expect(screen.getByText(/Grande Vitória/)).toBeInTheDocument();
  });

  test("GIVEN the footer renders WHEN mounted THEN it does not show links to routes that don't exist", () => {
    render(<Footer />);

    const links = screen.getAllByRole("link").map((link) => link.getAttribute("href"));
    expect(links.every((href) => href === "/" || href === "/eventos")).toBe(true);
  });
});

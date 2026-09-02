import { render, screen } from "@testing-library/react";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  test("GIVEN a message WHEN it renders THEN it shows that message as a status", () => {
    render(<EmptyState message="Nenhum evento encontrado." />);

    expect(screen.getByRole("status")).toHaveTextContent("Nenhum evento encontrado.");
  });
});

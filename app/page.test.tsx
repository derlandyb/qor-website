import { render, screen } from "@testing-library/react";
import HomePage from "./page";

test("GIVEN the scaffold home page WHEN it renders THEN the QOR heading is present", () => {
  render(<HomePage />);
  expect(screen.getByText("QOR")).toBeInTheDocument();
});

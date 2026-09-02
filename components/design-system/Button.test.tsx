import { render, screen } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  test("GIVEN no variant WHEN it renders THEN it uses the primary accent classes", () => {
    render(<Button>Entrar</Button>);

    expect(screen.getByRole("button", { name: "Entrar" })).toHaveClass("bg-[#FF2E7E]");
  });

  test("GIVEN variant secondary WHEN it renders THEN it uses the outline classes", () => {
    render(<Button variant="secondary">Cancelar</Button>);

    expect(screen.getByRole("button", { name: "Cancelar" })).toHaveClass("border");
  });
});

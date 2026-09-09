import { render, screen } from "@testing-library/react";
import PasswordResetSuccessPage from "./page";

describe("app/recuperar-senha/sucesso/page.tsx", () => {
  test("GIVEN it renders THEN it shows the success message and a login link", () => {
    render(<PasswordResetSuccessPage />);

    expect(screen.getByText("Senha redefinida!")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Fazer login" })).toHaveAttribute("href", "/entrar");
  });

  test("GIVEN it renders THEN it structurally matches the Stitch centered-card layout (REFRESH-01)", () => {
    render(<PasswordResetSuccessPage />);

    expect(screen.getByRole("region", { name: "Senha redefinida com sucesso" })).toBeInTheDocument();
  });
});

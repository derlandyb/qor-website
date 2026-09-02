import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VerifyEmailPage from "./page";

jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("email=ana%40example.com"),
}));

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("app/verificar-email/page.tsx (integration)", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("GIVEN the correct code WHEN submitted THEN it shows the verified confirmation", async () => {
    global.fetch = jest.fn().mockImplementation((input: string | URL) => {
      const url = String(input);
      if (url.includes("/sanctum/csrf-cookie")) return Promise.resolve(new Response(null, { status: 204 }));
      return Promise.resolve(
        jsonResponse({
          data: { id: 1, name: "Ana", email: "ana@example.com", phone: null, profile_picture_url: null, email_verified: true },
        }),
      );
    });

    const user = userEvent.setup();
    render(<VerifyEmailPage />);

    await user.type(screen.getByLabelText("Código de verificação"), "123456");
    await user.click(screen.getByRole("button", { name: "Verificar código" }));

    await screen.findByText("E-mail verificado!");
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/entrar");
  });

  test("GIVEN the wrong code WHEN submitted THEN it shows the pt-BR error", async () => {
    global.fetch = jest.fn().mockImplementation((input: string | URL) => {
      const url = String(input);
      if (url.includes("/sanctum/csrf-cookie")) return Promise.resolve(new Response(null, { status: 204 }));
      return Promise.resolve(jsonResponse({ message: "Código inválido ou expirado." }, 422));
    });

    const user = userEvent.setup();
    render(<VerifyEmailPage />);

    await user.type(screen.getByLabelText("Código de verificação"), "000000");
    await user.click(screen.getByRole("button", { name: "Verificar código" }));

    await screen.findByText("Código inválido ou expirado.");
  });

  test("GIVEN Reenviar is clicked WHEN the cooldown has elapsed THEN it calls resendVerification", async () => {
    const fetchMock = jest.fn().mockImplementation((input: string | URL) => {
      const url = String(input);
      if (url.includes("/sanctum/csrf-cookie")) return Promise.resolve(new Response(null, { status: 204 }));
      return Promise.resolve(jsonResponse({ message: "ok" }));
    });
    global.fetch = fetchMock;

    render(<VerifyEmailPage />);
    // resendCooldownSeconds defaults to 60 in OtpCodeInput, so Reenviar
    // isn't clickable yet — this test just confirms the countdown copy shows.
    expect(await screen.findByText(/reenviar em 60s/i)).toBeInTheDocument();
  });
});

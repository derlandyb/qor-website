import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForgotPasswordPage from "./page";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("app/recuperar-senha/page.tsx (password recovery wizard, integration)", () => {
  beforeEach(() => {
    document.cookie = "XSRF-TOKEN=token";
    pushMock.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("GIVEN the full wizard flow WHEN each step succeeds THEN it resets the password and redirects to the success page", async () => {
    const fetchMock = jest.fn().mockImplementation((input: string | URL) => {
      const url = String(input);
      if (url.includes("/sanctum/csrf-cookie")) return Promise.resolve(new Response(null, { status: 204 }));
      if (url.includes("/password/forgot")) return Promise.resolve(jsonResponse({ message: "ok" }));
      if (url.includes("/password/verify-code")) return Promise.resolve(jsonResponse({ data: { token: "reset-token" } }));
      if (url.includes("/password/reset")) return Promise.resolve(jsonResponse({ message: "ok" }));
      return Promise.resolve(jsonResponse({ message: "not found" }, 404));
    });
    global.fetch = fetchMock;

    const user = userEvent.setup();
    render(<ForgotPasswordPage />);

    await user.type(screen.getByLabelText("E-mail"), "ana@example.com");
    await user.click(screen.getByRole("button", { name: "Enviar link de recuperação" }));

    await screen.findByLabelText("Código de verificação");
    await user.type(screen.getByLabelText("Código de verificação"), "123456");
    await user.click(screen.getByRole("button", { name: "Verificar código" }));

    await screen.findByLabelText("Nova senha");
    await user.type(screen.getByLabelText("Nova senha"), "NovaSenha123");
    await user.type(screen.getByLabelText("Confirmar nova senha"), "NovaSenha123");
    await user.click(screen.getByRole("button", { name: "Redefinir senha" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/recuperar-senha/sucesso"));

    const resetCall = fetchMock.mock.calls.find((call) => String(call[0]).includes("/password/reset"));
    expect(resetCall).toBeDefined();
    expect(JSON.parse((resetCall![1] as RequestInit).body as string)).toEqual({
      email: "ana@example.com",
      token: "reset-token",
      password: "NovaSenha123",
    });
  });

  test("GIVEN mismatched new passwords WHEN the password step is submitted THEN it shows the pt-BR error and does not call the API", async () => {
    const fetchMock = jest.fn().mockImplementation((input: string | URL) => {
      const url = String(input);
      if (url.includes("/sanctum/csrf-cookie")) return Promise.resolve(new Response(null, { status: 204 }));
      if (url.includes("/password/forgot")) return Promise.resolve(jsonResponse({ message: "ok" }));
      if (url.includes("/password/verify-code")) return Promise.resolve(jsonResponse({ data: { token: "reset-token" } }));
      return Promise.resolve(jsonResponse({ message: "not found" }, 404));
    });
    global.fetch = fetchMock;

    const user = userEvent.setup();
    render(<ForgotPasswordPage />);

    await user.type(screen.getByLabelText("E-mail"), "ana@example.com");
    await user.click(screen.getByRole("button", { name: "Enviar link de recuperação" }));
    await screen.findByLabelText("Código de verificação");
    await user.type(screen.getByLabelText("Código de verificação"), "123456");
    await user.click(screen.getByRole("button", { name: "Verificar código" }));
    await screen.findByLabelText("Nova senha");

    await user.type(screen.getByLabelText("Nova senha"), "NovaSenha123");
    await user.type(screen.getByLabelText("Confirmar nova senha"), "Diferente123");
    await user.click(screen.getByRole("button", { name: "Redefinir senha" }));

    await screen.findByText("As senhas não coincidem.");
    expect(fetchMock.mock.calls.some((call) => String(call[0]).includes("/password/reset"))).toBe(false);
  });

  test("GIVEN the wrong code WHEN the code step is submitted THEN it shows the pt-BR error and stays on that step", async () => {
    const fetchMock = jest.fn().mockImplementation((input: string | URL) => {
      const url = String(input);
      if (url.includes("/sanctum/csrf-cookie")) return Promise.resolve(new Response(null, { status: 204 }));
      if (url.includes("/password/forgot")) return Promise.resolve(jsonResponse({ message: "ok" }));
      if (url.includes("/password/verify-code")) {
        return Promise.resolve(jsonResponse({ message: "Código inválido ou expirado." }, 422));
      }
      return Promise.resolve(jsonResponse({ message: "not found" }, 404));
    });
    global.fetch = fetchMock;

    const user = userEvent.setup();
    render(<ForgotPasswordPage />);

    await user.type(screen.getByLabelText("E-mail"), "ana@example.com");
    await user.click(screen.getByRole("button", { name: "Enviar link de recuperação" }));
    await screen.findByLabelText("Código de verificação");
    await user.type(screen.getByLabelText("Código de verificação"), "000000");
    await user.click(screen.getByRole("button", { name: "Verificar código" }));

    await screen.findByText("Código inválido ou expirado.");
    expect(screen.getByLabelText("Código de verificação")).toBeInTheDocument();
  });
});

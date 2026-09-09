import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "./page";

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

describe("app/entrar/page.tsx (login, integration)", () => {
  beforeEach(() => {
    document.cookie = "XSRF-TOKEN=token";
    pushMock.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("GIVEN valid credentials WHEN submitted THEN it logs in and redirects to /perfil", async () => {
    const fetchMock = jest.fn().mockImplementation((input: string | URL) => {
      const url = String(input);
      if (url.includes("/sanctum/csrf-cookie")) return Promise.resolve(new Response(null, { status: 204 }));
      return Promise.resolve(
        jsonResponse({
          data: {
            id: 1,
            name: "Fã",
            email: "fa@example.com",
            phone: null,
            birthdate: "2000-01-01",
            profile_picture_url: null,
            email_verified: true,
          },
          token: "t",
        }),
      );
    });
    global.fetch = fetchMock;

    const user = userEvent.setup();
    render(<LoginPage />);
    await user.type(screen.getByLabelText("E-mail"), "fa@example.com");
    await user.type(screen.getByLabelText("Senha"), "Senha123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/perfil"));
  });

  test("GIVEN the wrong password WHEN submitted THEN it shows the pt-BR error message", async () => {
    global.fetch = jest.fn().mockImplementation((input: string | URL) => {
      const url = String(input);
      if (url.includes("/sanctum/csrf-cookie")) return Promise.resolve(new Response(null, { status: 204 }));
      return Promise.resolve(jsonResponse({ message: "Credenciais inválidas" }, 401));
    });

    const user = userEvent.setup();
    render(<LoginPage />);
    await user.type(screen.getByLabelText("E-mail"), "fa@example.com");
    await user.type(screen.getByLabelText("Senha"), "errada");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await screen.findByText("Credenciais inválidas");
    expect(pushMock).not.toHaveBeenCalled();
  });

  test("GIVEN an unverified account WHEN submitted THEN it shows a link to verify the email", async () => {
    global.fetch = jest.fn().mockImplementation((input: string | URL) => {
      const url = String(input);
      if (url.includes("/sanctum/csrf-cookie")) return Promise.resolve(new Response(null, { status: 204 }));
      return Promise.resolve(jsonResponse({ message: "Confirme seu e-mail para continuar" }, 403));
    });

    const user = userEvent.setup();
    render(<LoginPage />);
    await user.type(screen.getByLabelText("E-mail"), "fa@example.com");
    await user.type(screen.getByLabelText("Senha"), "Senha123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await screen.findByText("Confirme seu e-mail para continuar");
    expect(screen.getByRole("link", { name: "Verificar e-mail" })).toHaveAttribute(
      "href",
      "/verificar-email",
    );
  });

  test("GIVEN the page renders THEN it structurally matches the Stitch split-screen layout (REFRESH-01)", () => {
    render(<LoginPage />);

    expect(screen.getByRole("region", { name: "Destaque" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Formulário de login" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Entrar na sua conta" })).toBeInTheDocument();
  });

  test("GIVEN the page renders THEN it uses no hardcoded colors outside the reconciled token set (REFRESH-02)", () => {
    const { container } = render(<LoginPage />);
    const allowedHexes = [
      "#F5F6FA",
      "#9A9FB0",
      "#666B7D",
      "#2A2E3B",
      "#1B1E29",
      "#12141D",
      "#FF2E7E",
      "#FF4D4D",
      "#2EC5FF",
      "#0B0D14",
    ];
    const html = container.innerHTML;
    const hexMatches = html.match(/#[0-9A-Fa-f]{6}/g) ?? [];
    for (const hex of hexMatches) {
      expect(allowedHexes.map((h) => h.toUpperCase())).toContain(hex.toUpperCase());
    }
  });
});

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignupPage from "./page";

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

describe("app/cadastro/page.tsx (signup, integration)", () => {
  beforeEach(() => {
    document.cookie = "XSRF-TOKEN=token";
    pushMock.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("GIVEN required fields left empty WHEN submitted THEN it blocks submit with pt-BR field errors", async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    await user.click(screen.getByRole("button", { name: "Criar minha conta" }));

    expect(screen.getByText("O nome é obrigatório.")).toBeInTheDocument();
    expect(screen.getByText("É necessário aceitar os termos de uso.")).toBeInTheDocument();
  });

  test("GIVEN mismatched passwords WHEN submitted THEN it shows the confirm-password error", async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    await user.type(screen.getByLabelText("Nome"), "Ana Silva");
    await user.type(screen.getByLabelText("E-mail"), "ana@example.com");
    await user.type(screen.getByLabelText("Data de nascimento"), "1995-05-10");
    await user.type(screen.getByLabelText("Senha"), "Senha123");
    await user.type(screen.getByLabelText("Confirmar senha"), "Outra123");
    await user.click(screen.getByLabelText(/li e aceito/i));
    await user.click(screen.getByRole("button", { name: "Criar minha conta" }));

    expect(screen.getByText("As senhas não coincidem.")).toBeInTheDocument();
  });

  test("GIVEN a fully filled valid form WHEN submitted THEN it registers and redirects to /verificar-email", async () => {
    global.fetch = jest.fn().mockImplementation((input: string | URL) => {
      const url = String(input);
      if (url.includes("/sanctum/csrf-cookie")) return Promise.resolve(new Response(null, { status: 204 }));
      return Promise.resolve(
        jsonResponse(
          {
            data: {
              id: 1,
              name: "Ana Silva",
              email: "ana@example.com",
              phone: null,
              profile_picture_url: null,
              email_verified: false,
            },
          },
          201,
        ),
      );
    });

    const user = userEvent.setup();
    render(<SignupPage />);

    await user.type(screen.getByLabelText("Nome"), "Ana Silva");
    await user.type(screen.getByLabelText("E-mail"), "ana@example.com");
    await user.type(screen.getByLabelText("Data de nascimento"), "1995-05-10");
    await user.type(screen.getByLabelText("Senha"), "Senha123");
    await user.type(screen.getByLabelText("Confirmar senha"), "Senha123");
    await user.click(screen.getByLabelText(/li e aceito/i));
    await user.click(screen.getByRole("button", { name: "Criar minha conta" }));

    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith("/verificar-email?email=ana%40example.com"),
    );
  });

  test("GIVEN a duplicate email WHEN submitted THEN it shows the pt-BR error message", async () => {
    global.fetch = jest.fn().mockImplementation((input: string | URL) => {
      const url = String(input);
      if (url.includes("/sanctum/csrf-cookie")) return Promise.resolve(new Response(null, { status: 204 }));
      return Promise.resolve(jsonResponse({ message: "Este e-mail já está cadastrado" }, 422));
    });

    const user = userEvent.setup();
    render(<SignupPage />);

    await user.type(screen.getByLabelText("Nome"), "Ana Silva");
    await user.type(screen.getByLabelText("E-mail"), "ana@example.com");
    await user.type(screen.getByLabelText("Data de nascimento"), "1995-05-10");
    await user.type(screen.getByLabelText("Senha"), "Senha123");
    await user.type(screen.getByLabelText("Confirmar senha"), "Senha123");
    await user.click(screen.getByLabelText(/li e aceito/i));
    await user.click(screen.getByRole("button", { name: "Criar minha conta" }));

    await screen.findByText("Este e-mail já está cadastrado");
    expect(pushMock).not.toHaveBeenCalled();
  });

  test("GIVEN the page renders THEN it structurally matches the Stitch split-screen layout (REFRESH-01)", () => {
    render(<SignupPage />);

    expect(screen.getByRole("region", { name: "Destaque" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Formulário de cadastro" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Criar conta" })).toBeInTheDocument();
  });

  test("GIVEN the page renders THEN it uses no hardcoded colors outside the reconciled token set (REFRESH-02)", () => {
    const { container } = render(<SignupPage />);
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
    const hexMatches = container.innerHTML.match(/#[0-9A-Fa-f]{6}/g) ?? [];
    for (const hex of hexMatches) {
      expect(allowedHexes.map((h) => h.toUpperCase())).toContain(hex.toUpperCase());
    }
  });
});

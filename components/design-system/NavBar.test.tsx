import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NavBar } from "./NavBar";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => "/",
}));

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("NavBar", () => {
  beforeEach(() => {
    document.cookie = "XSRF-TOKEN=token";
    pushMock.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("GIVEN an anonymous visitor WHEN it renders THEN it shows Entrar/Criar conta links", async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse({ message: "Não autenticado." }, 401));

    render(<NavBar />);

    await waitFor(() => expect(screen.getByRole("link", { name: "Entrar" })).toBeInTheDocument());
    expect(screen.getByRole("link", { name: "Criar conta" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Meu Perfil" })).not.toBeInTheDocument();
  });

  test("GIVEN an authenticated fan WHEN it renders THEN it shows Meu Perfil and Sair", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({
        data: { id: 1, name: "Fã", email: "fa@example.com", phone: null, birthdate: "2000-01-01", profile_picture_url: null, email_verified: true },
      }),
    );

    render(<NavBar />);

    await waitFor(() => expect(screen.getByRole("link", { name: "Meu Perfil" })).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Sair" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Entrar" })).not.toBeInTheDocument();
  });

  test("GIVEN an authenticated fan WHEN Sair is clicked THEN it logs out and redirects home", async () => {
    const fetchMock = jest.fn().mockImplementation((input: string | URL) => {
      const url = String(input);
      if (url.includes("/sanctum/csrf-cookie")) return Promise.resolve(new Response(null, { status: 204 }));
      if (url.includes("/auth/logout")) return Promise.resolve(jsonResponse({ message: "ok" }));
      return Promise.resolve(
        jsonResponse({
          data: { id: 1, name: "Fã", email: "fa@example.com", phone: null, birthdate: "2000-01-01", profile_picture_url: null, email_verified: true },
        }),
      );
    });
    global.fetch = fetchMock;

    const user = userEvent.setup();
    render(<NavBar />);
    await screen.findByRole("button", { name: "Sair" });

    await user.click(screen.getByRole("button", { name: "Sair" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/"));
  });
});

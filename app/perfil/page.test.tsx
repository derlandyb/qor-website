import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfilePage from "./page";

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

const profile = {
  id: 1,
  name: "Ana Silva",
  email: "ana@example.com",
  phone: "27999990000",
  birthdate: "1995-05-10",
  profile_picture_url: null,
  email_verified: true,
};

describe("app/perfil/page.tsx (profile, integration)", () => {
  beforeEach(() => {
    document.cookie = "XSRF-TOKEN=token";
    pushMock.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("GIVEN a loaded profile WHEN it renders THEN the fields are pre-filled", async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse({ data: profile }));

    render(<ProfilePage />);

    await waitFor(() => expect(screen.getByLabelText("Nome")).toHaveValue("Ana Silva"));
    expect(screen.getByLabelText("Telefone")).toHaveValue("27999990000");
    expect(screen.getByLabelText("Data de nascimento")).toHaveValue("1995-05-10");
  });

  test("GIVEN edited fields WHEN Salvar is submitted THEN it PATCHes /profile and shows the success message", async () => {
    const fetchMock = jest.fn().mockImplementation((input: string | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/sanctum/csrf-cookie")) return Promise.resolve(new Response(null, { status: 204 }));
      if (init?.method === "PATCH") {
        return Promise.resolve(
          jsonResponse({ data: { ...profile, name: "Novo Nome", pending_email: null } }),
        );
      }
      return Promise.resolve(jsonResponse({ data: profile }));
    });
    global.fetch = fetchMock;

    const user = userEvent.setup();
    render(<ProfilePage />);
    await waitFor(() => expect(screen.getByLabelText("Nome")).toHaveValue("Ana Silva"));

    await user.clear(screen.getByLabelText("Nome"));
    await user.type(screen.getByLabelText("Nome"), "Novo Nome");
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    await screen.findByText("Perfil atualizado com sucesso.");
  });

  test("GIVEN a pending email change WHEN it renders THEN the pending-email note is shown", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({ data: { ...profile, pending_email: "novo@example.com" } }),
    );

    render(<ProfilePage />);

    await screen.findByText(/novo@example\.com/);
  });

  test("GIVEN the delete-account flow WHEN confirmed THEN it deletes, logs out, and redirects to /", async () => {
    const fetchMock = jest.fn().mockImplementation((input: string | URL) => {
      const url = String(input);
      if (url.includes("/sanctum/csrf-cookie")) return Promise.resolve(new Response(null, { status: 204 }));
      if (url.includes("/data-rights/delete")) return Promise.resolve(jsonResponse({ message: "ok" }));
      if (url.includes("/auth/logout")) return Promise.resolve(jsonResponse({ message: "ok" }));
      return Promise.resolve(jsonResponse({ data: profile }));
    });
    global.fetch = fetchMock;

    const user = userEvent.setup();
    render(<ProfilePage />);
    await waitFor(() => expect(screen.getByLabelText("Nome")).toHaveValue("Ana Silva"));

    await user.click(screen.getByRole("button", { name: "Excluir minha conta" }));
    const dialog = await screen.findByRole("dialog");
    await user.click(screen.getByRole("button", { name: "Excluir" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/"));
    expect(dialog).toBeDefined();
  });

  test("GIVEN the profile request fails WHEN the page mounts THEN it renders the pt-BR error message", async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse({ message: "Erro interno." }, 500));

    render(<ProfilePage />);

    await screen.findByText("Erro interno.");
  });
});

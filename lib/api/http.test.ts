import { apiRequest, ApiError, UnauthenticatedError, LOGIN_PATH } from "./http";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("apiRequest", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    document.cookie = "";
    Object.defineProperty(window, "location", {
      value: { ...window.location, href: "http://localhost:3002/eventos", pathname: "/eventos" },
      writable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("GIVEN a GET request WHEN it succeeds THEN it returns the parsed JSON body without a CSRF bootstrap call", async () => {
    const fetchMock = fetch as jest.Mock;
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: [{ id: 1 }] }));

    const result = await apiRequest<{ data: { id: number }[] }>("/events");

    expect(result.data[0].id).toBe(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0];
    expect(init.credentials).toBe("include");
  });

  test("GIVEN a mutating request WHEN it runs THEN it bootstraps the CSRF cookie first and attaches X-XSRF-TOKEN", async () => {
    const fetchMock = fetch as jest.Mock;
    fetchMock.mockImplementationOnce(async () => {
      document.cookie = "XSRF-TOKEN=abc123";
      return new Response(null, { status: 204 });
    });
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: { id: 1 } }, 201));

    await apiRequest("/auth/register", { method: "POST", json: { name: "A" } });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [csrfUrl] = fetchMock.mock.calls[0];
    expect(String(csrfUrl)).toContain("/sanctum/csrf-cookie");
    const [, mutatingInit] = fetchMock.mock.calls[1];
    expect(mutatingInit.headers["X-XSRF-TOKEN"]).toBe("abc123");
  });

  test("GIVEN a validation error response WHEN the request fails THEN it throws ApiError with the field errors", async () => {
    const fetchMock = fetch as jest.Mock;
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ message: "Dados inválidos.", errors: { email: ["O e-mail é obrigatório."] } }, 422),
    );

    await expect(apiRequest("/auth/register", { method: "POST", json: {} })).rejects.toMatchObject({
      status: 422,
      errors: { email: ["O e-mail é obrigatório."] },
    });
  });

  test("GIVEN an error response with a machine-readable code WHEN the request fails THEN ApiError exposes that code", async () => {
    const fetchMock = fetch as jest.Mock;
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: "Algo específico.", code: "some_code" }, 422));

    await expect(apiRequest("/auth/register", { method: "POST", json: {} })).rejects.toMatchObject({
      status: 422,
      code: "some_code",
    });
  });

  test("GIVEN a 401 response on a protected path WHEN the request fails THEN it throws UnauthenticatedError and redirects to /entrar", async () => {
    Object.defineProperty(window, "location", {
      value: { ...window.location, href: "http://localhost:3002/perfil", pathname: "/perfil" },
      writable: true,
    });
    const fetchMock = fetch as jest.Mock;
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: "Não autenticado." }, 401));

    await expect(apiRequest("/profile")).rejects.toBeInstanceOf(UnauthenticatedError);
    expect(window.location.href).toContain(LOGIN_PATH);
  });

  test.each(["/", "/entrar", "/cadastro", "/eventos", "/eventos/42"])(
    "GIVEN a 401 response on the public route %s WHEN the request fails THEN it still throws UnauthenticatedError but does NOT redirect",
    async (publicPath) => {
      Object.defineProperty(window, "location", {
        value: { ...window.location, href: `http://localhost:3002${publicPath}`, pathname: publicPath },
        writable: true,
      });
      const fetchMock = fetch as jest.Mock;
      fetchMock.mockResolvedValueOnce(jsonResponse({ message: "Não autenticado." }, 401));

      await expect(apiRequest("/events")).rejects.toBeInstanceOf(UnauthenticatedError);

      // A visitor browsing public event-discovery pages must stay put on a
      // 401 from a background session check — that's the expected, normal
      // state there, not something to bounce away from.
      expect(window.location.href).toBe(`http://localhost:3002${publicPath}`);
    },
  );

  test("GIVEN any other error status WHEN the request fails THEN it throws a plain ApiError, not UnauthenticatedError", async () => {
    const fetchMock = fetch as jest.Mock;
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: "Você não tem permissão para esta ação." }, 403));

    const error = await apiRequest("/profile").catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).not.toBeInstanceOf(UnauthenticatedError);
  });
});

describe("apiRequest — same-origin mode (NEXT_PUBLIC_API_BASE_URL explicitly empty)", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue(new Response(JSON.stringify({ data: [] }), { status: 200 }));
    document.cookie = "";
    Object.defineProperty(window, "location", {
      value: { ...window.location, href: "http://localhost:3000/eventos", origin: "http://localhost:3000" },
      writable: true,
    });
    process.env.NEXT_PUBLIC_API_BASE_URL = "";
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
  });

  test("GIVEN NEXT_PUBLIC_API_BASE_URL is explicitly empty WHEN a request is built THEN it targets the page's own origin, not the http.ts default host", async () => {
    jest.resetModules();
    const { apiRequest: sameOriginApiRequest } = await import("./http");

    await sameOriginApiRequest("/events");

    const fetchMock = fetch as jest.Mock;
    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("http://localhost:3000/api/v1/events");
  });
});

/**
 * Integration test for W12's auth/profile hooks: unlike useAuth.test.ts/
 * useProfile.test.ts (which mock lib/api/client.ts directly), this exercises
 * the real hook -> client -> http.ts stack against a mocked global fetch.
 */
import { renderHook, waitFor, act } from "@testing-library/react";
import { useSession, useAuth } from "../useAuth";
import { useProfile } from "../useProfile";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const user = {
  id: 1,
  name: "Fã",
  email: "fa@example.com",
  phone: null,
  birthdate: "2000-01-01",
  profile_picture_url: null,
  email_verified: true,
};

describe("auth/profile hooks (integration, real client + http stack)", () => {
  beforeEach(() => {
    document.cookie = "XSRF-TOKEN=token";
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("GIVEN an authenticated session WHEN useSession() mounts THEN it fetches /profile and exposes the user", async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse({ data: user }));

    const { result } = renderHook(() => useSession());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toEqual(user);
  });

  test("GIVEN valid credentials WHEN useAuth().login is called THEN it POSTs to /auth/login", async () => {
    const fetchMock = jest.fn().mockImplementation((input: string | URL) => {
      const url = String(input);
      if (url.includes("/sanctum/csrf-cookie")) {
        return Promise.resolve(new Response(null, { status: 204 }));
      }
      return Promise.resolve(jsonResponse({ data: user, token: "t" }));
    });
    global.fetch = fetchMock;

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login({ email: "fa@example.com", password: "Senha123" });
    });

    const loginCall = fetchMock.mock.calls.find((call) => String(call[0]).includes("/auth/login"));
    expect(loginCall).toBeDefined();
  });

  test("GIVEN fields WHEN useProfile().update is called THEN it PATCHes /profile", async () => {
    const fetchMock = jest.fn().mockImplementation((input: string | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/sanctum/csrf-cookie")) {
        return Promise.resolve(new Response(null, { status: 204 }));
      }
      if (init?.method === "PATCH") {
        return Promise.resolve(jsonResponse({ data: { ...user, name: "Novo Nome", pending_email: null } }));
      }
      return Promise.resolve(jsonResponse({ data: user }));
    });
    global.fetch = fetchMock;

    const { result } = renderHook(() => useProfile());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.update({ name: "Novo Nome" });
    });

    const patchCall = fetchMock.mock.calls.find(
      (call) => (call[1] as RequestInit | undefined)?.method === "PATCH",
    );
    expect(patchCall).toBeDefined();
    expect(result.current.profile?.name).toBe("Novo Nome");
  });
});

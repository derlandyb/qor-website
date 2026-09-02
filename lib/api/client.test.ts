import * as client from "./client";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("lib/api/client request builders", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockImplementation((input: string | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/sanctum/csrf-cookie")) {
        return Promise.resolve(new Response(null, { status: 204 }));
      }
      if (init?.method && init.method !== "GET") {
        return Promise.resolve(jsonResponse({ data: {}, message: "ok" }, 201));
      }
      return Promise.resolve(jsonResponse({ data: [], message: "ok" }));
    });
    document.cookie = "XSRF-TOKEN=token";
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function lastCall(): [string, RequestInit] {
    const fetchMock = fetch as jest.Mock;
    const calls = fetchMock.mock.calls as [string, RequestInit][];
    return calls[calls.length - 1];
  }

  test("GIVEN city/genre/cursor filters WHEN listEvents is called THEN it builds the correct query string", async () => {
    await client.listEvents({ city: "vitoria", genre: 2, cursor: "abc" });

    const [url] = lastCall();
    expect(url).toContain("/api/v1/events?");
    expect(url).toContain("city=vitoria");
    expect(url).toContain("genre=2");
    expect(url).toContain("cursor=abc");
  });

  test("GIVEN no filters WHEN listEvents is called THEN it omits undefined query params", async () => {
    await client.listEvents();

    const [url] = lastCall();
    expect(url).toContain("/api/v1/events");
    expect(url).not.toContain("?");
  });

  test("GIVEN an id WHEN getEvent is called THEN it hits the correct path", async () => {
    await client.getEvent(42);

    const [url] = lastCall();
    expect(url).toContain("/api/v1/events/42");
  });

  test("GIVEN a register payload WHEN register is called THEN it POSTs to /auth/register", async () => {
    await client.register({
      name: "Fã",
      email: "fa@example.com",
      password: "secret123",
      birthdate: "2000-01-01",
      terms_accepted: true,
    });

    const [url, init] = lastCall();
    expect(url).toContain("/auth/register");
    expect(init.method).toBe("POST");
  });

  test("GIVEN credentials WHEN login is called THEN it POSTs to /auth/login", async () => {
    await client.login({ email: "fa@example.com", password: "secret123" });

    const [url, init] = lastCall();
    expect(url).toContain("/auth/login");
    expect(init.method).toBe("POST");
  });

  test("GIVEN a Google payload WHEN loginWithGoogle is called THEN it POSTs to /auth/google", async () => {
    await client.loginWithGoogle({ google_id: "g1", email: "fa@example.com", name: "Fã" });

    const [url] = lastCall();
    expect(url).toContain("/auth/google");
  });

  test("WHEN logout is called THEN it POSTs to /auth/logout", async () => {
    await client.logout();

    const [url, init] = lastCall();
    expect(url).toContain("/auth/logout");
    expect(init.method).toBe("POST");
  });

  test("GIVEN an email WHEN forgotPassword is called THEN it POSTs to /auth/password/forgot", async () => {
    await client.forgotPassword("fa@example.com");

    const [url] = lastCall();
    expect(url).toContain("/auth/password/forgot");
  });

  test("GIVEN reset fields WHEN resetPassword is called THEN it POSTs to /auth/password/reset", async () => {
    await client.resetPassword({ email: "fa@example.com", token: "t", password: "newpass123" });

    const [url] = lastCall();
    expect(url).toContain("/auth/password/reset");
  });

  test("GIVEN an email WHEN resendVerification is called THEN it POSTs to /auth/email/verification-notification", async () => {
    await client.resendVerification("fa@example.com");

    const [url] = lastCall();
    expect(url).toContain("/auth/email/verification-notification");
  });

  test("GIVEN an email and code WHEN verifyEmailCode is called THEN it POSTs both to /auth/email/verify-code", async () => {
    await client.verifyEmailCode("fa@example.com", "123456");

    const [url, init] = lastCall();
    expect(url).toContain("/auth/email/verify-code");
    expect(JSON.parse(init.body as string)).toEqual({ email: "fa@example.com", code: "123456" });
  });

  test("GIVEN an email and code WHEN verifyPasswordResetCode is called THEN it POSTs both to /auth/password/verify-code", async () => {
    await client.verifyPasswordResetCode("fa@example.com", "123456");

    const [url, init] = lastCall();
    expect(url).toContain("/auth/password/verify-code");
    expect(JSON.parse(init.body as string)).toEqual({ email: "fa@example.com", code: "123456" });
  });

  test("WHEN getProfile is called THEN it GETs /profile", async () => {
    await client.getProfile();

    const [url] = lastCall();
    expect(url).toContain("/profile");
  });

  test("GIVEN fields WHEN updateProfile is called THEN it PATCHes /profile", async () => {
    await client.updateProfile({ name: "Novo Nome" });

    const [url, init] = lastCall();
    expect(url).toContain("/profile");
    expect(init.method).toBe("PATCH");
  });

  test("GIVEN a file WHEN uploadProfilePicture is called THEN it POSTs multipart form data to /profile/picture", async () => {
    const file = new File(["x"], "avatar.png", { type: "image/png" });
    await client.uploadProfilePicture(file);

    const [url, init] = lastCall();
    expect(url).toContain("/profile/picture");
    expect(init.method).toBe("POST");
    expect(init.body).toBeInstanceOf(FormData);
  });

  test("WHEN getDataRightsAccess is called THEN it GETs /profile/data-rights/access", async () => {
    await client.getDataRightsAccess();

    const [url] = lastCall();
    expect(url).toContain("/profile/data-rights/access");
  });

  test("WHEN exportDataRights is called THEN it GETs /profile/data-rights/export", async () => {
    await client.exportDataRights();

    const [url] = lastCall();
    expect(url).toContain("/profile/data-rights/export");
  });

  test("WHEN deleteAccount is called THEN it POSTs to /profile/data-rights/delete", async () => {
    await client.deleteAccount();

    const [url, init] = lastCall();
    expect(url).toContain("/profile/data-rights/delete");
    expect(init.method).toBe("POST");
  });

  test("GIVEN a consent type WHEN revokeConsent is called THEN it POSTs the consent_type to /profile/data-rights/revoke", async () => {
    await client.revokeConsent("location");

    const [url, init] = lastCall();
    expect(url).toContain("/profile/data-rights/revoke");
    expect(JSON.parse(init.body as string)).toEqual({ consent_type: "location" });
  });

  test("WHEN getAddress is called THEN it GETs /profile/address", async () => {
    await client.getAddress();

    const [url] = lastCall();
    expect(url).toContain("/profile/address");
  });

  test("GIVEN address fields WHEN updateAddress is called THEN it PATCHes /profile/address", async () => {
    await client.updateAddress({ city: "Vitória", state: "ES", street: "Rua X", number: "10" });

    const [url, init] = lastCall();
    expect(url).toContain("/profile/address");
    expect(init.method).toBe("PATCH");
  });

  test("WHEN getPreferences is called THEN it GETs /profile/preferences", async () => {
    await client.getPreferences();

    const [url] = lastCall();
    expect(url).toContain("/profile/preferences");
  });

  test("GIVEN preference fields WHEN updatePreferences is called THEN it PATCHes /profile/preferences", async () => {
    await client.updatePreferences({ genre_ids: [1, 2], radius_km: 10 });

    const [url, init] = lastCall();
    expect(url).toContain("/profile/preferences");
    expect(init.method).toBe("PATCH");
  });
});

import { renderHook, waitFor, act } from "@testing-library/react";
import { useSession, useAuth } from "./useAuth";
import * as client from "../lib/api/client";
import { ApiError, UnauthenticatedError } from "../lib/api/http";
import type { FanUser } from "../lib/api/types";

jest.mock("../lib/api/client");

const mockedClient = client as jest.Mocked<typeof client>;

function makeUser(overrides?: Partial<FanUser>): FanUser {
  return {
    id: 1,
    name: "Fã",
    email: "fa@example.com",
    phone: null,
    birthdate: "2000-01-01",
    profile_picture_url: null,
    email_verified: true,
    ...overrides,
  };
}

describe("useSession", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("GIVEN the hook mounts WHEN getProfile resolves THEN it exposes the user", async () => {
    mockedClient.getProfile.mockResolvedValue({ data: makeUser() });

    const { result } = renderHook(() => useSession());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toEqual(makeUser());
    expect(result.current.error).toBeNull();
  });

  test("GIVEN an anonymous visitor WHEN getProfile rejects with 401 THEN it resolves to user null with no error", async () => {
    mockedClient.getProfile.mockRejectedValue(new UnauthenticatedError("Não autenticado."));

    const { result } = renderHook(() => useSession());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });

  test("GIVEN a non-401 failure WHEN getProfile rejects THEN it surfaces the error message", async () => {
    mockedClient.getProfile.mockRejectedValue(new ApiError(500, "Erro interno."));

    const { result } = renderHook(() => useSession());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Erro interno.");
  });
});

describe("useAuth", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("GIVEN valid fields WHEN register is called THEN it returns the created user", async () => {
    mockedClient.register.mockResolvedValue({ data: makeUser() });
    const { result } = renderHook(() => useAuth());

    let user;
    await act(async () => {
      user = await result.current.register({
        name: "Fã",
        email: "fa@example.com",
        password: "Senha123",
        birthdate: "2000-01-01",
        terms_accepted: true,
      });
    });

    expect(user).toEqual(makeUser());
  });

  test("GIVEN credentials WHEN login is called THEN it returns the user", async () => {
    mockedClient.login.mockResolvedValue({ data: makeUser(), token: "t" });
    const { result } = renderHook(() => useAuth());

    let user;
    await act(async () => {
      user = await result.current.login({ email: "fa@example.com", password: "Senha123" });
    });

    expect(user).toEqual(makeUser());
  });

  test("WHEN logout is called THEN it calls the logout endpoint", async () => {
    mockedClient.logout.mockResolvedValue({ message: "ok" });
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(mockedClient.logout).toHaveBeenCalled();
  });

  test("GIVEN email and code WHEN verifyEmailCode is called THEN it returns the verified user", async () => {
    mockedClient.verifyEmailCode.mockResolvedValue({ data: makeUser({ email_verified: true }) });
    const { result } = renderHook(() => useAuth());

    let user;
    await act(async () => {
      user = await result.current.verifyEmailCode("fa@example.com", "123456");
    });

    expect(user).toEqual(makeUser({ email_verified: true }));
  });

  test("GIVEN email and code WHEN verifyPasswordResetCode is called THEN it returns the reset token", async () => {
    mockedClient.verifyPasswordResetCode.mockResolvedValue({ data: { token: "reset-token" } });
    const { result } = renderHook(() => useAuth());

    let token;
    await act(async () => {
      token = await result.current.verifyPasswordResetCode("fa@example.com", "123456");
    });

    expect(token).toBe("reset-token");
  });

  test("GIVEN reset fields WHEN resetPassword is called THEN it calls the endpoint", async () => {
    mockedClient.resetPassword.mockResolvedValue({ message: "ok" });
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.resetPassword({ email: "fa@example.com", token: "t", password: "NovaSenha123" });
    });

    expect(mockedClient.resetPassword).toHaveBeenCalledWith({
      email: "fa@example.com",
      token: "t",
      password: "NovaSenha123",
    });
  });

  test("WHEN forgotPassword is called THEN it calls the endpoint", async () => {
    mockedClient.forgotPassword.mockResolvedValue({ message: "ok" });
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.forgotPassword("fa@example.com");
    });

    expect(mockedClient.forgotPassword).toHaveBeenCalledWith("fa@example.com");
  });

  test("WHEN resendVerification is called THEN it calls the endpoint", async () => {
    mockedClient.resendVerification.mockResolvedValue({ message: "ok" });
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.resendVerification("fa@example.com");
    });

    expect(mockedClient.resendVerification).toHaveBeenCalledWith("fa@example.com");
  });

  test("GIVEN a Google payload WHEN loginWithGoogle is called THEN it returns the user", async () => {
    mockedClient.loginWithGoogle.mockResolvedValue({ data: makeUser(), token: "t" });
    const { result } = renderHook(() => useAuth());

    let user;
    await act(async () => {
      user = await result.current.loginWithGoogle({ google_id: "1", email: "fa@example.com", name: "Fã" });
    });

    expect(user).toEqual(makeUser());
  });
});

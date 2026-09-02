/**
 * Auth hooks wrapping lib/api/client.ts's auth endpoints. `useSession()`
 * mirrors qor-admin's own useSession.ts shape (fetch-on-mount, an
 * UnauthenticatedError is the expected steady state for an anonymous
 * visitor — not surfaced as an alarming `error`). `useAuth()` is a
 * mutation-only hook (register/login/logout/password-reset/OTP verify) —
 * no fetch-on-mount, since none of its actions are triggered by a page load.
 */
import { useCallback, useEffect, useState } from "react";
import {
  forgotPassword,
  getProfile,
  login,
  loginWithGoogle,
  logout as logoutRequest,
  register,
  resendVerification,
  resetPassword,
  verifyEmailCode,
  verifyPasswordResetCode,
  type GoogleLoginPayload,
  type LoginPayload,
  type RegisterPayload,
  type ResetPasswordPayload,
} from "../lib/api/client";
import { ApiError, UnauthenticatedError } from "../lib/api/http";
import type { FanUser } from "../lib/api/types";

function messageOf(err: unknown): string {
  return err instanceof ApiError ? err.message : "Erro inesperado.";
}

export interface Session {
  user: FanUser | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSession(): Session {
  const [user, setUser] = useState<FanUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getProfile();
      setUser(result.data);
    } catch (err) {
      // An unauthenticated visitor is expected on every public page (home,
      // event discovery, auth pages) — the 401 has already redirected to
      // /entrar as a side effect in http.ts if the current path isn't
      // public; leave user null and error unset either way.
      if (!(err instanceof UnauthenticatedError)) {
        setError(messageOf(err));
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refetch();
  }, [refetch]);

  return { user, loading, error, refetch };
}

export interface AuthActions {
  register: (payload: RegisterPayload) => Promise<FanUser>;
  login: (payload: LoginPayload) => Promise<FanUser>;
  loginWithGoogle: (payload: GoogleLoginPayload) => Promise<FanUser>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  verifyPasswordResetCode: (email: string, code: string) => Promise<string>;
  resetPassword: (payload: ResetPasswordPayload) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  verifyEmailCode: (email: string, code: string) => Promise<FanUser | null>;
}

export function useAuth(): AuthActions {
  const doRegister = useCallback(async (payload: RegisterPayload) => (await register(payload)).data, []);

  const doLogin = useCallback(async (payload: LoginPayload) => (await login(payload)).data, []);

  const doLoginWithGoogle = useCallback(
    async (payload: GoogleLoginPayload) => (await loginWithGoogle(payload)).data,
    [],
  );

  const doLogout = useCallback(async () => {
    await logoutRequest();
  }, []);

  const doForgotPassword = useCallback(async (email: string) => {
    await forgotPassword(email);
  }, []);

  const doVerifyPasswordResetCode = useCallback(
    async (email: string, code: string) => (await verifyPasswordResetCode(email, code)).data.token,
    [],
  );

  const doResetPassword = useCallback(async (payload: ResetPasswordPayload) => {
    await resetPassword(payload);
  }, []);

  const doResendVerification = useCallback(async (email: string) => {
    await resendVerification(email);
  }, []);

  const doVerifyEmailCode = useCallback(
    async (email: string, code: string) => (await verifyEmailCode(email, code)).data,
    [],
  );

  return {
    register: doRegister,
    login: doLogin,
    loginWithGoogle: doLoginWithGoogle,
    logout: doLogout,
    forgotPassword: doForgotPassword,
    verifyPasswordResetCode: doVerifyPasswordResetCode,
    resetPassword: doResetPassword,
    resendVerification: doResendVerification,
    verifyEmailCode: doVerifyEmailCode,
  };
}

"use client";

/**
 * W21 — password recovery, a single-page wizard (email -> OTP code ->
 * new password), reached via Stitch screens 32a562fe876e4d0cb2eb87c2140de64e
 * and bfdd2ec9b4c944c0a3f7c26793fb02c3. Since qor-api's reset flow is now
 * OTP-based (user-confirmed), the token/email round-trip through an email
 * link isn't needed — verifyPasswordResetCode() returns a real reset token
 * interactively, in the same visit, so there's no separate
 * /recuperar-senha/redefinir route.
 */
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TextField } from "../../components/design-system/FormField";
import { Button } from "../../components/design-system/Button";
import { OtpCodeInput } from "../../components/design-system/OtpCodeInput";
import { useAuth } from "../../hooks/useAuth";
import { ApiError } from "../../lib/api/http";

function messageOf(err: unknown): string {
  return err instanceof ApiError ? err.message : "Erro inesperado.";
}

type Step = "email" | "code" | "password";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword, verifyPasswordResetCode, resetPassword } = useAuth();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleEmailSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await forgotPassword(email);
      setStep("code");
    } catch (err) {
      setError(messageOf(err));
    }
  }

  async function handleCodeSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const resetToken = await verifyPasswordResetCode(email, code);
      setToken(resetToken);
      setStep("password");
    } catch (err) {
      setError(messageOf(err));
    }
  }

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    try {
      await resetPassword({ email, token, password });
      router.push("/recuperar-senha/sucesso");
    } catch (err) {
      setError(messageOf(err));
    }
  }

  async function handleResend() {
    await forgotPassword(email);
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 p-4">
      <div>
        <h1 className="font-[Space_Grotesk] text-[22px] font-bold text-[#F5F6FA]">Recuperar senha</h1>
        {step === "email" && (
          <p className="mt-1 text-[13px] text-[#9A9FB0]">
            Informe seu e-mail para receber as instruções de redefinição.
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-[#FF4D4D]">
          {error}
        </p>
      )}

      {step === "email" && (
        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4" noValidate>
          <TextField id="forgot-email" label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit">Enviar link de recuperação</Button>
        </form>
      )}

      {step === "code" && (
        <form onSubmit={handleCodeSubmit} className="flex flex-col gap-4" noValidate>
          <OtpCodeInput value={code} onChange={setCode} onResend={() => void handleResend()} />
          <Button type="submit">Verificar código</Button>
        </form>
      )}

      {step === "password" && (
        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4" noValidate>
          <TextField
            id="new-password"
            label="Nova senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            id="confirm-new-password"
            label="Confirmar nova senha"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button type="submit">Redefinir senha</Button>
        </form>
      )}

      <Link href="/entrar" className="text-center text-[13px] text-[#9A9FB0] underline">
        Lembrou da senha? Fazer login
      </Link>
    </div>
  );
}

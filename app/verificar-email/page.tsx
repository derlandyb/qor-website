"use client";

/**
 * W20 — email verification (AUTH-10; Stitch screen
 * 47a8c72451fd44509ae4576bcf2134e4, "Verificação de E-mail OTP (Desktop)").
 * qor-api's actual mechanism is an OTP code (not the signed link the old
 * spec assumed) — matches the Stitch mock exactly. Reached by app
 * navigation right after signup (email query param), not by clicking a
 * link in the email itself. Restyled to the mock's single centered card
 * (already the page's layout shape — reused `OtpCodeInput`'s built-in
 * resend UI rather than copying the mock's countdown/"Alterar" chrome
 * verbatim — REFRESH-04).
 *
 * `useSearchParams()` requires a Suspense boundary in the App Router.
 */
import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { OtpCodeInput } from "../../components/design-system/OtpCodeInput";
import { Button } from "../../components/design-system/Button";
import { useAuth } from "../../hooks/useAuth";
import { ApiError } from "../../lib/api/http";

function messageOf(err: unknown): string {
  return err instanceof ApiError ? err.message : "Erro inesperado.";
}

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const { verifyEmailCode, resendVerification } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await verifyEmailCode(email, code);
      setVerified(true);
    } catch (err) {
      setError(messageOf(err));
    }
  }

  async function handleResend() {
    await resendVerification(email);
  }

  if (verified) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-4 rounded-[16px] border border-[#2A2E3B] bg-[#1B1E29] p-6 text-center md:my-8">
        <h1 className="font-[Space_Grotesk] text-[22px] font-bold text-[#F5F6FA]">E-mail verificado!</h1>
        <p className="text-[14px] text-[#9A9FB0]">Sua conta foi verificada com sucesso.</p>
        <Link href="/entrar" className="text-[#2EC5FF] underline">
          Entrar
        </Link>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Verificação de e-mail"
      className="mx-auto flex max-w-md flex-col gap-6 rounded-[16px] border border-[#2A2E3B] bg-[#1B1E29] p-6 md:my-8"
    >
      <div>
        <h1 className="font-[Space_Grotesk] text-[22px] font-bold text-[#F5F6FA]">Verifique seu e-mail</h1>
        <p className="mt-1 text-[13px] text-[#9A9FB0]">
          Enviamos um código de 6 dígitos para confirmar sua identidade e ativar sua conta.
        </p>
        {email && <p className="mt-2 text-[13px] font-semibold text-[#F5F6FA]">{email}</p>}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <OtpCodeInput value={code} onChange={setCode} error={error ?? undefined} onResend={() => void handleResend()} />
        <Button type="submit">Verificar código</Button>
      </form>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-[#9A9FB0]">Carregando...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}

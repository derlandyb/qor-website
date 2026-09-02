"use client";

/**
 * W18 — login (AUTH-06-12; Stitch screen cfa5690fed3d487897d65de249ad7f1d).
 * The Stitch mock shows only a "Continuar com Email" entry-point button
 * (no visible fields) plus Google/guest/forgot-password — but AUTH-06-12
 * requires a real email+password form, so that's built directly rather
 * than following the mock literally. Google sign-in needs its own OAuth
 * client-id setup (like the Maps key, but with redirect-URI/consent-screen
 * configuration too) that hasn't been provided — shown disabled with a
 * pt-BR note rather than half-wired.
 */
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TextField } from "../../components/design-system/FormField";
import { Button } from "../../components/design-system/Button";
import { useAuth } from "../../hooks/useAuth";
import { ApiError } from "../../lib/api/http";

function messageOf(err: unknown): string {
  return err instanceof ApiError ? err.message : "Erro inesperado.";
}

/** qor-api's AuthController::login returns 403 for an unverified account (AUTH-08). */
function needsEmailVerification(err: unknown): boolean {
  return err instanceof ApiError && err.status === 403;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setNeedsVerification(false);
    try {
      await login({ email, password });
      router.push("/perfil");
    } catch (err) {
      setNeedsVerification(needsEmailVerification(err));
      setError(messageOf(err));
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 p-4">
      <div>
        <h1 className="font-[Space_Grotesk] text-[22px] font-bold text-[#F5F6FA]">Entrar</h1>
        <p className="mt-1 text-[13px] text-[#9A9FB0]">
          Encontre seu próximo rolê na Grande Vitória.
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-[#FF4D4D]">
          {error}
          {needsVerification && (
            <>
              {" "}
              <Link href="/verificar-email" className="underline">
                Verificar e-mail
              </Link>
            </>
          )}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <TextField
          id="login-email"
          label="E-mail"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          id="login-password"
          label="Senha"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit">Entrar</Button>
      </form>

      <button
        type="button"
        disabled
        title="Login com Google em breve"
        className="w-full rounded-[12px] border border-[#2A2E3B] px-4 py-2.5 text-[14px] font-semibold text-[#666B7D]"
      >
        Continuar com Google
      </button>

      <div className="flex flex-col items-center gap-2 text-[13px] text-[#9A9FB0]">
        <Link href="/recuperar-senha" className="underline">
          Esqueci minha senha
        </Link>
        <Link href="/cadastro" className="underline">
          Criar conta
        </Link>
      </div>
    </div>
  );
}

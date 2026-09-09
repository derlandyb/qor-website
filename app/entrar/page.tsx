"use client";

/**
 * W18 — login (AUTH-06-12; Stitch screen 4b1dcb1f579f4e528eeedf83f31973e3,
 * "Entrar (Login Desktop)"). AUTH-06-12 requires a real email+password form
 * (the mock's fields are rebuilt idiomatically, not copy-pasted — REFRESH-04),
 * split-screen per the mock: a left branding/highlight panel and a right
 * form panel. Google sign-in needs its own OAuth client-id setup (like the
 * Maps key, but with redirect-URI/consent-screen configuration too) that
 * hasn't been provided — shown disabled with a pt-BR note rather than
 * half-wired.
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
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 p-4 md:grid-cols-2 md:items-center md:gap-12 md:p-8">
      <section
        aria-label="Destaque"
        className="hidden flex-col justify-between gap-6 rounded-[16px] border border-[#2A2E3B] bg-[#1B1E29] p-6 md:flex"
      >
        <div>
          <p className="font-[Space_Grotesk] text-[22px] font-bold text-[#F5F6FA]">
            Qual o Rock?
          </p>
          <p className="mt-2 text-[13px] text-[#9A9FB0]">
            Descubra o próximo rolê na Grande Vitória — Vitória, Vila Velha, Serra e Cariacica.
          </p>
        </div>
        <div className="rounded-[12px] border border-[#2A2E3B] bg-[#12141D] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.01em] text-[#FF2E7E]">
            Ao vivo agora
          </p>
          <p className="mt-1 text-[15px] font-semibold text-[#F5F6FA]">Cena GV</p>
          <p className="mt-1 text-[13px] text-[#9A9FB0]">+14k roqueiros conectados</p>
        </div>
      </section>

      <section aria-label="Formulário de login" className="flex flex-col gap-6">
        <div>
          <h1 className="font-[Space_Grotesk] text-[22px] font-bold text-[#F5F6FA]">
            Entrar na sua conta
          </h1>
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

        <button
          type="button"
          disabled
          title="Login com Google em breve"
          className="w-full rounded-[12px] border border-[#2A2E3B] px-4 py-2.5 text-[14px] font-semibold text-[#666B7D]"
        >
          Continuar com Google
        </button>

        <div className="flex items-center gap-3 text-[13px] text-[#666B7D]" aria-hidden="true">
          <span className="h-px flex-1 bg-[#2A2E3B]" />
          OU
          <span className="h-px flex-1 bg-[#2A2E3B]" />
        </div>

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

        <div className="flex flex-col items-center gap-2 text-[13px] text-[#9A9FB0]">
          <Link href="/recuperar-senha" className="underline">
            Esqueci minha senha
          </Link>
          <Link href="/cadastro" className="underline">
            Criar conta
          </Link>
        </div>
      </section>
    </div>
  );
}

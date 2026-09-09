"use client";

/**
 * W19 — signup (AUTH-01-05; Stitch screen fb2c16cf77f64f0687ce3fe03f990ca8,
 * "Criar Conta (Registro Desktop)"). On success, redirects to
 * /verificar-email with the email as a query param — the account starts
 * unverified and needs the OTP code qor-api just emailed (W20). Split-screen
 * layout matches the mock's branding-panel + form-panel structure, same
 * pattern as /entrar (REFRESH-04: rebuilt idiomatically, not copy-pasted).
 */
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TextField } from "../../components/design-system/FormField";
import { Button } from "../../components/design-system/Button";
import { ConsentCapture } from "../../components/design-system/ConsentCapture";
import { useAuth } from "../../hooks/useAuth";
import { ApiError } from "../../lib/api/http";

function messageOf(err: unknown): string {
  return err instanceof ApiError ? err.message : "Erro inesperado.";
}

const POLICY_VERSION = "1.0";

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  function validate(): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "O nome é obrigatório.";
    if (!email.trim()) errors.email = "O e-mail é obrigatório.";
    if (!birthdate) errors.birthdate = "A data de nascimento é obrigatória.";
    if (!password) errors.password = "A senha é obrigatória.";
    if (password !== confirmPassword) errors.confirmPassword = "As senhas não coincidem.";
    if (!termsAccepted) errors.terms = "É necessário aceitar os termos de uso.";
    return errors;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await register({
        name,
        email,
        password,
        birthdate,
        phone: phone || undefined,
        terms_accepted: true,
      });
      router.push(`/verificar-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
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
            Junte-se à comunidade e não perca nenhum rolê na Grande Vitória.
          </p>
        </div>
        <div className="rounded-[12px] border border-[#2A2E3B] bg-[#12141D] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.01em] text-[#FF2E7E]">
            Comunidade
          </p>
          <p className="mt-1 text-[15px] font-semibold text-[#F5F6FA]">Cena GV</p>
          <p className="mt-1 text-[13px] text-[#9A9FB0]">+14k roqueiros conectados</p>
        </div>
      </section>

      <section aria-label="Formulário de cadastro" className="flex flex-col gap-6">
        <div>
          <h1 className="font-[Space_Grotesk] text-[22px] font-bold text-[#F5F6FA]">
            Criar conta
          </h1>
          <p className="mt-1 text-[13px] text-[#9A9FB0]">
            Junte-se à comunidade e não perca nenhum rolê.
          </p>
        </div>

        {error && (
          <p role="alert" className="text-sm text-[#FF4D4D]">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <TextField id="signup-name" label="Nome" value={name} error={fieldErrors.name} onChange={(e) => setName(e.target.value)} />
        <TextField id="signup-email" label="E-mail" type="email" value={email} error={fieldErrors.email} onChange={(e) => setEmail(e.target.value)} />
        <TextField id="signup-phone" label="Telefone (opcional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <TextField
          id="signup-birthdate"
          label="Data de nascimento"
          type="date"
          value={birthdate}
          error={fieldErrors.birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
        />
        <TextField
          id="signup-password"
          label="Senha"
          type="password"
          value={password}
          error={fieldErrors.password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          id="signup-confirm-password"
          label="Confirmar senha"
          type="password"
          value={confirmPassword}
          error={fieldErrors.confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <ConsentCapture
          policyVersion={POLICY_VERSION}
          checked={termsAccepted}
          onChange={setTermsAccepted}
          error={fieldErrors.terms}
        />
        <Button type="submit">Criar minha conta</Button>
        </form>

        <p className="text-center text-[13px] text-[#9A9FB0]">
          Já tem uma conta?{" "}
          <Link href="/entrar" className="underline">
            Entrar
          </Link>
        </p>
      </section>
    </div>
  );
}

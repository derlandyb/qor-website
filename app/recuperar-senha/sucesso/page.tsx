import Link from "next/link";

/**
 * W21 — password successfully changed (final step of the recovery wizard),
 * matching Stitch screen 469cad10112b4b058602b8e1971eb2d0 ("Sucesso Envio de
 * Link (Desktop)"). Restyled to the same centered card as the rest of the
 * recovery wizard.
 */
export default function PasswordResetSuccessPage() {
  return (
    <div
      role="region"
      aria-label="Senha redefinida com sucesso"
      className="mx-auto flex max-w-md flex-col gap-4 rounded-[16px] border border-[#2A2E3B] bg-[#1B1E29] p-6 text-center md:my-8"
    >
      <h1 className="font-[Space_Grotesk] text-[22px] font-bold text-[#F5F6FA]">Senha redefinida!</h1>
      <p className="text-[14px] text-[#9A9FB0]">
        Sua senha foi alterada com sucesso. Você já pode entrar com a nova senha.
      </p>
      <Link href="/entrar" className="text-[#2EC5FF] underline">
        Fazer login
      </Link>
    </div>
  );
}

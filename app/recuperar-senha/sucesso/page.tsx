import Link from "next/link";

/** W21 — password successfully changed (final step of the recovery wizard). */
export default function PasswordResetSuccessPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 p-4 text-center">
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

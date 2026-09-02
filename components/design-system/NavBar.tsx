"use client";

/**
 * W23 — auth-aware top nav: login/signup links when logged out, a profile
 * link + logout action when logged in. Reuses useSession()/useAuth() (W12)
 * rather than re-deriving session state here.
 */
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, useAuth } from "../../hooks/useAuth";

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href} className={active ? "text-[#F5F6FA]" : "text-[#9A9FB0] hover:text-[#F5F6FA]"}>
      {label}
    </Link>
  );
}

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useSession();
  const { logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <header className="flex items-center justify-between border-b border-[#2A2E3B] bg-[#0B0D14] px-4 py-3">
      <Link href="/" className="font-[Space_Grotesk] text-[18px] font-bold text-[#F5F6FA]">
        QOR
      </Link>
      <nav className="flex items-center gap-4 text-[13px]">
        <NavLink href="/" label="Início" active={pathname === "/"} />
        <NavLink href="/eventos" label="Explorar" active={pathname === "/eventos"} />
        {!loading && user && (
          <>
            <NavLink href="/perfil" label="Meu Perfil" active={pathname === "/perfil"} />
            <button type="button" onClick={() => void handleLogout()} className="text-[#9A9FB0] underline">
              Sair
            </button>
          </>
        )}
        {!loading && !user && (
          <>
            <Link href="/entrar" className="text-[#9A9FB0] hover:text-[#F5F6FA]">
              Entrar
            </Link>
            <Link href="/cadastro" className="text-[#2EC5FF] underline">
              Criar conta
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

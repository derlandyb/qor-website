import Link from "next/link";

/**
 * Only `/` and `/eventos` exist in this app today, so the footer links to
 * those two routes and nothing else — no placeholder sections (about,
 * contact, social icons) pointing at routes this app doesn't have.
 */
export function Footer() {
  return (
    <footer className="border-t border-[#2A2E3B] bg-[#0B0D14] px-4 py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 text-[13px]">
        <span className="font-[Space_Grotesk] text-[18px] font-bold text-[#F5F6FA]">QOR</span>
        <p className="text-[#9A9FB0]">Descubra eventos de música ao vivo na Grande Vitória.</p>
        <nav className="flex items-center gap-4">
          <Link href="/" className="text-[#9A9FB0] hover:text-[#F5F6FA]">
            Início
          </Link>
          <Link href="/eventos" className="text-[#9A9FB0] hover:text-[#F5F6FA]">
            Explorar
          </Link>
        </nav>
        <p className="text-[#666B7D]">© {new Date().getFullYear()} QOR. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}

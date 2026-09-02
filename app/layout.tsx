import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "../components/design-system/NavBar";
import { Footer } from "../components/design-system/Footer";

export const metadata: Metadata = {
  title: "QOR",
  description: "QOR — descubra eventos de música ao vivo na Grande Vitória.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <NavBar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

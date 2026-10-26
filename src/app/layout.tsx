import type { Metadata } from "next";
import "./globals.css";
import "./investigation.css";
import "./night-office.css";
import { Header, Footer } from "@/components/ui";
import { OfficeAtmosphere } from "@/components/office-atmosphere";
export const metadata: Metadata = {
  title: {
    default: "MODO MISTERIO — Cada pista cuenta",
    template: "%s · MODO MISTERIO",
  },
  description:
    "Un juego cooperativo de investigación. Reúne a tu equipo, conecta las pistas y descubre una única verdad.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <OfficeAtmosphere>
          <a href="#contenido" className="skip">
            Saltar al contenido
          </a>
          <Header />
          {children}
          <Footer />
        </OfficeAtmosphere>
      </body>
    </html>
  );
}

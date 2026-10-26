import Link from "next/link";
import Image from "next/image";
import { characterFor } from "@/lib/characters";
import { Fingerprint, ArrowUpRight, Radio } from "lucide-react";
import { isConfigured } from "@/lib/config";
import { AtmosphereControl } from "@/components/office-atmosphere";
export function Avatar({
  kind = "lupa",
  small = false,
}: {
  kind?: string;
  small?: boolean;
}) {
  const character = characterFor(kind);
  return (
    <span className={`avatar character-avatar ${small ? "small" : ""}`}>
      <Image
        src={character.image}
        alt={character.name}
        width={small ? 40 : 64}
        height={small ? 40 : 64}
      />
    </span>
  );
}
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Modo Misterio, inicio">
      <span className="brand-mark">
        <Fingerprint size={26} />
      </span>
      <span>
        MODO<span className="brand-sub">MISTERIO</span>
      </span>
    </Link>
  );
}
export function Header() {
  return (
    <header className="site-header shell">
      <Brand />
      <span className="agency-wordmark" aria-hidden="true">
        AGENCIA DE INVESTIGACIÓN
        <span>UNIDAD DE CASOS SIN RESOLVER</span>
      </span>
      <nav aria-label="Navegación principal">
        <Link href="/#como-jugar" className="hide-mobile">
          Cómo jugar
        </Link>
        <Link href="/panel">
          Mi expediente <ArrowUpRight size={16} />
        </Link>
      </nav>
    </header>
  );
}
export function ConfigNotice() {
  return !isConfigured() ? (
    <div className="notice" role="status">
      <Radio size={18} />
      <span>
        <strong>Conexión pendiente.</strong> Falta configurar Supabase. El
        acceso y las partidas estarán disponibles al conectar el proyecto.
        Consulta el README del repositorio.
      </span>
    </div>
  ) : null;
}
export function Footer() {
  return (
    <footer className="shell site-footer">
      <span>
        MODO MISTERIO{" "}
        <span className="muted">/ Una verdad. Muchas teorías.</span>
      </span>
      <span className="footer-signature">
        <Fingerprint size={23} aria-hidden="true" />
        <span>
          ARCHIVO DE CASOS
          <br />
          <span className="muted">Un juego de ficción · Cooperativo</span>
        </span>
      </span>
      <AtmosphereControl />
    </footer>
  );
}
export function ErrorNotice({ message }: { message: string }) {
  return (
    <div className="notice error" role="alert">
      {message}
    </div>
  );
}
export function Skeleton() {
  return (
    <div className="loading" role="status">
      <span className="spinner" />
      Consultando el expediente…
    </div>
  );
}

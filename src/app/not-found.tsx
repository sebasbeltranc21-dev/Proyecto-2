import Link from "next/link";
export default function NotFound() {
  return (
    <main id="contenido" className="shell dashboard">
      <p className="eyebrow">404 / EXPEDIENTE NO ENCONTRADO</p>
      <h1>Esta pista no lleva a ninguna parte.</h1>
      <p>Revisa la dirección o vuelve al panel para entrar con tu código.</p>
      <Link href="/panel" className="button primary">
        Ir al panel
      </Link>
    </main>
  );
}

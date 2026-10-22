"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="contenido" className="shell dashboard">
      <p className="eyebrow">CONEXIÓN INTERRUMPIDA</p>
      <h1>No pudimos abrir el expediente.</h1>
      <p>Comprueba tu conexión y vuelve a intentarlo.</p>
      <button className="button primary" onClick={reset}>
        Reintentar
      </button>
    </main>
  );
}

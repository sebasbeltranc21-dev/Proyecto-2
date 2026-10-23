import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Users,
  Clock3,
  LockKeyhole,
  Search,
  MessagesSquare,
  Fingerprint,
} from "lucide-react";
import { ConfigNotice } from "@/components/ui";
import { CaseScene } from "@/components/case-scene";
export default function Page() {
  return (
    <main id="contenido" className="shell landing">
      <ConfigNotice />
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="live-dot" /> EXPEDIENTE ABIERTO / 001
          </p>
          <h1>
            La verdad está
            <br />
            entre <em>vosotros.</em>
          </h1>
          <p className="hero-description">
            Un misterio. Pistas que no todos conocen.
            <br />
            Reúne a tu equipo y descubre lo que realmente ocurrió.
          </p>
          <div className="actions">
            <Link href="/panel" className="button primary">
              Crear una sala <ArrowRight size={18} />
            </Link>
            <Link href="/panel#unirse" className="button secondary">
              Tengo un código <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="hero-meta">
            <span>
              <Users size={15} />
              2–8 investigadores
            </span>
            <span>
              <Clock3 size={15} />
              3–35 minutos
            </span>
            <span>
              <LockKeyhole size={15} />
              Sala privada
            </span>
          </div>
        </div>
        <div className="case-visual">
          <Image
            unoptimized
            src="/museum.svg"
            alt="Ilustración original de la sala oscura del Museo Áurea, con una vitrina vacía bajo un haz de luz"
            width="1000"
            height="1000"
          />
          <span className="visual-label">
            <span className="live-dot" /> ESCENA DEL CASO
          </span>
          <div className="visual-caption">
            <span className="eyebrow">MUSEO ÁUREA · 21:17 H</span>
            <h2>
              La última luz
              <br />
              del museo
            </h2>
            <p>
              Una joya desaparecida. Cuatro coartadas.
              <br />
              Noventa segundos para ocultar la verdad.
            </p>
            <span className="case-stamp">01 / CASO INICIAL</span>
          </div>
          <div className="evidence-tag">
            <Fingerprint size={26} />
            <div>
              <b>EVIDENCIA N.º 01</b>
              <span>La vitrina está intacta.</span>
            </div>
          </div>
        </div>
      </section>
      <section className="method" id="como-jugar">
        <div className="section-heading">
          <div>
            <p className="eyebrow">EL MÉTODO</p>
            <h2>Nadie tiene todas las respuestas.</h2>
          </div>
          <p>
            La pieza que te falta puede estar
            <br />
            en manos de otro investigador.
          </p>
        </div>
        <div className="method-grid">
          {[
            {
              n: "01",
              Icon: Search,
              title: "Investiga",
              text: "Examina la escena, conoce a los sospechosos y recibe pistas que solo tú puedes ver.",
            },
            {
              n: "02",
              Icon: MessagesSquare,
              title: "Conecta las pistas",
              text: "Comparte tus hallazgos en el chat. Contrasta las coartadas y construid una teoría juntos.",
            },
            {
              n: "03",
              Icon: Fingerprint,
              title: "Resuelve el caso",
              text: "Emite tu voto antes de que termine el tiempo y descubre la explicación oficial.",
            },
          ].map(({ n, Icon, title, text }) => (
            <article key={n}>
              <div className="method-top">
                <Icon size={24} />
                <span>{n}</span>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="closing">
        <div className="new-case-promo">
          <div className="new-case-scene">
            <CaseScene theme="train" />
          </div>
          <div>
            <p className="eyebrow">NUEVO EXPEDIENTE / 002</p>
            <h2>El Expreso Medianoche</h2>
            <p>
              Un tren detenido. Cinco coartadas. Explora los vagones y
              reconstruye una noche que alguien quiso interrumpir.
            </p>
            <Link href="/panel" className="text-link">
              Elegir mi próximo caso <ArrowRight size={17} />
            </Link>
          </div>
        </div>
        <span className="eyebrow">INVESTIGACIÓN COOPERATIVA</span>
        <h2>
          Todo el equipo.
          <br />
          <em>Una misma verdad.</em>
        </h2>
        <p>Sin descargas. Sin roles ocultos. Solo vuestra deducción.</p>
        <Link href="/panel" className="text-link">
          Abrir mi expediente <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  );
}

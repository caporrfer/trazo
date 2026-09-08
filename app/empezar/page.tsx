import type { Metadata } from 'next';
import { ArrowLeft, ArrowUpRight, Check } from 'lucide-react';
import { Wordmark, Trace } from '@/components/brand';

export const metadata: Metadata = {
  title: 'Tu primer borrador gratis · TRAZO',
  description:
    'Estamos preparando el cuestionario de TRAZO. Pronto podrás solicitar una primera propuesta visual para tu negocio, gratis y sin compromiso.',
};

export default function StartPage() {
  return (
    <div className="start-page">
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <header className="start-header container">
        <Wordmark />
        <a className="text-link" href="/">
          <ArrowLeft aria-hidden="true" /> Volver a la web
        </a>
      </header>
      <main id="contenido" tabIndex={-1} className="start-main container">
        <div className="start-copy">
          <p className="eyebrow">
            <span className="status-dot" /> Cuestionario próximamente
          </p>
          <h1>
            Estamos preparando
            <br />
            <em>el cuestionario.</em>
          </h1>
          <p className="start-description">
            Las buenas webs empiezan por conocernos. Cuando esté disponible,
            podrás contarnos cómo es tu negocio y qué necesitas.
          </p>
          <p className="start-description">
            Con esa información prepararemos tu primera propuesta visual,{' '}
            <strong>gratis y sin compromiso.</strong>
          </p>
          <p className="start-status">Todavía no admite solicitudes.</p>
          <a className="cta cta-dark" href="/#proyectos">
            <span>Mientras tanto, conoce nuestro trabajo</span>
            <span className="cta-arrow">
              <ArrowUpRight aria-hidden="true" />
            </span>
          </a>
        </div>
        <aside className="start-offer" aria-labelledby="start-offer-title">
          <p className="eyebrow">El comienzo de algo tuyo</p>
          <h2 id="start-offer-title">
            Una primera idea.
            <br />
            <em>Sin compromiso.</em>
          </h2>
          <Trace />
          <ul>
            <li>
              <Check aria-hidden="true" /> Primera propuesta visual gratuita
            </li>
            <li>
              <Check aria-hidden="true" /> Pensada para tu negocio
            </li>
            <li>
              <Check aria-hidden="true" /> Sin obligación de contratar
            </li>
          </ul>
          <p>
            El desarrollo de la web definitiva se concreta después, solo si
            decides continuar.
          </p>
        </aside>
      </main>
      <footer className="start-footer container">
        <span>© {new Date().getFullYear()} TRAZO</span>
        <span>Todo empieza con un buen trazo.</span>
      </footer>
    </div>
  );
}

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { PROJECT_CTA_PATH } from './content';
import { Logo } from './logo';

export function FinalCta() {
  return (
    <footer className="final-section">
      <svg className="final-trace" viewBox="0 0 1440 740" preserveAspectRatio="none" aria-hidden="true">
        <path pathLength="1" d="M-40 580c300-330 390 160 650-140s404-53 867-256" />
      </svg>
      <div className="final-copy">
        <p className="eyebrow eyebrow--light"><span /> El próximo paso empieza aquí</p>
        <h2>Dale a tu negocio<br />una web a su <em>altura.</em></h2>
        <Link className="final-button" href={PROJECT_CTA_PATH}>
          <span>Cuéntanos<br />tu idea</span><ArrowUpRight aria-hidden="true" />
        </Link>
      </div>
      <div className="footer-bottom">
        <Logo inverse />
        <p>Diseño, desarrollo y cuidado web<br />para negocios con ganas de más.</p>
        <nav aria-label="Navegación del pie">
          <a href="#proyectos">Ejemplos</a>
          <a href="#servicio">Servicio</a>
          <a href="#preguntas">Preguntas</a>
        </nav>
        <a href="#top" className="back-top">Volver arriba ↑</a>
      </div>
    </footer>
  );
}

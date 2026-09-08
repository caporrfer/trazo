import Link from 'next/link';
import { ArrowDown, ArrowUpRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <svg className="hero-trace" viewBox="0 0 1440 920" preserveAspectRatio="none" aria-hidden="true">
        <path pathLength="1" d="M-30 220C230 92 385 230 465 425s245 328 462 204 256-34 560 98" />
      </svg>
      <div className="hero-orbit hero-orbit--one" aria-hidden="true">diseño</div>
      <div className="hero-orbit hero-orbit--two" aria-hidden="true">web</div>

      <div className="hero-copy">
        <p className="eyebrow"><span /> Webs para negocios con ganas de más</p>
        <h1 id="hero-title">
          Tu negocio merece<br />
          una web que<br />
          <em>se note.</em>
        </h1>
        <div className="hero-actions">
          <Link className="pill-link pill-link--large" href="/proyecto">
            Cuéntanos tu idea <ArrowUpRight aria-hidden="true" />
          </Link>
          <a className="text-link" href="#proyectos">
            Explora lo que podemos crear <ArrowDown aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className="hero-note">
        <span>01</span>
        <p>Diseñamos, lanzamos y cuidamos la web de tu negocio. Todo en un mismo sitio, sin complicarte.</p>
      </div>

      <div className="hero-window" aria-label="Vista previa de una web conceptual para un negocio">
        <div className="window-bar"><i /><i /><i /><span>ejemplo-web.com</span></div>
        <div className="window-content">
          {/* oxlint-disable-next-line next/no-img-element */}
          <img src="/images/tienda-online-generica.jpg" width="1536" height="1024" fetchPriority="high" alt="Ejemplo visual de una tienda online de productos sin marca" />
          <div className="window-overlay">
            <span>UNA WEB PARA TU NEGOCIO</span>
            <strong>Hecha para<br />hacerse notar.</strong>
            <small>Ejemplo conceptual</small>
          </div>
        </div>
      </div>

      <div className="hero-ticker" aria-hidden="true">
        <div>
          <span>DISEÑO</span><i>✦</i><span>DESARROLLO</span><i>✦</i><span>LANZAMIENTO</span><i>✦</i><span>MANTENIMIENTO</span><i>✦</i>
          <span>DISEÑO</span><i>✦</i><span>DESARROLLO</span><i>✦</i><span>LANZAMIENTO</span><i>✦</i><span>MANTENIMIENTO</span><i>✦</i>
        </div>
      </div>
    </section>
  );
}

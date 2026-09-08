import {
  ArrowDown,
  ArrowUpRight,
  Check,
  MoveUpRight,
  Plus,
} from 'lucide-react';
import { DraftCta, SectionLabel, Trace } from '@/components/brand';
import { SiteHeader, SiteFooter, MobileCta } from '@/components/site-chrome';
import { Faq } from '@/components/faq';
import { RevealMotion } from '@/components/reveal-motion';
import { projects, processSteps, needs } from '@/lib/content';

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <SiteHeader />
      <main id="contenido" tabIndex={-1} className="home-main">
        <section className="hero" aria-labelledby="hero-title">
          <div className="container hero-inner">
            <div
              className="hero-topline hero-enter"
              style={{ '--enter-delay': '0ms' } as React.CSSProperties}
            >
              <span className="eyebrow">
                <span className="status-dot" /> Estudio de diseño & desarrollo
                web
              </span>
              <span className="hero-side-note">
                Buenas ideas.
                <br />
                Mejores primeras impresiones.
              </span>
            </div>
            <h1 id="hero-title">
              <span
                className="hero-line"
                style={{ '--enter-delay': '80ms' } as React.CSSProperties}
              >
                Hacemos que
              </span>{' '}
              <span
                className="hero-line"
                style={{ '--enter-delay': '170ms' } as React.CSSProperties}
              >
                tu negocio marque
              </span>{' '}
              <span
                className="hero-line hero-last"
                style={{ '--enter-delay': '260ms' } as React.CSSProperties}
              >
                la <em>diferencia</em>
                <span className="title-period" aria-hidden="true">
                  .
                </span>
                <Trace className="hero-trace" />
              </span>
            </h1>
            <div
              className="hero-bottom hero-enter"
              style={{ '--enter-delay': '400ms' } as React.CSSProperties}
            >
              <p>
                Tu negocio tiene algo especial.
                <br />
                Diseñamos la web que lo hace visible y pone las cosas fáciles a
                tus clientes.
              </p>
              <div className="hero-action">
                <DraftCta />
                <p className="hero-promise">
                  <Check aria-hidden="true" /> Tu primer borrador es gratis y
                  sin compromiso.
                </p>
              </div>
            </div>
            <a className="hero-explore" href="#quienes-somos">
              <ArrowDown aria-hidden="true" /> Un poco más sobre nosotros
            </a>
          </div>
          <div className="hero-caption" aria-hidden="true">
            <span>Diseño con intención</span>
            <Plus />
            <span>Desarrollo con criterio</span>
            <Plus />
            <span>Tu negocio, en su mejor versión</span>
          </div>
        </section>

        <section
          id="quienes-somos"
          className="about section-pad"
          aria-labelledby="about-title"
        >
          <div className="container editorial-grid">
            <SectionLabel number="01">Quiénes somos</SectionLabel>
            <div className="about-content" data-reveal>
              <h2 id="about-title">
                Detrás de cada negocio
                <br />
                hay una historia.
                <br />
                <em>Le damos forma.</em>
              </h2>
              <div className="about-copy">
                <p>
                  Somos TRAZO. Un estudio de diseño y desarrollo web que
                  transforma lo que hace especial a tu empresa en una presencia
                  digital con personalidad.
                </p>
                <p>
                  Unimos diseño cuidado, desarrollo profesional y contenido
                  claro para que tu negocio sea más visible, más accesible y más
                  fácil de entender. Para quien lo dirige. Para quien lo
                  descubre. Para quien vuelve.
                </p>
              </div>
              <div className="about-principles">
                <span>
                  <Plus aria-hidden="true" /> Claridad
                </span>
                <span>
                  <Plus aria-hidden="true" /> Personalidad
                </span>
                <span>
                  <Plus aria-hidden="true" /> Criterio
                </span>
              </div>
            </div>
          </div>
        </section>

        <section
          id="como-trabajamos"
          className="process section-pad"
          aria-labelledby="process-title"
        >
          <div className="container">
            <div className="section-heading" data-reveal>
              <SectionLabel number="02">Cómo trabajamos</SectionLabel>
              <h2 id="process-title">
                Todo empieza
                <br />
                con <em>una conversación.</em>
              </h2>
              <p>
                Nos cuentas tu idea.
                <br />
                Nosotros trazamos el siguiente paso.
              </p>
            </div>
            <div className="process-grid">
              {processSteps.map((step) => (
                <article className="process-step" key={step.number} data-reveal>
                  <div className="step-top">
                    <span className="step-number">{step.number}</span>
                    {step.free ? (
                      <span className="small-tag">Gratis y sin compromiso</span>
                    ) : (
                      <ArrowUpRight aria-hidden="true" />
                    )}
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>
            <div className="process-bottom" data-reveal>
              <p>
                El primer paso no cuesta nada.
                <br />
                <strong>Y puede cambiar cómo te ven.</strong>
              </p>
              <DraftCta />
            </div>
          </div>
        </section>

        <section
          id="a-tu-medida"
          className="adapt section-pad"
          aria-labelledby="adapt-title"
        >
          <div className="container adapt-grid">
            <div className="adapt-intro" data-reveal>
              <SectionLabel number="03">A tu medida</SectionLabel>
              <h2 id="adapt-title">
                Tu empresa
                <br />
                no es como otra.
                <br />
                <em>Tu web tampoco.</em>
              </h2>
              <p>
                Una tienda, un restaurante, un despacho o una empresa de
                servicios. Entendemos lo que necesitas y damos a cada cosa su
                sitio.
              </p>
              <span className="adapt-note">
                <Trace /> El punto de partida siempre eres tú.
              </span>
            </div>
            <div className="needs-list">
              {needs.map((need, index) => (
                <article className="need" key={need.title} data-reveal>
                  <span className="need-index">0{index + 1}</span>
                  <div>
                    <h3>{need.title}</h3>
                    <p>{need.description}</p>
                  </div>
                  <Plus aria-hidden="true" />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="borrador-gratis"
          className="free-draft section-pad"
          aria-labelledby="draft-title"
        >
          <div className="container draft-grid">
            <div className="draft-copy" data-reveal>
              <SectionLabel number="04">Empezamos por una idea</SectionLabel>
              <h2 id="draft-title">
                Tu primer
                <br />
                borrador, <em>gratis.</em>
              </h2>
              <p>
                Antes de decidir, imagina lo que podemos hacer juntos.
                Preparamos una primera propuesta visual para tu negocio. Sin
                coste. Sin obligación de contratar.
              </p>
              <DraftCta tone="light" />
              <p className="draft-clarification">
                Es una propuesta de diseño inicial. El desarrollo de la web
                definitiva se concreta después, si decides continuar.
              </p>
            </div>
            <div className="draft-note" data-reveal>
              <span className="note-eyebrow">El comienzo de algo tuyo</span>
              <div className="note-zero">
                0<span>€</span>
              </div>
              <p>
                Una primera idea.
                <br />
                <em>Muchas posibilidades.</em>
              </p>
              <div className="note-rule" />
              <span className="note-foot">
                <Check aria-hidden="true" /> Tú decides si seguimos.
              </span>
              <Trace className="note-trace" />
            </div>
          </div>
        </section>

        <section
          id="proyectos"
          className="projects section-pad"
          aria-labelledby="projects-title"
        >
          <div className="container">
            <div className="section-heading projects-heading" data-reveal>
              <SectionLabel number="05">Hecho por TRAZO</SectionLabel>
              <h2 id="projects-title">
                Conoce hasta dónde
                <br />
                <em>podemos llegar.</em>
              </h2>
              <p>
                Dos negocios con personalidad.
                <br />
                Dos formas distintas de llevarla a la web.
              </p>
            </div>
            <div className="projects-grid">
              {projects.map((project) => (
                <article
                  className={`project-card project-${project.id}`}
                  key={project.id}
                  data-reveal
                >
                  <a
                    className="project-visual"
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visitar la web de ${project.name} (se abre en una pestaña nueva)`}
                  >
                    <img
                      src={project.image}
                      alt={project.imageAlt}
                      width={project.width}
                      height={project.height}
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="project-category">{project.category}</span>
                    <span className="project-open" aria-hidden="true">
                      <MoveUpRight />
                    </span>
                  </a>
                  <div className="project-info">
                    <div>
                      <h3>{project.name}</h3>
                      <p>{project.description}</p>
                    </div>
                    <a
                      className="text-link"
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visitar web de ${project.name} (se abre en una pestaña nueva)`}
                    >
                      Visitar web <ArrowUpRight aria-hidden="true" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
            <p className="projects-footnote">
              <span className="status-dot" /> Diseñadas y desarrolladas por
              TRAZO. Cada una, con su propio carácter.
            </p>
          </div>
        </section>

        <section
          id="preguntas"
          className="faq-section section-pad"
          aria-labelledby="faq-title"
        >
          <div className="container faq-grid">
            <div className="faq-intro" data-reveal>
              <SectionLabel number="06">Sin letra pequeña</SectionLabel>
              <h2 id="faq-title">
                Buenas preguntas.
                <br />
                <em>Respuestas claras.</em>
              </h2>
              <p>
                Lo que quizá te estás preguntando antes de dar el primer paso.
              </p>
            </div>
            <Faq />
          </div>
        </section>

        <section className="closing" aria-labelledby="closing-title">
          <div className="container closing-inner" data-reveal>
            <span className="eyebrow">Tu próxima buena idea empieza aquí</span>
            <h2 id="closing-title">
              ¿Le damos
              <br />
              <em>un nuevo trazo?</em>
              <Trace />
            </h2>
            <p>
              Tu primer borrador es gratis y sin compromiso.
              <br />
              El siguiente paso lo decides tú.
            </p>
            <DraftCta />
          </div>
        </section>
      </main>
      <SiteFooter />
      <MobileCta />
      <RevealMotion />
    </>
  );
}

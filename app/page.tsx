import {
  ArrowDownRight,
  ArrowRight,
  Check,
  ExternalLink,
  MapPin,
  Menu,
  MoveRight,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { FAQ } from '@/components/faq';
import { plans } from '@/lib/site';

const process = [
  {
    number: '01',
    title: 'Nos cuentas',
    text: 'Nos envías la información, las fotos y todo lo que hace único a tu negocio.',
  },
  {
    number: '02',
    title: 'Le damos forma',
    text: 'Ordenamos el contenido, afinamos el mensaje y diseñamos una web con personalidad.',
  },
  {
    number: '03',
    title: 'La revisamos',
    text: 'Te enseñamos el resultado, recogemos tus comentarios y dejamos cada detalle en su sitio.',
  },
  {
    number: '04',
    title: 'La ponemos en marcha',
    text: 'La publicamos para que puedas compartirla desde Google Maps, redes y donde quieras.',
  },
];

const services = [
  {
    index: '01',
    title: 'Tu negocio, bien contado',
    text: 'Convertimos lo que ya tienes en una historia clara: qué haces, por qué elegirte y cómo encontrarte.',
  },
  {
    index: '02',
    title: 'Todo a mano',
    text: 'Servicios, carta, horarios, ubicación y contacto organizados para que nadie tenga que buscar de más.',
  },
  {
    index: '03',
    title: 'Perfecta en móvil',
    text: 'La mayoría de tus clientes llegará desde el teléfono. Diseñamos primero para ese momento.',
  },
  {
    index: '04',
    title: 'Lista para compartir',
    text: 'Una dirección propia que puedes enlazar desde Google Maps, Instagram, WhatsApp o tus tarjetas.',
  },
];

function Logo() {
  return (
    <span className="logo" aria-label="Trazo">
      <svg aria-hidden="true" viewBox="0 0 34 34" className="logo-mark">
        <path d="M5 9.5h24M17 9.5v19M8 28.5h18" />
        <circle cx="17" cy="9.5" r="3" />
      </svg>
      <span>trazo</span>
    </span>
  );
}

function ArrowLink({
  href,
  children,
  className = '',
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link className={`arrow-link ${className}`} href={href}>
      <span>{children}</span>
      <ArrowRight aria-hidden="true" />
    </Link>
  );
}

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a
          href="#inicio"
          className="brand-link"
          aria-label="Trazo, volver al inicio"
        >
          <Logo />
        </a>

        <nav className="desktop-nav" aria-label="Navegación principal">
          <a href="#proyectos">Ejemplos</a>
          <a href="#proceso">Cómo funciona</a>
          <a href="#precios">Precios</a>
        </nav>

        <Link className="header-cta" href="/empezar">
          Quiero mi web <ArrowUpRightIcon />
        </Link>

        <details className="mobile-menu">
          <summary aria-label="Abrir menú">
            <Menu aria-hidden="true" />
          </summary>
          <nav aria-label="Navegación móvil">
            <a href="#proyectos">Ejemplos</a>
            <a href="#proceso">Cómo funciona</a>
            <a href="#precios">Precios</a>
            <Link href="/empezar">Quiero mi web</Link>
          </nav>
        </details>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow">
            <span /> Webs para negocios con algo que contar
          </p>
          <h1>
            Tu negocio tiene algo <em>especial.</em>
            <br />
            Que se vea.
          </h1>
          <div className="hero-bottom">
            <p>
              Diseñamos la web que tu negocio merece y nos encargamos de ponerla
              en marcha. Clara, personal y lista para compartir.
            </p>
            <div className="hero-actions">
              <ArrowLink href="/empezar" className="primary-link">
                Quiero mi web
              </ArrowLink>
              <a className="text-link" href="#proyectos">
                Ver ejemplos <ArrowDownRight aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        <div
          className="hero-art"
          aria-label="Vista conceptual de una web creada por Trazo"
        >
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="browser-card">
            <div className="browser-bar">
              <span />
              <span />
              <span />
              <i>trazo.site/tu-negocio</i>
            </div>
            <div className="concept-hero">
              <span className="concept-label">La Mesa · Cocina de barrio</span>
              <strong>
                Comer bien.
                <br />
                Sentirse en casa.
              </strong>
              <div className="concept-button">
                Ver la carta <MoveRight />
              </div>
            </div>
          </div>
          <div className="floating-note note-one">
            Pensada para móvil <span>✓</span>
          </div>
          <div className="floating-note note-two">
            Lista para Google Maps <MapPin />
          </div>
        </div>

        <div className="scroll-cue" aria-hidden="true">
          <span>Descubre Trazo</span>
          <i />
        </div>
      </section>

      <section className="statement section-shell">
        <p className="section-kicker">Lo que hacemos</p>
        <h2>Una web no debería ser otra tarea pendiente.</h2>
        <p className="statement-copy">
          Tú conoces tu negocio. Nosotros sabemos cómo presentarlo. Nos das el
          material y nos ocupamos de convertirlo en una web que se entiende, se
          recuerda y hace fácil dar el siguiente paso.
        </p>
      </section>

      <section className="projects section-shell" id="proyectos">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Así podría verse</p>
            <h2>
              Diseñamos para
              <br />
              cada negocio.
            </h2>
          </div>
          <p>
            Dos ejemplos de cómo una identidad bien enfocada puede transformar
            la primera impresión.
          </p>
        </div>

        <article className="project-card project-lumbre">
          <Image
            src="/images/restaurante-lumbre.jpg"
            alt="Concepto de restaurante contemporáneo iluminado por la noche"
            fill
            sizes="(max-width: 800px) calc(100vw - 40px), min(calc(100vw - 80px), 1440px)"
          />
          <div className="project-shade" />
          <div className="project-topline">
            <span>Proyecto conceptual · Restauración</span>
            <span>01 / 02</span>
          </div>
          <div className="project-wordmark">
            lumbre<span>.</span>
          </div>
          <div className="project-info">
            <div>
              <p>Cocina honesta · Madrid</p>
              <h3>
                Una mesa que empieza
                <br />
                antes de llegar.
              </h3>
            </div>
            <div className="mini-site lumbre-site" aria-hidden="true">
              <div className="mini-nav">
                <span>lumbre.</span>
                <i>carta &nbsp; reservar</i>
              </div>
              <strong>
                Fuego lento.
                <br />
                Mesa larga.
              </strong>
              <span className="mini-cta">Descubre la carta ↗</span>
            </div>
          </div>
        </article>

        <article className="project-card project-cobalto">
          <Image
            src="/images/atelier-cobalto.jpg"
            alt="Concepto de boutique de moda independiente al anochecer"
            fill
            sizes="(max-width: 800px) calc(100vw - 40px), min(calc(100vw - 80px), 1440px)"
          />
          <div className="project-shade" />
          <div className="project-topline">
            <span>Proyecto conceptual · Moda</span>
            <span>02 / 02</span>
          </div>
          <div className="project-wordmark cobalto-wordmark">Cobalto/26</div>
          <div className="project-info">
            <div>
              <p>Moda independiente · Barcelona</p>
              <h3>
                Una colección con
                <br />
                su propio espacio.
              </h3>
            </div>
            <div className="mini-site cobalto-site" aria-hidden="true">
              <div className="mini-nav">
                <span>C/26</span>
                <i>Nueva colección &nbsp; Estudio</i>
              </div>
              <strong>
                Hecho para
                <br />
                salir del molde.
              </strong>
              <span className="mini-cta">Ver colección ↗</span>
            </div>
          </div>
        </article>
      </section>

      <section className="services section-shell">
        <div className="section-heading services-heading">
          <div>
            <p className="section-kicker">Todo lo esencial</p>
            <h2>
              Una web pequeña.
              <br />
              Una gran diferencia.
            </h2>
          </div>
          <p>
            Sin funciones innecesarias. Solo lo que tus clientes necesitan para
            conocerte, encontrarte y contactarte.
          </p>
        </div>
        <div className="services-grid">
          {services.map((service) => (
            <article key={service.index} className="service-card">
              <span>{service.index}</span>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
              <ArrowDownRight aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      <section className="process" id="proceso">
        <div className="section-shell process-inner">
          <div className="process-intro">
            <p className="section-kicker dark-kicker">Cómo funciona</p>
            <h2>
              De tus ideas
              <br />a una web.
            </h2>
            <p>Un proceso directo, sin palabras raras ni reuniones eternas.</p>
          </div>
          <div className="process-list">
            {process.map((step) => (
              <article key={step.number}>
                <span>{step.number}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pricing section-shell" id="precios">
        <div className="pricing-heading">
          <p className="section-kicker">Precios claros</p>
          <h2>
            La misma buena web.
            <br />
            Tú eliges cómo seguir.
          </h2>
          <p>
            Tres formas de empezar, con el mismo cuidado en el diseño y la
            puesta en marcha.
          </p>
        </div>

        <div className="pricing-grid">
          {plans.map((plan) => (
            <article
              key={plan.slug}
              className={`price-card ${plan.featured ? 'featured' : ''}`}
            >
              {plan.featured && (
                <span className="recommended">La opción más completa</span>
              )}
              <div className="price-card-head">
                <p>{plan.name}</p>
                <span>{plan.number}</span>
              </div>
              <div className="price">
                <strong>{plan.price}</strong>
                {plan.suffix && <span>{plan.suffix}</span>}
              </div>
              <p className="price-description">{plan.description}</p>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Check aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <ArrowLink
                href={`/empezar?plan=${plan.slug}`}
                className={plan.featured ? 'primary-link' : ''}
              >
                Elegir esta opción
              </ArrowLink>
            </article>
          ))}
        </div>
        <p className="pricing-note">
          Los planes mensuales no tienen permanencia. Las ampliaciones,
          funcionalidades nuevas y rediseños se valoran aparte.
        </p>
      </section>

      <section className="faq-section section-shell">
        <div className="faq-heading">
          <p className="section-kicker">Preguntas frecuentes</p>
          <h2>
            Antes de
            <br />
            empezar.
          </h2>
          <p>
            Si te queda alguna duda, el formulario nos ayudará a conocer tu
            caso.
          </p>
        </div>
        <FAQ />
      </section>

      <section className="final-cta">
        <div className="cta-orbit" aria-hidden="true" />
        <p className="section-kicker dark-kicker">Tu próximo paso</p>
        <h2>
          Tu negocio ya tiene
          <br />
          una historia.
          <br />
          <em>Vamos a dibujarla.</em>
        </h2>
        <ArrowLink href="/empezar" className="primary-link">
          Quiero mi web
        </ArrowLink>
      </section>

      <footer>
        <div className="footer-main section-shell">
          <Logo />
          <p>Webs con intención para negocios con personalidad.</p>
          <Link href="/empezar">
            Empezar un proyecto <ExternalLink aria-hidden="true" />
          </Link>
        </div>
        <div className="footer-bottom section-shell">
          <span>© {new Date().getFullYear()} Trazo</span>
          <span>Diseñado para negocios que dejan huella.</span>
        </div>
      </footer>
    </main>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M4 12 12 4M5 4h7v7" />
    </svg>
  );
}

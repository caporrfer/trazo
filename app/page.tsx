import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Check, Globe2, MessageCircle, Phone, Search, ShoppingBag, Wrench } from "lucide-react";
import { Brand } from "@/components/Brand";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: { absolute: "Trazo · Creación de páginas web y tiendas online" },
  description:
    "Hacemos páginas web y tiendas online a medida. Web informativa desde 190 € y mantenimiento con dominio, hosting, SEO e informes mensuales incluidos.",
};

const PHONE_DISPLAY = "634 470 824";
const PHONE_TEL = "tel:+34634470824";
const WHATSAPP = "https://wa.me/34634470824?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20una%20p%C3%A1gina%20web";

const services = [
  { icon: Globe2, title: "Páginas web", text: "Webs claras y rápidas para que tus clientes te encuentren, vean lo que haces y te contacten. Adaptadas a móvil desde el primer día." },
  { icon: ShoppingBag, title: "Tiendas online", text: "Vende tus productos por internet con catálogo, carrito y pagos seguros, sin que tengas que pelearte con la parte técnica." },
  { icon: Search, title: "SEO y posicionamiento en Google", text: "Cuidamos textos, velocidad y estructura para que tu negocio aparezca cuando alguien busca lo que ofreces en tu zona." },
  { icon: BarChart3, title: "Informes mensuales", text: "Cada mes te enviamos un resumen de cómo está funcionando la web: visitas, búsquedas y lo que podemos mejorar." },
];

const plans = [
  {
    name: "Web informativa",
    setup: "190 €",
    monthly: "29 €",
    text: "Para presentar tu negocio, tus servicios y que te contacten.",
    features: ["Diseño a medida y adaptado a móvil", "Las secciones que necesites", "Formulario, WhatsApp y mapa", "Optimización SEO inicial"],
  },
  {
    name: "Web con tienda online",
    setup: "490 €",
    monthly: "39 €",
    text: "Para vender tus productos por internet.",
    features: ["Todo lo de la web informativa", "Catálogo de productos y carrito", "Pagos online seguros", "Gestión de pedidos sencilla"],
    featured: true,
  },
];

const maintenance = [
  "Dominio y hosting incluidos",
  "Actualizaciones y cambios en la web",
  "Seguridad y certificado SSL (https)",
  "Seguimiento SEO en Google",
  "Informe mensual de resultados",
  "Soporte directo por teléfono o WhatsApp",
];

const steps = [
  { title: "Hablamos", text: "Nos cuentas tu negocio y lo que necesitas. Sin compromiso." },
  { title: "Diseñamos", text: "Preparamos la web y la ajustamos contigo hasta que te guste." },
  { title: "Publicamos", text: "La ponemos en marcha con tu dominio y lista para Google." },
  { title: "La cuidamos", text: "Mantenimiento, cambios e informes cada mes. Tú a lo tuyo." },
];

export default function HomePage() {
  return (
    <div className="landing-page">
      <header className={styles.hero}>
        <div className={styles.content}>
          <Brand href="/" className="brand-hero" />
          <hr className={styles.accent} />
          <h1>Creación de páginas web</h1>
          <p className={styles.lead}>
            Hacemos webs y tiendas online para negocios. Nos encargamos de todo: diseño, dominio, hosting, posicionamiento en Google y mantenimiento.
          </p>
          <div className={styles.ctas}>
            <a className="button button-primary" href={WHATSAPP} target="_blank" rel="noreferrer"><MessageCircle size={20} aria-hidden="true" /> Escríbenos por WhatsApp</a>
            <a className="button button-secondary" href={PHONE_TEL}><Phone size={20} aria-hidden="true" /> {PHONE_DISPLAY}</a>
          </div>
        </div>
        <a className={styles.scrollHint} href="#servicios">Ver qué hacemos ↓</a>
      </header>

      <main id="contenido">
        <section id="servicios" className={styles.section}>
          <p className="eyebrow">Qué hacemos</p>
          <h2>Tu negocio, bien presentado en internet</h2>
          <div className={styles.services}>
            {services.map(({ icon: Icon, title, text }) => (
              <article className={styles.card} key={title}>
                <span className={styles.icon}><Icon aria-hidden="true" /></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="precios" className={`${styles.section} ${styles.pricing}`}>
          <p className="eyebrow">Precios</p>
          <h2>Precios claros, sin sorpresas</h2>
          <div className={styles.plans}>
            {plans.map((plan) => (
              <article className={`${styles.plan} ${plan.featured ? styles.planFeatured : ""}`} key={plan.name}>
                <h3>{plan.name}</h3>
                <p className={styles.planText}>{plan.text}</p>
                <p className={styles.price}><strong>{plan.setup}</strong> <span>desarrollo</span></p>
                <p className={styles.priceMonthly}>+ <strong>{plan.monthly}</strong>/mes de mantenimiento</p>
                <ul>
                  {plan.features.map((feature) => <li key={feature}><Check size={18} aria-hidden="true" /> {feature}</li>)}
                </ul>
              </article>
            ))}
          </div>
          <div className={styles.maintenance}>
            <div>
              <span className={styles.icon}><Wrench aria-hidden="true" /></span>
              <h3>¿Qué incluye el mantenimiento?</h3>
              <p>Con la cuota mensual no tienes que preocuparte de nada más:</p>
            </div>
            <ul>
              {maintenance.map((item) => <li key={item}><Check size={18} aria-hidden="true" /> {item}</li>)}
            </ul>
          </div>
          <p className={styles.note}>Si necesitas algo a medida, te hacemos un presupuesto sin compromiso.</p>
        </section>

        <section className={styles.section}>
          <p className="eyebrow">Cómo trabajamos</p>
          <h2>De la idea a tu web publicada</h2>
          <ol className={styles.steps}>
            {steps.map((step, index) => (
              <li key={step.title}>
                <span className={styles.stepNumber}>{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="contacto" className={`${styles.section} ${styles.contact}`}>
          <h2>¿Hablamos de tu web?</h2>
          <p>Llámanos o escríbenos por WhatsApp y te contamos cómo quedaría la tuya.</p>
          <a className={styles.phone} href={PHONE_TEL}>{PHONE_DISPLAY}</a>
          <div className={styles.ctas}>
            <a className="button button-primary" href={WHATSAPP} target="_blank" rel="noreferrer"><MessageCircle size={20} aria-hidden="true" /> WhatsApp</a>
            <a className="button button-secondary" href={PHONE_TEL}><Phone size={20} aria-hidden="true" /> Llamar</a>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <Brand href="/" compact />
        <span>Diseño web con intención</span>
        <nav aria-label="Información legal">
          <Link href="/privacidad">Privacidad</Link>
          <Link href="/aviso-legal">Aviso legal</Link>
        </nav>
      </footer>
    </div>
  );
}

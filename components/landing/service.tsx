import { ArrowUpRight, Asterisk, CircleDotDashed, MousePointer2, Wrench } from 'lucide-react';
import Link from 'next/link';
import { PROJECT_CTA_PATH } from './content';

const cards = [
  { number: '01', icon: Asterisk, title: 'Una web con criterio', text: 'Ordenamos tus ideas, encontramos el mensaje y lo convertimos en una web que se reconoce como tuya.' },
  { number: '02', icon: MousePointer2, title: 'Lista para ponerse en marcha', text: 'Diseñamos, desarrollamos y preparamos cada detalle para que puedas compartirla con confianza.' },
  { number: '03', icon: Wrench, title: 'Cuidada también después', text: 'Seguimos cerca para ajustar el diseño, el contenido y las secciones cuando tu negocio lo necesite.' },
];

export function Service() {
  return (
    <section id="servicio" className="service-section" aria-labelledby="service-title">
      <div className="service-heading">
        <p className="eyebrow"><span /> Un servicio completo</p>
        <h2 id="service-title">De la primera idea<br />al último <em>ajuste.</em></h2>
        <p>Una única dirección para todo el proyecto. Menos vueltas, más claridad y una web que empieza bien y sigue funcionando bien.</p>
      </div>
      <div className="service-cards">
        {cards.map(({ number, icon: Icon, title, text }) => (
          <article key={number} className="service-card">
            <div><span>{number}</span><Icon aria-hidden="true" /></div>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <div className="service-callout">
        <CircleDotDashed aria-hidden="true" />
        <p><strong>Tu negocio ya tiene algo que contar.</strong> Nosotros le damos la forma para que se entienda y se recuerde.</p>
        <Link href={PROJECT_CTA_PATH} aria-label="Cuéntanos tu proyecto">Hablemos <ArrowUpRight aria-hidden="true" /></Link>
      </div>
    </section>
  );
}

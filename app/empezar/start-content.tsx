'use client';

import { ArrowLeft, Check, MoveUpRight } from 'lucide-react';
import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { plans } from '@/lib/site';

type Plan = (typeof plans)[number];

export function StartContent() {
  const selectedSlug = useSyncExternalStore(
    () => () => undefined,
    () => new URLSearchParams(window.location.search).get('plan') ?? '',
    () => '',
  );
  const selectedPlan: Plan | null =
    plans.find((plan) => plan.slug === selectedSlug) ?? null;

  return (
    <main className="start-page">
      <header className="start-header">
        <Link
          href="/"
          className="start-logo"
          aria-label="Trazo, volver al inicio"
        >
          <svg aria-hidden="true" viewBox="0 0 34 34">
            <path d="M5 9.5h24M17 9.5v19M8 28.5h18" />
            <circle cx="17" cy="9.5" r="3" />
          </svg>
          <span>trazo</span>
        </Link>
        <Link href="/" className="back-link">
          <ArrowLeft aria-hidden="true" /> Volver a la web
        </Link>
      </header>

      <section className="start-inner">
        <div className="start-copy">
          <p className="eyebrow">
            <span /> Empezar un proyecto
          </p>
          <h1>
            Estamos preparando
            <br />
            la forma de <em>conocerte.</em>
          </h1>
          <p>
            Muy pronto podrás contarnos aquí cómo es tu negocio y qué necesita.
            Así podremos preparar una propuesta con toda la información desde el
            principio.
          </p>
          <Link href="/" className="start-home-link">
            Mientras tanto, descubre Trazo <MoveUpRight aria-hidden="true" />
          </Link>
        </div>

        <aside className="selected-plan is-ready" aria-live="polite">
          {selectedPlan ? (
            <>
              <p className="selected-label">Has elegido</p>
              <div className="selected-head">
                <h2>{selectedPlan.name}</h2>
                <span>{selectedPlan.number}</span>
              </div>
              <div className="selected-price">
                <strong>{selectedPlan.price}</strong>
                {selectedPlan.suffix && <span>{selectedPlan.suffix}</span>}
              </div>
              <p>{selectedPlan.description}</p>
              <ul>
                {selectedPlan.features.map((feature) => (
                  <li key={feature}>
                    <Check aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/#precios">Cambiar de opción</Link>
            </>
          ) : (
            <>
              <p className="selected-label">Tu proyecto</p>
              <h2>Cuéntanos qué necesita tu negocio.</h2>
              <p>
                El formulario estará disponible próximamente. Cuando vuelva,
                podrás elegir una de las tres opciones y continuar desde aquí.
              </p>
              <Link href="/#precios">Ver las opciones</Link>
            </>
          )}
        </aside>
      </section>

      <div className="start-footer">
        <span>© {new Date().getFullYear()} Trazo</span>
        <span>Formulario próximamente</span>
      </div>
    </main>
  );
}

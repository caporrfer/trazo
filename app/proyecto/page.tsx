import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Logo } from '@/components/landing/logo';

export default function ProjectPage() {
  return (
    <main className="project-page">
      <header className="project-page-header">
        <Logo />
        <Link href="/"><ArrowLeft aria-hidden="true" /> Volver al inicio</Link>
      </header>
      <section className="project-placeholder" aria-labelledby="project-page-title">
        <div className="project-placeholder-icon"><Sparkles aria-hidden="true" /></div>
        <p className="eyebrow"><span /> El formulario está en camino</p>
        <h1 id="project-page-title">Estamos preparando el formulario para <em>conocer tu proyecto.</em></h1>
        <p>Muy pronto podrás contarnos aquí qué necesita tu negocio. Mientras tanto, puedes volver a descubrir Trazo.</p>
        <Link className="pill-link pill-link--large" href="/"><ArrowLeft aria-hidden="true" /> Volver a la web</Link>
      </section>
      <svg className="placeholder-trace" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true">
        <path d="M-40 680C216 310 422 804 697 448S1122 162 1490 332" />
      </svg>
    </main>
  );
}

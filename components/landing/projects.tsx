'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, MoveHorizontal } from 'lucide-react';
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { projects } from './content';

export function Projects() {
  const [active, setActive] = useState(0);
  const [mobileActive, setMobileActive] = useState(0);
  const [mobileApi, setMobileApi] = useState<CarouselApi>();
  const items = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(Number((visible.target as HTMLElement).dataset.index));
      },
      { rootMargin: '-30% 0px -42% 0px', threshold: [0, 0.2, 0.6, 1] },
    );

    items.current.forEach((item) => item && observer.observe(item));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!mobileApi) return;

    const updateMobileActive = () => setMobileActive(mobileApi.selectedScrollSnap());
    updateMobileActive();
    mobileApi.on('select', updateMobileActive);
    mobileApi.on('reInit', updateMobileActive);

    return () => {
      mobileApi.off('select', updateMobileActive);
      mobileApi.off('reInit', updateMobileActive);
    };
  }, [mobileApi]);

  const current = projects[active];

  return (
    <section id="proyectos" className="projects-section" aria-labelledby="projects-title">
      <div className="section-intro section-intro--projects">
        <p className="eyebrow eyebrow--light"><span /> Webs para cada tipo de negocio</p>
        <h2 id="projects-title">Tu negocio,<br /><em>bien contado.</em></h2>
        <p className="section-lead">Diseñamos la experiencia alrededor de lo que necesitas conseguir: reservas, ventas o nuevos contactos.</p>
      </div>

      <div className="project-scroll">
        <div className="project-descriptions">
          {projects.map((project, index) => (
            <article
              key={project.id}
              className="project-copy"
              data-index={index}
              data-active={active === index}
              ref={(element) => { items.current[index] = element; }}
            >
              <div className="project-meta">
                <span>{project.number}</span>
                <span>Ejemplo de sector</span>
              </div>
              <p className="project-category">{project.category}</p>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
            </article>
          ))}
        </div>

        <div className="project-stage" aria-live="polite">
          <div className="stage-shadow" />
          <div className="browser-frame" style={{ '--project-accent': current.accent } as React.CSSProperties}>
            <div className="browser-top">
              <div><i /><i /><i /></div>
              <span>{current.url}</span>
              <b>↗</b>
            </div>
            <div className="project-visual" key={current.id}>
              {/* oxlint-disable-next-line next/no-img-element */}
              <img src={current.image} width="1536" height="1024" alt={current.alt} />
              <div className="concept-nav"><strong>{current.name}</strong><span>Descubrir</span></div>
              <div className="concept-copy"><small>{current.category}</small><strong>{current.headline}</strong></div>
              <span className="concept-label">Ejemplo conceptual</span>
            </div>
          </div>
          <div className="phone-frame" key={`${current.id}-mobile`}>
            <div className="phone-notch" />
            {/* oxlint-disable-next-line next/no-img-element */}
            <img src={current.image} width="1536" height="1024" alt="" />
            <strong>{current.name}</strong>
            <span>Ver más</span>
          </div>
          <div className="stage-counter"><span>0{active + 1}</span><i /><span>03</span></div>
        </div>

        <div className="mobile-projects">
          <div className="mobile-swipe-cue" aria-hidden="true">
            <MoveHorizontal />
            <span>Desliza para explorar</span>
            <ArrowRight />
          </div>

          <Carousel
            aria-label="Tipos de negocio"
            className="mobile-project-carousel"
            opts={{ align: 'start', containScroll: 'trimSnaps' }}
            setApi={setMobileApi}
          >
            <CarouselContent className="mobile-project-track">
              {projects.map((project) => (
                <CarouselItem className="mobile-project-slide" key={`${project.id}-card`}>
                  <article className="mobile-project-card">
                    <div className="project-meta"><span>{project.number}</span><span>Ejemplo de sector</span></div>
                    <div className="mobile-browser">
                      <div className="mobile-browser-top"><span><i /><i /><i /></span><small>{project.url}</small></div>
                      <div className="mobile-project-image">
                        {/* oxlint-disable-next-line next/no-img-element */}
                        <img src={project.image} width="1536" height="1024" alt={project.alt} loading="lazy" decoding="async" />
                        <strong>{project.name}</strong>
                      </div>
                    </div>
                    <p className="project-category">{project.category}</p>
                    <h3>{project.headline}</h3>
                    <p>{project.description}</p>
                  </article>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          <div className="mobile-carousel-progress" aria-label={`Ejemplo ${mobileActive + 1} de ${projects.length}`}>
            <span>0{mobileActive + 1}</span>
            <div className="mobile-carousel-dots">
              {projects.map((project, index) => (
                <button
                  aria-label={`Ver ${project.name}`}
                  aria-current={mobileActive === index ? 'true' : undefined}
                  key={`${project.id}-dot`}
                  onClick={() => mobileApi?.scrollTo(index)}
                  type="button"
                />
              ))}
            </div>
            <span>0{projects.length}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

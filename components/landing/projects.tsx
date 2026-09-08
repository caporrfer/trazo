'use client';

import { useEffect, useRef, useState } from 'react';
import { projects } from './content';

export function Projects() {
  const [active, setActive] = useState(0);
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

  const current = projects[active];

  return (
    <section id="proyectos" className="projects-section" aria-labelledby="projects-title">
      <div className="section-intro section-intro--projects">
        <p className="eyebrow eyebrow--light"><span /> Ideas que podrían ser la tuya</p>
        <h2 id="projects-title">No hacemos webs<br /><em>para rellenar.</em></h2>
        <p className="section-lead">Las hacemos para contar por qué tu negocio merece una visita, una llamada o un próximo paso.</p>
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
                <span>Proyecto conceptual</span>
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
              <span className="concept-label">Proyecto conceptual</span>
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
          {projects.map((project) => (
            <article className="mobile-project-card" key={`${project.id}-card`}>
              <div className="project-meta"><span>{project.number}</span><span>Proyecto conceptual</span></div>
              <div className="mobile-project-image">
                {/* oxlint-disable-next-line next/no-img-element */}
                <img src={project.image} width="1536" height="1024" alt={project.alt} loading="lazy" decoding="async" />
                <strong>{project.name}</strong>
              </div>
              <p className="project-category">{project.category}</p>
              <h3>{project.headline}</h3>
              <p>{project.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';

import { useEffect } from 'react';

export function RevealMotion() {
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!('IntersectionObserver' in window)) return;
    let observer: IntersectionObserver | undefined;
    const setup = () => {
      observer?.disconnect();
      if (preference.matches) return;
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed');
              observer?.unobserve(entry.target);
            }
          }
        },
        { threshold: 0.08 },
      );
      // Content starts visible; enhancement never leaves it hidden if JS fails.
      document
        .querySelectorAll('[data-reveal]:not(.is-revealed)')
        .forEach((element) => {
          if (element.getBoundingClientRect().top >= window.innerHeight)
            observer?.observe(element);
        });
    };
    setup();
    preference.addEventListener('change', setup);
    return () => {
      observer?.disconnect();
      preference.removeEventListener('change', setup);
    };
  }, []);
  return null;
}

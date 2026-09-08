'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Logo } from './logo';

const links = [
  { href: '#proyectos', label: 'Ejemplos' },
  { href: '#servicio', label: 'El servicio' },
  { href: '#preguntas', label: 'Preguntas' },
];

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  return (
    <header className="site-header" data-menu-open={open}>
      <Logo />
      <nav className="desktop-nav" aria-label="Navegación principal">
        {links.map((link) => (
          <a key={link.href} href={link.href}>{link.label}</a>
        ))}
      </nav>
      <Link className="pill-link header-cta" href="/proyecto">
        Cuéntanos tu idea <span aria-hidden="true">↗</span>
      </Link>
      <button
        type="button"
        className="menu-button"
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X /> : <Menu />}
      </button>
      <div id="mobile-menu" className="mobile-menu" data-open={open} hidden={!open}>
        <nav aria-label="Navegación móvil">
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>
          ))}
          <Link href="/proyecto" onClick={() => setOpen(false)}>Cuéntanos tu idea ↗</Link>
        </nav>
      </div>
    </header>
  );
}

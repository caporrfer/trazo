'use client';

import { useState } from 'react';
import { Menu, X, ArrowUpRight, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { DraftCta, Wordmark } from '@/components/brand';
import { navigation } from '@/lib/content';

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Wordmark />
        <nav className="desktop-nav" aria-label="Navegación principal">
          {navigation.map((item) => (
            <a href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="header-cta">
          <DraftCta compact />
        </div>
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                className="menu-trigger"
                aria-label="Abrir menú"
              />
            }
          >
            <Menu aria-hidden="true" />
          </SheetTrigger>
          <SheetContent
            side="right"
            className="mobile-menu"
            showCloseButton={false}
          >
            <div className="mobile-menu-head">
              <SheetTitle className="mobile-menu-title">trazo.</SheetTitle>
              <SheetClose
                render={
                  <Button
                    variant="ghost"
                    className="menu-close"
                    aria-label="Cerrar menú"
                  />
                }
              >
                <X aria-hidden="true" />
              </SheetClose>
            </div>
            <SheetDescription className="mobile-menu-description">
              Diseño y desarrollo web con personalidad.
            </SheetDescription>
            <nav aria-label="Navegación móvil">
              {navigation.map((item, index) => (
                <a
                  href={item.href}
                  key={item.href}
                  onClick={() => setMenuOpen(false)}
                >
                  <span>0{index + 1}</span>
                  {item.label}
                  <ArrowUpRight aria-hidden="true" />
                </a>
              ))}
            </nav>
            <div className="mobile-menu-offer">
              <p>Tu primer borrador es gratis y sin compromiso.</p>
              <DraftCta />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <Wordmark />
          <p>
            Buenas ideas.
            <br />
            Webs que dejan huella.
          </p>
          <a href="#contenido" className="back-top">
            Volver arriba <ArrowUp aria-hidden="true" />
          </a>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} TRAZO</span>
          <nav aria-label="Navegación del pie">
            {navigation.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <span>Diseñado con intención.</span>
        </div>
      </div>
    </footer>
  );
}

export function MobileCta() {
  return (
    <aside className="mobile-cta" aria-label="Solicitar una propuesta gratuita">
      <DraftCta compact />
    </aside>
  );
}

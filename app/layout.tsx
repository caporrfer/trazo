import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Trazo", template: "%s · Trazo" },
  description:
    "Valora tu propuesta web personalizada y dinos cómo te gustaría continuar.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#174c3b",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#contenido">
          Saltar al contenido
        </a>
        {children}
        <footer className="site-footer">
          <div className="footer-inner">
            <Link
              className="brand brand-small"
              href="/"
              aria-label="Trazo, inicio"
            >
              <span className="brand-mark" aria-hidden="true">
                t
              </span>
              Trazo
            </Link>
            <nav aria-label="Información legal">
              <Link href="/privacidad">Privacidad</Link>
              <Link href="/aviso-legal">Aviso legal</Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Bricolage_Grotesque, Manrope } from 'next/font/google';
import './globals.css';

const display = Bricolage_Grotesque({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'optional',
  preload: false,
});

const body = Manrope({
  variable: '--font-body',
  subsets: ['latin'],
  display: 'optional',
  preload: false,
});

export const metadata: Metadata = {
  title: 'Trazo — Webs para negocios que quieren hacerse notar',
  description:
    'Diseñamos, lanzamos y cuidamos la web de tu negocio para que tú puedas centrarte en hacerlo crecer.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${display.variable} ${body.variable}`}>{children}</body>
    </html>
  );
}

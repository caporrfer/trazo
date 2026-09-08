import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TRAZO · Hacemos que tu negocio marque la diferencia',
  description:
    'Diseño y desarrollo web con personalidad para tu empresa. Descubre nuestros proyectos y cómo trabajamos. Tu primer borrador es gratis y sin compromiso.',
  icons: { icon: '/favicon.svg' },
};
export const viewport: Viewport = {
  themeColor: '#BFE7F5',
  width: 'device-width',
  initialScale: 1,
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

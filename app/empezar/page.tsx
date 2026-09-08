import type { Metadata } from 'next';
import { StartContent } from './start-content';

export const metadata: Metadata = {
  title: 'Empezar un proyecto — Trazo',
  description: 'Cuéntanos qué necesita tu negocio.',
  robots: { index: false, follow: false },
};

export default function StartPage() {
  return <StartContent />;
}

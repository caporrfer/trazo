import { Header } from '@/components/landing/header';
import { Hero } from '@/components/landing/hero';
import { Projects } from '@/components/landing/projects';
import { Service } from '@/components/landing/service';
import { Process } from '@/components/landing/process';
import { Faq } from '@/components/landing/faq';
import { FinalCta } from '@/components/landing/final-cta';

export default function Home() {
  return (
    <main id="top">
      <Header />
      <Hero />
      <Projects />
      <Service />
      <Process />
      <Faq />
      <FinalCta />
    </main>
  );
}

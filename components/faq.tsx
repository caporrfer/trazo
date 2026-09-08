'use client';

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { faqs } from '@/lib/content';

export function Faq() {
  return (
    <div className="faq-list" data-reveal>
      <Accordion defaultValue={['borrador']} className="faq-accordion">
        {faqs.map((faq, index) => (
          <AccordionItem value={faq.id} key={faq.id} className="faq-item">
            <AccordionTrigger className="faq-trigger">
              <span className="faq-number">0{index + 1}</span>
              <span>{faq.question}</span>
            </AccordionTrigger>
            <AccordionContent keepMounted className="faq-answer">
              <p>{faq.answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <noscript>
        <style>{'.faq-accordion { display: none; }'}</style>
        {faqs.map((faq) => (
          <details className="faq-fallback" key={faq.id}>
            <summary>{faq.question}</summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </noscript>
    </div>
  );
}

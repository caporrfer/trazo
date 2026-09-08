'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const questions = [
  {
    question: '¿Qué necesito enviaros para empezar?',
    answer:
      'La información de tu negocio, los servicios o la carta, horarios, datos de contacto, logotipo y las mejores fotos que tengas. Nosotros lo ordenamos, adaptamos los textos y te avisamos si falta algo importante.',
  },
  {
    question: '¿Las tres opciones incluyen la misma web?',
    answer:
      'Sí. El diseño y el alcance inicial son los mismos. Lo que cambia es quién aloja la web, la forma de pago y si quieres que Trazo se ocupe también de mantener el contenido actualizado.',
  },
  {
    question: '¿Qué puedo actualizar con el plan de 39 €?',
    answer:
      'Textos, fotografías, carta, precios, horarios y pequeños ajustes sobre la web existente. Si quieres añadir nuevas secciones, funciones o rediseñar la web, te prepararemos una propuesta aparte.',
  },
  {
    question: '¿Los planes mensuales tienen permanencia?',
    answer:
      'No. Puedes cancelar cuando quieras. Al finalizar el plan, el alojamiento y las actualizaciones de Trazo dejan de estar incluidos.',
  },
  {
    question: '¿Qué incluye la opción de 950 €?',
    answer:
      'El diseño, el desarrollo, la entrega del código y la puesta en marcha en tu propio alojamiento. El dominio y el alojamiento corren por tu cuenta.',
  },
];

export function FAQ() {
  return (
    <Accordion className="faq-list">
      {questions.map((item, index) => (
        <AccordionItem
          key={item.question}
          value={`faq-${index}`}
          className="faq-item"
        >
          <AccordionTrigger className="faq-trigger">
            <span className="faq-number">0{index + 1}</span>
            <span>{item.question}</span>
          </AccordionTrigger>
          <AccordionContent className="faq-content">
            <p>{item.answer}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

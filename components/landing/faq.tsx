import { faqs } from './content';

export function Faq() {
  return (
    <section id="preguntas" className="faq-section" aria-labelledby="faq-title">
      <div className="faq-heading">
        <p className="eyebrow"><span /> Sin letra pequeña</p>
        <h2 id="faq-title">Antes de empezar,<br /><em>quizá te preguntes...</em></h2>
      </div>
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <details key={faq.question} className="faq-item">
            <summary className="faq-trigger">
              <span className="faq-number">0{index + 1}</span>
              <span>{faq.question}</span>
              <span className="faq-icon" aria-hidden="true" />
            </summary>
            <div className="faq-content"><p>{faq.answer}</p></div>
          </details>
        ))}
      </div>
    </section>
  );
}

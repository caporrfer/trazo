const steps = [
  { number: '01', title: 'Nos cuentas', text: 'Escuchamos tu idea, tu negocio y lo que quieres conseguir.' },
  { number: '02', title: 'Damos forma', text: 'Definimos el mensaje, el estilo y la experiencia de la web.' },
  { number: '03', title: 'La lanzamos', text: 'Construimos, revisamos y preparamos todo para publicarla.' },
  { number: '04', title: 'La cuidamos', text: 'Seguimos contigo para hacer los ajustes que vayan surgiendo.' },
];

export function Process() {
  return (
    <section className="process-section" aria-labelledby="process-title">
      <div className="process-header">
        <p className="eyebrow eyebrow--light"><span /> Así trabajamos</p>
        <h2 id="process-title">Cuatro pasos.<br /><em>Cero líos.</em></h2>
      </div>
      <ol className="process-list">
        {steps.map((step) => (
          <li key={step.number}>
            <span>{step.number}</span>
            <div><h3>{step.title}</h3><p>{step.text}</p></div>
          </li>
        ))}
      </ol>
    </section>
  );
}

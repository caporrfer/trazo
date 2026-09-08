export const navigation = [
  { label: 'El estudio', href: '/#quienes-somos' },
  { label: 'Cómo trabajamos', href: '/#como-trabajamos' },
  { label: 'Proyectos', href: '/#proyectos' },
  { label: 'Preguntas', href: '/#preguntas' },
] as const;

export const processSteps = [
  {
    number: '01',
    title: 'Te escuchamos.',
    description:
      'Cuando el cuestionario esté disponible, podrás contarnos qué hace especial a tu negocio, qué necesitas y qué te gustaría conseguir.',
    free: false,
  },
  {
    number: '02',
    title: 'Le damos forma.',
    description:
      'Preparamos una primera propuesta visual para que puedas imaginar tu nueva web. El primer borrador es gratis y no te compromete a nada.',
    free: true,
  },
  {
    number: '03',
    title: 'Tú decides.',
    description:
      'Si la propuesta encaja contigo, concretamos el alcance y el presupuesto del desarrollo. Y seguimos construyendo desde ahí, juntos.',
    free: false,
  },
] as const;

export const needs = [
  {
    title: 'Que entiendan lo que haces.',
    description:
      'Presentamos tus servicios con una estructura clara y mensajes que hablan el idioma de tus clientes.',
  },
  {
    title: 'Que vean lo que ofreces.',
    description:
      'Damos espacio a tus productos, tu carta o tus proyectos para que se conozcan con todo el detalle que necesitan.',
  },
  {
    title: 'Que llegar a ti sea fácil.',
    description:
      'Ponemos la información y las formas de contacto donde tienen sentido. Menos vueltas para tus clientes.',
  },
  {
    title: 'Que funcione en su día a día.',
    description:
      'Adaptamos la experiencia a móvil, tableta y ordenador, con una navegación sencilla y contenido accesible.',
  },
] as const;

export const projects = [
  {
    id: 'russes',
    name: 'Russes Gastrobar',
    category: 'Gastronomía · Aracena',
    description: 'El carácter de la Sierra, también en la web.',
    url: 'https://caporrfer.github.io/russes_gastrobar/',
    image: '/images/russes-gastrobar.jpg',
    imageAlt:
      'Interior de Russes Gastrobar, con su barra y decoración característica.',
    width: 1189,
    height: 571,
  },
  {
    id: 'miramar',
    name: 'Restaurante Miramar',
    category: 'Restauración · Punta Umbría',
    description: 'Una ventana a su cocina y al mar.',
    url: 'https://caporrfer.github.io/restaurantemiramar/',
    image: '/images/restaurante-miramar.jpg',
    imageAlt: 'Vista de la playa junto al Restaurante Miramar en Punta Umbría.',
    width: 828,
    height: 442,
  },
] as const;

export const faqs = [
  {
    id: 'borrador',
    question: '¿Qué incluye el primer borrador?',
    answer:
      'Una primera propuesta visual para imaginar cómo podría ser la web de tu negocio. Es un punto de partida de diseño, no una web definitiva ni una versión navegable completa. El alcance del desarrollo se concreta después, si decides continuar.',
  },
  {
    id: 'gratis',
    question: '¿De verdad es gratis y sin compromiso?',
    answer:
      'Sí. La primera propuesta visual es gratuita y no te obliga a contratar. La ves, valoras si encaja contigo y decides si quieres que sigamos trabajando juntos.',
  },
  {
    id: 'empresas',
    question: '¿Trabajáis con empresas de cualquier sector?',
    answer:
      'Sí. Nos dirigimos a todo tipo de empresas. Empezamos por entender tu actividad y tus necesidades para plantear una web con el contenido, la estructura y las funcionalidades que tengan sentido para ti.',
  },
  {
    id: 'movil',
    question: '¿Mi web se adaptará a móviles?',
    answer:
      'Sí. Planteamos el diseño para móvil, tableta y ordenador, cuidando la lectura, la navegación y las acciones principales en cada pantalla.',
  },
  {
    id: 'precio',
    question: '¿Cuánto cuesta desarrollar la web definitiva?',
    answer:
      'Depende de lo que necesite tu proyecto: contenido, estructura y funcionalidades. Si decides continuar después del borrador gratuito, concretamos contigo el alcance y el presupuesto antes de empezar el desarrollo.',
  },
  {
    id: 'cuestionario',
    question: '¿Cómo puedo solicitar mi borrador gratis?',
    answer:
      'Estamos preparando el cuestionario y todavía no admite solicitudes. Cuando esté disponible, podrás contarnos cómo es tu negocio y qué necesitas para que preparemos tu primera propuesta visual gratis y sin compromiso.',
  },
] as const;

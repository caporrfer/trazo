export const PROJECT_CTA_PATH = '/proyecto';

export type Project = {
  id: string;
  number: string;
  name: string;
  category: string;
  headline: string;
  description: string;
  image: string;
  alt: string;
  url: string;
  accent: string;
};

export const projects: Project[] = [
  {
    id: 'restauracion',
    number: '01',
    name: 'Restauración',
    category: 'Restaurantes · Cafeterías · Bares',
    headline: 'Una web que abre el apetito.',
    description: 'Carta, reservas y ambiente bien presentados para convertir una visita online en una mesa ocupada.',
    image: '/images/restauracion-generica.jpg',
    alt: 'Mesa de restaurante con dos platos mediterráneos servidos',
    url: 'ejemplo-web.com/restauracion',
    accent: '#f2b84b',
  },
  {
    id: 'tiendas-online',
    number: '02',
    name: 'Tiendas online',
    category: 'Moda · Producto · Artesanía',
    headline: 'Productos que entran por los ojos.',
    description: 'Una tienda clara, visual y fácil de recorrer para que descubrir, elegir y comprar resulte natural.',
    image: '/images/tienda-online-generica.jpg',
    alt: 'Composición de productos sin marca sobre un fondo azul intenso',
    url: 'ejemplo-web.com/tienda',
    accent: '#ffcc42',
  },
  {
    id: 'servicios',
    number: '03',
    name: 'Servicios',
    category: 'Consultoría · Bienestar · Creatividad',
    headline: 'Confianza desde el primer vistazo.',
    description: 'Una web que explica lo que haces, ordena tu propuesta y facilita que la persona adecuada te contacte.',
    image: '/images/servicios-genericos.jpg',
    alt: 'Profesionales colaborando alrededor de una mesa de trabajo azul',
    url: 'ejemplo-web.com/servicios',
    accent: '#a9ddf3',
  },
];

export const faqs = [
  {
    question: '¿Cuánto cuesta crear una web con Trazo?',
    answer: 'Cada negocio necesita algo distinto. Primero entendemos qué quieres conseguir y te proponemos una solución ajustada, clara y sin extras que no aporten valor.',
  },
  {
    question: '¿Tengo que tener preparados los textos y las fotos?',
    answer: 'No. Podemos partir de lo que ya tengas y ayudarte a ordenar el mensaje, seleccionar el contenido y definir qué imágenes necesita la web.',
  },
  {
    question: '¿La web funcionará bien en móvil?',
    answer: 'Sí. Diseñamos cada página para que sea rápida, legible y cómoda de usar tanto en móvil como en ordenador.',
  },
  {
    question: '¿Os ocupáis de publicar la web?',
    answer: 'Sí. Preparamos el lanzamiento y te acompañamos para que la web quede disponible en tu dominio y lista para recibir visitas.',
  },
  {
    question: '¿Qué ocurre si luego necesito cambios?',
    answer: 'Seguimos cuidando la web después del lanzamiento. Podemos ajustar diseño, textos, imágenes y secciones; acordamos el alcance y los plazos de cada solicitud contigo.',
  },
];

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
    id: 'cafe-nube',
    number: '01',
    name: 'Café Nube',
    category: 'Cafetería de especialidad',
    headline: 'Una pausa que empieza antes de llegar.',
    description: 'Una web cálida y directa para descubrir la carta, el espacio y las ganas de volver.',
    image: '/images/cafe-nube.avif',
    alt: 'Barista sirviendo un café junto a bollería artesanal',
    url: 'cafénube.es',
    accent: '#f1be66',
  },
  {
    id: 'estudio-calma',
    number: '02',
    name: 'Estudio Calma',
    category: 'Centro de estética',
    headline: 'Cuidado que se siente desde la pantalla.',
    description: 'Una experiencia serena para entender los tratamientos y encontrar el momento de cuidarse.',
    image: '/images/estudio-calma.avif',
    alt: 'Interior luminoso de un centro de estética contemporáneo',
    url: 'estudiocalma.es',
    accent: '#b7dfe8',
  },
  {
    id: 'reformas-linde',
    number: '03',
    name: 'Linde',
    category: 'Reformas e interiorismo',
    headline: 'El oficio de transformar espacios.',
    description: 'Una web honesta y visual que enseña el proceso, el detalle y la calidad detrás de cada obra.',
    image: '/images/reformas-linde.avif',
    alt: 'Profesional midiendo una estructura de madera durante una reforma',
    url: 'lindereformas.es',
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

export const plans = [
  {
    number: '01',
    slug: 'alojamiento',
    name: 'Web + alojamiento',
    price: '300 €',
    suffix: '+ 29 €/mes',
    description:
      'Tu web siempre online y nosotros nos ocupamos de que siga funcionando.',
    features: [
      'Landing diseñada a medida',
      'Adaptada a móvil',
      'Puesta en marcha',
      'Alojamiento incluido',
    ],
    featured: false,
  },
  {
    number: '02',
    slug: 'actualizaciones',
    name: 'Web + actualizaciones',
    price: '300 €',
    suffix: '+ 39 €/mes',
    description:
      'Para negocios que quieren olvidarse también de mantener la información al día.',
    features: [
      'Todo lo del plan anterior',
      'Cambios de textos y fotos',
      'Carta, precios y horarios',
      'Pequeños ajustes continuos',
    ],
    featured: true,
  },
  {
    number: '03',
    slug: 'desarrollo',
    name: 'Solo desarrollo',
    price: '950 €',
    suffix: '',
    description:
      'La web es tuya. Te entregamos el código y la dejamos funcionando en tu alojamiento.',
    features: [
      'Landing diseñada a medida',
      'Adaptada a móvil',
      'Entrega del código',
      'Puesta en marcha incluida',
    ],
    featured: false,
  },
] as const;

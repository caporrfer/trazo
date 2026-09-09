import type { FormAnswers, Intent } from "./types";

export const optionLabels = {
  viewed: {
    reviewed: "Sí, lo he revisado",
    skimmed: "Lo he visto por encima",
    not_yet: "Todavía no",
  },
  impression: {
    like: "Me gusta tal como está planteada",
    changes: "Me gusta, pero cambiaría algunas cosas",
    more_info: "Necesito más información para valorarla",
    no_fit: "No encaja con lo que buscamos",
    no_need: "Ahora mismo no necesitamos una web",
  },
  fitClarification: {
    new_approach: "Me gustaría valorar otro enfoque",
    finish: "Prefiero dejarlo aquí",
  },
  intent: {
    information: "Quiero más información",
    changes: "Quiero solicitar cambios",
    talk: "Quiero hablar con Trazo",
    share: "Quiero trasladarlo a la persona responsable",
    opinion: "Solo quiero enviar mi opinión",
    demo_help: "Necesito ayuda para ver la propuesta",
    decline: "No quiero continuar ahora",
  },
  goal: {
    reservations: "Conseguir más reservas",
    menu: "Mostrar la carta",
    orders: "Recibir pedidos",
    messages: "Facilitar llamadas y mensajes",
    image: "Mejorar la imagen del negocio",
    google: "Aparecer mejor en Google",
    advice: "No lo tengo claro; necesito asesoramiento",
  },
  plan: {
    hosting: "Web + alojamiento — 300 € + 29 €/mes",
    updates: "Web + actualizaciones — 300 € + 39 €/mes",
    development: "Solo desarrollo — 950 €",
    advice: "No sé cuál elegir; quiero que me asesoren",
    not_yet: "Todavía no quiero elegir una opción",
  },
  domainStatus: {
    existing: "Sí, ya tenemos uno",
    wanted: "No, pero sabemos cuál queremos",
    help: "No tenemos dominio y necesitamos ayuda",
    undecided: "Todavía no lo hemos decidido",
  },
  relationship: {
    owner: "Propietario/a",
    manager: "Gerente",
    marketing: "Responsable de marketing o comunicación",
    staff: "Trabajo en el negocio",
    other: "Otro",
  },
  decisionRole: {
    decision: "Sí, tomo la decisión",
    shared: "La decidimos entre varias personas",
    relay: "No, pero puedo trasladar la propuesta",
    unsure: "No estoy seguro/a",
  },
  contactMethod: {
    whatsapp: "WhatsApp",
    phone: "Llamada",
    email: "Correo electrónico",
    relay: "Prefiero trasladar primero la propuesta al responsable",
  },
  contactTime: {
    morning: "Por la mañana",
    afternoon: "Por la tarde",
    anytime: "A cualquier hora",
    specific: "Quiero indicar un día y una hora",
    write_first: "Prefiero que me escriban primero",
  },
  declineReason: {
    has_site: "Ya tenemos una web",
    not_priority: "No es una prioridad actualmente",
    style: "La propuesta no encaja con nuestro estilo",
    not_useful: "No creemos que una web nos resulte útil",
    price: "El precio no encaja con nosotros",
    other: "Otro motivo",
    prefer_not: "Prefiero no responder",
  },
} as const;

export const changeOptions = [
  ["design", "Diseño o colores"],
  ["photos", "Fotografías"],
  ["texts", "Textos"],
  ["structure", "Organización de la página"],
  ["menu", "Carta o menú"],
  ["reservations", "Reservas"],
  ["orders", "Pedidos online"],
  ["whatsapp", "WhatsApp"],
  ["languages", "Idiomas"],
  ["other", "Otro"],
] as const;

export const plans = [
  {
    id: "hosting",
    name: "Web + alojamiento",
    price: "300 € + 29 €/mes",
    description:
      "Nosotros alojamos la web y nos ocupamos de que permanezca online y funcionando.",
    items: [
      "Diseño personalizado",
      "Adaptación a móvil",
      "Puesta en marcha",
      "Dominio .es incluido",
      "Alojamiento incluido",
      "Soporte técnico",
      "Sin permanencia",
    ],
  },
  {
    id: "updates",
    name: "Web + actualizaciones",
    price: "300 € + 39 €/mes",
    recommended: true,
    description:
      "Además de mantener la web online, nos ocupamos de que la información esté siempre actualizada.",
    items: [
      "Todo lo incluido en Web + alojamiento",
      "Cambios de textos y fotografías",
      "Actualización de carta y precios",
      "Actualización de horarios",
      "Actualización continua del contenido",
      "Sin permanencia",
    ],
  },
  {
    id: "development",
    name: "Solo desarrollo",
    price: "950 € en un único pago",
    description:
      "Te entregamos la web completa y la dejamos funcionando en el alojamiento que elijas.",
    items: [
      "Diseño personalizado",
      "Adaptación a móvil",
      "Entrega completa del código",
      "Configuración inicial",
      "Puesta en marcha",
      "Sin mantenimiento posterior incluido",
    ],
  },
] as const;

export function finalButtonLabel(answers: FormAnswers) {
  if (answers.intent === "changes") return "Solicitar cambios";
  if (answers.intent === "demo_help") return "Solicitar ayuda";
  if (answers.intent === "information") return "Solicitar información";
  if (answers.intent === "talk" && answers.contactMethod === "phone")
    return "Pedir una llamada";
  if (answers.intent === "talk") return "Solicitar contacto";
  return "Enviar mi opinión";
}

export function confirmationCopy(intent?: Intent, contact?: string) {
  if (intent === "demo_help")
    return `Te ayudaremos a abrir la propuesta${contact ? ` por ${contact}` : ""}.`;
  if (["information", "changes", "talk"].includes(intent || ""))
    return `Revisaremos lo que nos has contado y te contactaremos${contact ? ` por ${contact}` : ""}.`;
  if (intent === "share")
    return "Puedes compartir los enlaces con la persona responsable cuando te venga bien.";
  return "Hemos guardado tu opinión. Gracias por dedicarnos este momento.";
}

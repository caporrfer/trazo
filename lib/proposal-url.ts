export function proposalPath(slug: string) {
  return `/propuesta/${encodeURIComponent(slug)}`;
}

export function proposalConfirmationPath(slug: string) {
  return `${proposalPath(slug)}/gracias`;
}

export function proposalSubmissionPath(slug: string) {
  return `/api/propuestas/${encodeURIComponent(slug)}/respuestas`;
}

export function proposalUrl(origin: string, slug: string) {
  return `${origin.replace(/\/$/, "")}${proposalPath(slug)}`;
}

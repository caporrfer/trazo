/** Fecha de hoy (zona horaria del servidor) en formato AAAA-MM-DD. */
export function todayString(now = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

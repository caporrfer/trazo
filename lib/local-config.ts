export function hasLocalConfig() { return Boolean(process.env.DATABASE_URL); }
export function isDemoMode() { return process.env.TRAZO_DEMO_MODE === "true" && process.env.NODE_ENV !== "production"; }

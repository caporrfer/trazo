export function isDemoMode() { return process.env.TRAZO_DEMO_MODE === "true" && process.env.NODE_ENV !== "production"; }

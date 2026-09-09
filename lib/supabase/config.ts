export function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function isDemoMode() {
  return (
    process.env.TRAZO_DEMO_MODE === "true" &&
    process.env.NODE_ENV !== "production"
  );
}

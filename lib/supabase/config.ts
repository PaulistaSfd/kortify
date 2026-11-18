// Se as chaves do Supabase não estiverem configuradas, o app roda em modo exemplo.
export const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const SUPA_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
export const supaLigado = Boolean(SUPA_URL && SUPA_ANON);

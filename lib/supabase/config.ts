// Lê as chaves na hora (não no build), então basta configurar as variáveis no Worker.
// Sem elas, o painel roda em modo exemplo.
const ler = (n: string) => (typeof process !== "undefined" && process.env ? process.env[n] : undefined) || "";

export function supaEnv(): { url: string; anon: string } {
  if (typeof window !== "undefined") {
    const w = (window as unknown as { __KENV?: { url?: string; anon?: string } }).__KENV || {};
    return { url: w.url || "", anon: w.anon || "" };
  }
  return {
    url: ler("NEXT_PUBLIC_SUPABASE_URL") || ler("SUPABASE_URL"),
    anon: ler("NEXT_PUBLIC_SUPABASE_ANON_KEY") || ler("SUPABASE_ANON_KEY") || ler("SUPABASE_PUBLISHABLE_KEY"),
  };
}
export const supaLigado = () => { const e = supaEnv(); return Boolean(e.url && e.anon); };
export const lerEnv = ler;

import { supaEnv } from "@/lib/supabase/config";

// Passa a URL e a chave pública do Supabase para o navegador, lidas na hora do pedido.
// (Só a chave pública: a secreta nunca sai do servidor.)
export function EnvScript() {
  const e = supaEnv();
  const json = JSON.stringify({ url: e.url, anon: e.anon }).replace(/</g, "\\u003c");
  return <script dangerouslySetInnerHTML={{ __html: `window.__KENV=${json};` }} />;
}

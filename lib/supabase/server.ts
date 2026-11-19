import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { supaEnv, lerEnv } from "./config";

// Cliente com a sessão da pessoa (respeita as regras de segurança do banco)
export async function supaServidor() {
  const jar = await cookies();
  const e = supaEnv();
  return createServerClient(e.url, e.anon, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (lista) => { try { lista.forEach(({ name, value, options }) => jar.set(name, value, options)); } catch {} },
    },
  });
}

// Cliente administrador, só no servidor (worker, pagamentos)
export function supaAdmin() {
  const chave = lerEnv("SUPABASE_SERVICE_ROLE_KEY") || lerEnv("SUPABASE_SECRET_KEY");
  if (!chave) throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY");
  return createClient(supaEnv().url, chave, { auth: { persistSession: false } });
}

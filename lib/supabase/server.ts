import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { SUPA_URL, SUPA_ANON } from "./config";

// Cliente com a sessão da pessoa (respeita as regras de segurança do banco)
export async function supaServidor() {
  const jar = await cookies();
  return createServerClient(SUPA_URL, SUPA_ANON, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (lista) => { try { lista.forEach(({ name, value, options }) => jar.set(name, value, options)); } catch {} },
    },
  });
}

// Cliente administrador, só no servidor (worker, pagamentos)
export function supaAdmin() {
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!chave) throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY");
  return createClient(SUPA_URL, chave, { auth: { persistSession: false } });
}

// Quem pode abrir o /admin: e-mails listados em ADMIN_EMAILS (separados por vírgula).
import { lerEnv, supaLigado } from "@/lib/supabase/config";
import { supaServidor } from "@/lib/supabase/server";

export const emailsAdmin = () => lerEnv("ADMIN_EMAILS").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

// "exemplo": site sem banco, mostra dados de mentira. "ok": admin logado. "nao": qualquer outro caso.
export async function acessoAdmin(): Promise<{ estado: "exemplo" | "ok" | "nao"; email?: string; nome?: string }> {
  if (!supaLigado()) return { estado: "exemplo" };
  const supa = await supaServidor();
  const { data: { user } } = await supa.auth.getUser();
  const email = user?.email?.toLowerCase();
  if (!email) return { estado: "nao" };
  if (!emailsAdmin().includes(email)) return { estado: "nao", email };
  return { estado: "ok", email, nome: (user?.user_metadata as any)?.full_name || email.split("@")[0] };
}

import { NextResponse } from "next/server";
import { supaAdmin } from "@/lib/supabase/server";
import { supaLigado, lerEnv } from "@/lib/supabase/config";

// Conta visitas no site para o funil do admin. Sem cookie de rastreio: só um id aleatório da aba.
export async function POST(req: Request) {
  if (!supaLigado() || !(lerEnv("SUPABASE_SERVICE_ROLE_KEY") || lerEnv("SUPABASE_SECRET_KEY"))) return new NextResponse(null, { status: 204 });
  const b = await req.json().catch(() => ({}));
  if (b?.tipo !== "visita" && b?.tipo !== "checkout") return new NextResponse(null, { status: 204 });
  const ua = req.headers.get("user-agent") || "";
  if (/bot|crawl|spider|preview|headless/i.test(ua)) return new NextResponse(null, { status: 204 });
  const limpa = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : null);
  await supaAdmin().from("eventos").insert({ tipo: b.tipo, sessao: limpa(b.sessao, 40), origem: limpa(b.origem, 60), pagina: limpa(b.pagina, 120) });
  return new NextResponse(null, { status: 204 });
}

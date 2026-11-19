import { NextResponse } from "next/server";
import { supaAdmin } from "@/lib/supabase/server";
import { linkDownload } from "@/lib/r2";
import { workerOk } from "@/lib/worker-auth";

// O motor pergunta: tem live na fila? Recebe a live e o link para baixar.
export async function POST(req: Request) {
  if (!workerOk(req)) return NextResponse.json({ erro: "não autorizado" }, { status: 401 });
  const db = supaAdmin();
  // batida do motor para o admin saber se ele está ligado (nome vem do cabeçalho X-Motor)
  const motor = (req.headers.get("x-motor") || "motor").slice(0, 40);
  await db.from("motores").upsert({ nome: motor, visto_em: new Date().toISOString(), versao: req.headers.get("x-motor-versao")?.slice(0, 20) || null, trabalhando: null });
  const { data, error } = await db.rpc("pegar_proxima_live");
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  const v = Array.isArray(data) ? data[0] : data;
  if (!v) return NextResponse.json({ live: null });
  await db.from("motores").update({ trabalhando: v.id }).eq("nome", motor);
  // arquivo enviado: link do R2; link de VOD: o motor baixa direto de url_origem
  const download = v.origem === "arquivo" && v.arquivo_key ? await linkDownload(v.arquivo_key) : null;
  return NextResponse.json({ live: { ...v, download } });
}

import { NextResponse } from "next/server";
import { supaAdmin } from "@/lib/supabase/server";
import { linkDownload } from "@/lib/r2";
import { workerOk } from "@/lib/worker-auth";

// O motor pergunta: tem live na fila? Recebe a live e o link para baixar.
export async function POST(req: Request) {
  if (!workerOk(req)) return NextResponse.json({ erro: "não autorizado" }, { status: 401 });
  const { data, error } = await supaAdmin().rpc("pegar_proxima_live");
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  const v = Array.isArray(data) ? data[0] : data;
  if (!v) return NextResponse.json({ live: null });
  return NextResponse.json({ live: { ...v, download: await linkDownload(v.arquivo_key) } });
}

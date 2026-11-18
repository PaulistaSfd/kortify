import { NextResponse } from "next/server";
import { supaServidor } from "@/lib/supabase/server";
import { linkDownload } from "@/lib/r2";

// Devolve o link do MP4 do corte (só do dono) e marca como baixado.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supa = await supaServidor();
  const { data: c } = await supa.from("cortes").select("id,titulo,arquivo_key").eq("id", id).single();
  if (!c?.arquivo_key) return NextResponse.json({ erro: "Esse corte ainda não tem arquivo." }, { status: 404 });
  await supa.from("cortes").update({ status: "baixado" }).eq("id", id);
  const nome = `${c.titulo}`.replace(/[^\p{L}\p{N} -]/gu, "").trim() || "corte";
  return NextResponse.json({ url: await linkDownload(c.arquivo_key, `${nome}.mp4`) });
}

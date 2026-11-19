import { NextResponse } from "next/server";
import { supaServidor } from "@/lib/supabase/server";
import { linkEnvio, r2Ligado } from "@/lib/r2";

// 1º passo do envio: registra a live e devolve o link para mandar o arquivo.
export async function POST(req: Request) {
  if (!r2Ligado()) return NextResponse.json({ erro: "Armazenamento ainda não configurado." }, { status: 503 });
  const supa = await supaServidor();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Entre na sua conta." }, { status: 401 });

  const { nome, tamanho, tipo, destino } = await req.json();
  if (!nome || !tamanho) return NextResponse.json({ erro: "Arquivo inválido." }, { status: 400 });
  if (tamanho > 20 * 1024 ** 3) return NextResponse.json({ erro: "O arquivo passa de 20 GB." }, { status: 413 });
  if (tipo && !String(tipo).startsWith("video/")) return NextResponse.json({ erro: "Mande um arquivo de vídeo." }, { status: 415 });

  const plataformas = destino === "shorts" ? ["shorts"] : destino === "tiktok" ? ["tiktok"] : ["shorts", "tiktok"];
  const ext = String(nome).split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "mp4";
  const titulo = String(nome).replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").slice(0, 120);

  // usa o cliente admin só para inserir (o navegador não pode criar linhas direto)
  const { supaAdmin } = await import("@/lib/supabase/server");
  const adm = supaAdmin();
  const { data: v, error } = await adm.from("videos")
    .insert({ user_id: user.id, titulo, arquivo_key: "pendente", tamanho_bytes: tamanho, plataformas })
    .select("id").single();
  if (error || !v) return NextResponse.json({ erro: "Não deu para registrar a live." }, { status: 500 });

  const key = `lives/${user.id}/${v.id}.${ext}`;
  await adm.from("videos").update({ arquivo_key: key }).eq("id", v.id);
  const url = await linkEnvio(key, tipo || "video/mp4");
  return NextResponse.json({ id: v.id, url });
}

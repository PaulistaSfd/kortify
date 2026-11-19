import { NextResponse } from "next/server";
import { supaServidor, supaAdmin } from "@/lib/supabase/server";
import { lerLink } from "@/lib/fontes";

// Recebe um link de VOD (vai para a fila) ou de canal (fica esperando a live começar).
export async function POST(req: Request) {
  const supa = await supaServidor();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Entre na sua conta." }, { status: 401 });

  const { url, destino, aoVivo, autorizado } = await req.json();
  if (!autorizado) return NextResponse.json({ erro: "Confirme que o vídeo é seu ou que você tem autorização." }, { status: 400 });
  const f = lerLink(String(url || ""));
  if (!f) return NextResponse.json({ erro: "Esse link não é da Twitch, da Kick nem do YouTube." }, { status: 400 });
  if (aoVivo && f.tipo !== "canal") return NextResponse.json({ erro: "Para capturar ao vivo, cole o link do canal (ex: twitch.tv/seucanal)." }, { status: 400 });
  if (!aoVivo && f.tipo === "canal") return NextResponse.json({ erro: "Esse é o link do canal. Cole o link do vídeo, ou use a aba Ao vivo." }, { status: 400 });

  const plataformas = destino === "shorts" ? ["shorts"] : destino === "tiktok" ? ["tiktok"] : ["shorts", "tiktok"];
  const { data: v, error } = await supaAdmin().from("videos").insert({
    user_id: user.id, titulo: f.nome, origem: aoVivo ? "live" : "link", fonte: f.fonte,
    url_origem: String(url).trim(), status: aoVivo ? "aguardando" : "na_fila", plataformas,
    autorizado_em: new Date().toISOString(),
  }).select("id").single();
  if (error || !v) return NextResponse.json({ erro: "Não deu para registrar. Tenta de novo." }, { status: 500 });
  return NextResponse.json({ id: v.id, tipo: f.tipo, nome: f.nome });
}

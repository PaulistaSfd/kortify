import { NextResponse } from "next/server";
import { supaAdmin } from "@/lib/supabase/server";
import { workerOk } from "@/lib/worker-auth";

// O motor pergunta quais canais ele deve vigiar (esperando live ou gravando agora).
export async function POST(req: Request) {
  if (!workerOk(req)) return NextResponse.json({ erro: "não autorizado" }, { status: 401 });
  const { data, error } = await supaAdmin().from("videos")
    .select("id,user_id,url_origem,fonte,status,plataformas,criado_em")
    .in("status", ["aguardando", "ao_vivo"]).order("criado_em");
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ canais: data });
}

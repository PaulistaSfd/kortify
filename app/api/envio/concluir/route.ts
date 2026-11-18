import { NextResponse } from "next/server";
import { supaServidor, supaAdmin } from "@/lib/supabase/server";

// 2º passo: o navegador terminou de mandar. A live entra na fila do motor.
export async function POST(req: Request) {
  const supa = await supaServidor();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Entre na sua conta." }, { status: 401 });
  const { id } = await req.json();
  const { error } = await supaAdmin().from("videos").update({ status: "na_fila" }).eq("id", id).eq("user_id", user.id).eq("status", "enviando");
  if (error) return NextResponse.json({ erro: "Não achei essa live." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

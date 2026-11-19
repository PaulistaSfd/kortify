import { NextResponse } from "next/server";
import { supaServidor, supaAdmin } from "@/lib/supabase/server";

// Para a captura ao vivo. Os cortes já feitos continuam lá.
export async function POST(req: Request) {
  const supa = await supaServidor();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Entre na sua conta." }, { status: 401 });
  const { id } = await req.json();
  const { error } = await supaAdmin().from("videos").update({ status: "pronto" })
    .eq("id", id).eq("user_id", user.id).in("status", ["aguardando", "ao_vivo"]);
  if (error) return NextResponse.json({ erro: "Não achei essa captura." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

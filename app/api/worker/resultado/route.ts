import { NextResponse } from "next/server";
import { supaAdmin } from "@/lib/supabase/server";
import { workerOk } from "@/lib/worker-auth";

// O motor avisa o progresso (etapa), o erro ou os cortes prontos.
export async function POST(req: Request) {
  if (!workerOk(req)) return NextResponse.json({ erro: "não autorizado" }, { status: 401 });
  const b = await req.json();
  const adm = supaAdmin();
  const { data: v } = await adm.from("videos").select("id,user_id").eq("id", b.id).single();
  if (!v) return NextResponse.json({ erro: "live não encontrada" }, { status: 404 });

  if (b.erro) {
    await adm.from("videos").update({ status: "erro", erro: String(b.erro).slice(0, 500), minutos: 0 }).eq("id", v.id);
    return NextResponse.json({ ok: true });
  }
  // live: "ao_vivo" quando começa a gravar; cortes com parcial=true chegam durante a live
  if (b.status === "ao_vivo") {
    await adm.from("videos").update({ status: "ao_vivo" }).eq("id", v.id);
    if (!Array.isArray(b.cortes)) return NextResponse.json({ ok: true });
  }
  if (typeof b.etapa === "number" && !b.cortes) {
    await adm.from("videos").update({ etapa: b.etapa, ...(b.duracao_seg ? { duracao_seg: b.duracao_seg, minutos: Math.ceil(b.duracao_seg / 60) } : {}) }).eq("id", v.id);
    return NextResponse.json({ ok: true });
  }
  if (Array.isArray(b.cortes)) {
    const linhas = b.cortes.map((c: Record<string, unknown>) => ({
      video_id: v.id, user_id: v.user_id,
      titulo: c.titulo, gancho: c.gancho ?? "", legenda: c.legenda ?? "",
      inicio_seg: c.inicio_seg ?? 0, dur_seg: c.dur_seg ?? 30, nota: c.nota ?? 0,
      motivos: c.motivos ?? [], arquivo_key: c.arquivo_key ?? null,
    }));
    if (linhas.length) await adm.from("cortes").insert(linhas);
    if (b.parcial) {
      if (b.duracao_seg) await adm.from("videos").update({ duracao_seg: b.duracao_seg, minutos: Math.ceil(b.duracao_seg / 60) }).eq("id", v.id);
      return NextResponse.json({ ok: true, cortes: linhas.length });
    }
    await adm.from("videos").update({ status: "pronto", etapa: 5, ...(b.duracao_seg ? { duracao_seg: b.duracao_seg, minutos: Math.ceil(b.duracao_seg / 60) } : {}) }).eq("id", v.id);
    return NextResponse.json({ ok: true, cortes: linhas.length });
  }
  return NextResponse.json({ erro: "nada para fazer" }, { status: 400 });
}

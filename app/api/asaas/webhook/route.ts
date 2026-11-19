import { NextResponse } from "next/server";
import { supaAdmin } from "@/lib/supabase/server";
import { lerEnv } from "@/lib/supabase/config";
import { metodoAsaas, statusAsaas } from "@/lib/asaas";

// O Asaas avisa aqui quando uma cobrança é criada, paga, vence ou é estornada.
// Configurar no Asaas: Integrações → Webhooks, com a mesma senha de ASAAS_WEBHOOK_TOKEN.
const MINUTOS: Record<string, number> = { start: 240, pro: 600, combo: 600 };

export async function POST(req: Request) {
  const token = lerEnv("ASAAS_WEBHOOK_TOKEN");
  if (!token || req.headers.get("asaas-access-token") !== token) return NextResponse.json({ erro: "não autorizado" }, { status: 401 });

  const corpo = await req.json().catch(() => null);
  if (!corpo?.event) return NextResponse.json({ erro: "aviso vazio" }, { status: 400 });
  const db = supaAdmin();
  let ok = true;

  try {
    const ev: string = corpo.event;
    const p = corpo.payment;
    const s = corpo.subscription;

    if (p?.id) {
      // externalReference = "<user_id>|<plano>" (definido quando o Kortify cria a cobrança)
      const [userId, planoRef] = String(p.externalReference || "").split("|");
      const status = statusAsaas(p.status);
      const dados: Record<string, any> = {
        status, metodo: metodoAsaas(p.billingType), valor: Number(p.value) || 0,
        taxa: Math.max(0, (Number(p.value) || 0) - (Number(p.netValue) || Number(p.value) || 0)),
        pago_em: status === "pago" || status === "reembolsado" ? (p.clientPaymentDate || p.paymentDate || new Date().toISOString()) : null,
      };
      const { data: existe } = await db.from("pedidos").select("id,user_id,plano,status").eq("gateway_id", p.id).maybeSingle();
      let pedido = existe;
      if (existe) await db.from("pedidos").update(dados).eq("id", existe.id);
      else if (userId && planoRef) {
        const { data: novo } = await db.from("pedidos").insert({ ...dados, user_id: userId, plano: planoRef, gateway: "asaas", gateway_id: p.id, origem: p.subscription ? "renovacao" : null }).select("id,user_id,plano,status").single();
        pedido = novo;
      }

      const uid = pedido?.user_id || userId;
      const plano = pedido?.plano || planoRef;
      if (uid && status === "pago" && existe?.status !== "pago") {
        if (!p.subscription || !existe) await db.from("eventos").insert({ tipo: "pago", user_id: uid });
        await db.from("perfis").update({ plano, minutos_plano: MINUTOS[plano] || 60 }).eq("id", uid);
        if (p.subscription) await db.from("assinaturas").update({ status: "ativa" }).eq("gateway_id", p.subscription);
        await db.from("faturas").insert({ user_id: uid, valor: dados.valor, metodo: dados.metodo === "cartao" ? "Cartão" : dados.metodo === "pix" ? "Pix" : "Boleto", status: "Pago", referencia: p.id, pago_em: dados.pago_em });
      }
      if (ev === "PAYMENT_OVERDUE" && p.subscription) await db.from("assinaturas").update({ status: "atrasada" }).eq("gateway_id", p.subscription);
    }

    if (s?.id && (ev === "SUBSCRIPTION_DELETED" || ev === "SUBSCRIPTION_INACTIVATED")) {
      const { data: a } = await db.from("assinaturas").update({ status: "cancelada", cancelada_em: new Date().toISOString(), proxima_cobranca: null }).eq("gateway_id", s.id).select("user_id").maybeSingle();
      if (a?.user_id) await db.from("perfis").update({ plano: "gratis", minutos_plano: 60 }).eq("id", a.user_id);
    }
  } catch {
    ok = false;
  }

  await db.from("webhooks").insert({ gateway: "asaas", evento: String(corpo.event).slice(0, 80), ok, corpo });
  // Responde 200 mesmo com falha interna, para o Asaas não pausar a fila de avisos; a falha fica no admin.
  return NextResponse.json({ ok });
}

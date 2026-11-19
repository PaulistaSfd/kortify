// Junta tudo que o painel admin mostra. Só roda no servidor.
import { supaAdmin } from "@/lib/supabase/server";
import { resumoAsaas } from "@/lib/asaas";
import { dadosExemplo } from "./exemplo";
import type { DadosAdmin, Pedido, Assinatura, Cliente, Job, Motor, Webhook } from "./tipos";

const faltaTabela = (e: any) => e && (e.code === "42P01" || e.code === "PGRST205" || e.code === "PGRST202" || /does not exist|Could not find/i.test(e.message || ""));

export async function carregarAdmin(modo: "exemplo" | "ok"): Promise<DadosAdmin> {
  if (modo === "exemplo") return dadosExemplo();

  const db = supaAdmin();
  const desde = new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString();
  const inicioMes = new Date(); inicioMes.setDate(1); inicioMes.setHours(0, 0, 0, 0);

  const [perfis, pedidos, assinaturas, funil, videos, cortes, motores, webhooks, gateway] = await Promise.all([
    db.from("perfis").select("id,nome,email,plano,minutos_plano,criado_em").order("criado_em", { ascending: false }).limit(5000),
    db.from("pedidos").select("*").gte("criado_em", desde).order("criado_em", { ascending: false }).limit(5000),
    db.from("assinaturas").select("*").order("inicio", { ascending: false }).limit(5000),
    db.rpc("funil_diario", { dias: 30 }),
    db.from("videos").select("id,user_id,titulo,origem,fonte,status,minutos,erro,criado_em").order("criado_em", { ascending: false }).limit(3000),
    db.from("cortes").select("user_id,status").limit(50000),
    db.from("motores").select("*").order("visto_em", { ascending: false }),
    db.from("webhooks").select("id,evento,ok,recebido_em").order("recebido_em", { ascending: false }).limit(12),
    resumoAsaas(),
  ]);

  const erroTabela = [pedidos.error, assinaturas.error, funil.error, motores.error, webhooks.error].find(faltaTabela);
  if (erroTabela) {
    const ex = dadosExemplo();
    return { ...ex, aviso: "Faltam as tabelas do admin no banco. Rode o arquivo supabase/004_admin.sql no Supabase. Até lá, os números abaixo são de exemplo." };
  }
  const primeiroErro = [perfis.error, pedidos.error, assinaturas.error, funil.error, videos.error, cortes.error].find(Boolean);
  if (primeiroErro) throw new Error(primeiroErro.message);

  const porId = new Map((perfis.data || []).map((p: any) => [p.id, p]));
  const nomeDe = (uid?: string | null, email?: string | null) => { const p: any = uid ? porId.get(uid) : null; return p?.nome || p?.email?.split("@")[0] || email?.split("@")[0] || "Sem nome"; };
  const emailDe = (uid?: string | null, email?: string | null) => email || (uid ? (porId.get(uid) as any)?.email : "") || "";

  const listaPedidos: Pedido[] = (pedidos.data || []).map((p: any) => ({
    id: p.id, cliente: nomeDe(p.user_id, p.email), email: emailDe(p.user_id, p.email), plano: p.plano, valor: Number(p.valor), taxa: Number(p.taxa || 0),
    metodo: p.metodo, status: p.status, criadoEm: p.criado_em, pagoEm: p.pago_em, gatewayId: p.gateway_id || "", origem: p.origem,
  }));

  const listaAss: Assinatura[] = (assinaturas.data || []).map((a: any) => ({
    id: a.id, cliente: nomeDe(a.user_id), email: emailDe(a.user_id), plano: a.plano, valor: Number(a.valor), metodo: a.metodo,
    status: a.status, inicio: a.inicio, proxima: a.proxima_cobranca, canceladaEm: a.cancelada_em, motivo: a.motivo_cancelamento,
  }));

  const usoMes = new Map<string, number>(); const nVideos = new Map<string, number>();
  for (const v of videos.data || []) {
    nVideos.set(v.user_id, (nVideos.get(v.user_id) || 0) + 1);
    if (new Date(v.criado_em) >= inicioMes) usoMes.set(v.user_id, (usoMes.get(v.user_id) || 0) + (v.minutos || 0));
  }
  const nCortes = new Map<string, number>(); const nBaix = new Map<string, number>();
  for (const c of cortes.data || []) { nCortes.set(c.user_id, (nCortes.get(c.user_id) || 0) + 1); if (c.status === "baixado") nBaix.set(c.user_id, (nBaix.get(c.user_id) || 0) + 1); }
  const gasto = new Map<string, number>();
  for (const p of pedidos.data || []) if (p.status === "pago" && p.user_id) gasto.set(p.user_id, (gasto.get(p.user_id) || 0) + Number(p.valor));

  const clientes: Cliente[] = (perfis.data || []).map((p: any) => ({
    id: p.id, nome: p.nome || p.email?.split("@")[0] || "Sem nome", email: p.email || "", criadoEm: p.criado_em, plano: p.plano,
    minutosUsados: usoMes.get(p.id) || 0, minutosPlano: p.minutos_plano, videos: nVideos.get(p.id) || 0,
    cortes: nCortes.get(p.id) || 0, baixados: nBaix.get(p.id) || 0, gastoTotal: gasto.get(p.id) || 0,
  }));

  const jobs: Job[] = (videos.data || []).slice(0, 40).map((v: any) => ({
    id: v.id, titulo: v.titulo, cliente: nomeDe(v.user_id), origem: v.origem || "arquivo", fonte: v.fonte || "arquivo",
    status: v.status, minutos: v.minutos || 0, criadoEm: v.criado_em, erro: v.erro,
  }));

  const listaMotores: Motor[] = (motores.data || []).map((m: any) => ({ nome: m.nome, vistoEm: m.visto_em, versao: m.versao, trabalhando: m.trabalhando }));
  const listaWebhooks: Webhook[] = (webhooks.data || []).map((w: any) => ({ id: String(w.id), evento: w.evento, ok: w.ok, recebidoEm: w.recebido_em }));

  return {
    modo: "real", aviso: gateway.erro ? `Asaas: ${gateway.erro}` : null, geradoEm: new Date().toISOString(),
    pedidos: listaPedidos, assinaturas: listaAss, clientes,
    funil: (funil.data || []).map((d: any) => ({ dia: String(d.dia), visitas: Number(d.visitas), cadastros: Number(d.cadastros), checkouts: Number(d.checkouts), pagos: Number(d.pagos) })),
    jobs, motores: listaMotores,
    gateway: { ...gateway, webhooks: listaWebhooks },
  };
}

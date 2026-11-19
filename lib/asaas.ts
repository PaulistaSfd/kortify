// Conversa com a API do Asaas, só no servidor.
// Chaves (Cloudflare → Variables and Secrets, tipo Secret):
//   ASAAS_API_KEY         chave da API ($aact_...)
//   ASAAS_AMBIENTE        "sandbox" (teste) ou "producao"
//   ASAAS_WEBHOOK_TOKEN   senha que o Asaas manda junto de cada aviso
import { lerEnv } from "@/lib/supabase/config";
import type { Gateway, Metodo, Transacao } from "@/lib/admin/tipos";

export const asaasLigado = () => Boolean(lerEnv("ASAAS_API_KEY"));
export const asaasAmbiente = (): "sandbox" | "producao" => (lerEnv("ASAAS_AMBIENTE") === "producao" ? "producao" : "sandbox");
const base = () => (asaasAmbiente() === "producao" ? "https://api.asaas.com/v3" : "https://api-sandbox.asaas.com/v3");

export async function asaas<T = any>(caminho: string, init: RequestInit = {}): Promise<T> {
  const r = await fetch(base() + caminho, {
    ...init,
    headers: { "Content-Type": "application/json", "User-Agent": "kortify", access_token: lerEnv("ASAAS_API_KEY"), ...(init.headers || {}) },
    cache: "no-store",
  });
  const corpo = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(corpo?.errors?.[0]?.description || `Asaas respondeu ${r.status}`);
  return corpo as T;
}

export const metodoAsaas = (t: string): Metodo => (t === "PIX" ? "pix" : t === "BOLETO" ? "boleto" : "cartao");
export const statusAsaas = (s: string) =>
  s === "RECEIVED" || s === "CONFIRMED" || s === "RECEIVED_IN_CASH" ? "pago"
  : s === "REFUNDED" || s === "REFUND_REQUESTED" || s === "CHARGEBACK_REQUESTED" ? "reembolsado"
  : s === "OVERDUE" ? "expirado"
  : s === "REFUSED" || s === "CANCELED" ? "recusado"
  : "gerado";

// Resumo para o painel: saldo, a receber, taxas do mês e últimas cobranças
export async function resumoAsaas(): Promise<Omit<Gateway, "webhooks">> {
  const vazio = { conectado: false, nome: "Asaas", ambiente: null, saldo: null, aReceber: null, taxasMes: null, transacoes: [] as Transacao[] };
  if (!asaasLigado()) return { ...vazio, erro: null };
  try {
    const inicioMes = new Date(); inicioMes.setDate(1);
    const desde = inicioMes.toISOString().slice(0, 10);
    const [saldo, confirmados, cobrancas, recebidosMes] = await Promise.all([
      asaas<{ balance: number }>("/finance/balance"),
      asaas<{ value: number; netValue: number }>("/finance/payment/statistics?status=CONFIRMED").catch(() => null),
      asaas<{ data: any[] }>("/payments?limit=20"),
      asaas<{ value: number; netValue: number }>(`/finance/payment/statistics?status=RECEIVED&paymentDate%5Bge%5D=${desde}`).catch(() => null),
    ]);
    const transacoes: Transacao[] = (cobrancas.data || []).map((p) => ({
      id: p.id, data: p.paymentDate || p.dateCreated, descricao: p.description || "Cobrança",
      valor: Number(p.value) || 0, taxa: Math.max(0, (Number(p.value) || 0) - (Number(p.netValue) || 0)),
      status: statusAsaas(p.status), metodo: metodoAsaas(p.billingType),
    }));
    return {
      conectado: true, nome: "Asaas", ambiente: asaasAmbiente(),
      saldo: saldo.balance ?? null,
      aReceber: confirmados ? confirmados.netValue ?? confirmados.value : null,
      taxasMes: recebidosMes ? Math.max(0, (recebidosMes.value || 0) - (recebidosMes.netValue || 0)) : null,
      transacoes, erro: null,
    };
  } catch (e: any) {
    return { ...vazio, conectado: false, ambiente: asaasAmbiente(), erro: e?.message || "Não deu para falar com o Asaas" };
  }
}

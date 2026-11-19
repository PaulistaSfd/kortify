// Contas do painel admin (receita, MRR, conversão...). Funções puras.
import type { DadosAdmin, Pedido, Assinatura, Metodo } from "./tipos";

export const brl = (v: number, centavos = true) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: centavos ? 2 : 0, maximumFractionDigits: centavos ? 2 : 0 });
export const num = (v: number) => v.toLocaleString("pt-BR");
export const pct = (v: number, casas = 1) => `${(Number.isFinite(v) ? v * 100 : 0).toLocaleString("pt-BR", { maximumFractionDigits: casas, minimumFractionDigits: casas })}%`;
export const div = (a: number, b: number) => (b > 0 ? a / b : 0);

const DIA = 86400000;
export const dataCurta = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "").replace(" de ", " ");
export const dataHora = (iso: string) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
export function ha(iso: string, agora = Date.now()) {
  const s = Math.max(0, Math.round((agora - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)} min`;
  if (s < 86400) return `${Math.floor(s / 3600)} h`;
  return `${Math.floor(s / 86400)} d`;
}

export type Periodo = 7 | 30 | 90;

// Janela de N dias contando hoje (hoje + N-1 dias para trás), igual ao gráfico por dia.
export function janela(dias: number, deslocar = 0, agora = Date.now()) {
  const hoje = new Date(agora); hoje.setHours(0, 0, 0, 0);
  const ini = hoje.getTime() - (dias - 1) * DIA - deslocar * dias * DIA;
  const fim = deslocar ? ini + dias * DIA : agora;
  return { ini, fim };
}
const dentro = (iso: string | null, j: { ini: number; fim: number }) => { if (!iso) return false; const t = new Date(iso).getTime(); return t >= j.ini && t <= j.fim; };

export function resumoVendas(pedidos: Pedido[], dias: number, deslocar = 0) {
  const j = janela(dias, deslocar);
  const gerados = pedidos.filter((p) => dentro(p.criadoEm, j));
  const pagos = pedidos.filter((p) => p.status === "pago" && dentro(p.pagoEm, j));
  const novos = pagos.filter((p) => p.origem !== "renovacao");
  const receita = pagos.reduce((s, p) => s + p.valor, 0);
  const taxas = pagos.reduce((s, p) => s + p.taxa, 0);
  const reembolsos = pedidos.filter((p) => p.status === "reembolsado" && dentro(p.pagoEm, j)).reduce((s, p) => s + p.valor, 0);
  const geradosNovos = gerados.filter((p) => p.origem !== "renovacao");
  return {
    receita, taxas, liquido: receita - taxas - reembolsos, reembolsos,
    nPagos: pagos.length, nNovos: novos.length, nGerados: geradosNovos.length,
    ticket: div(receita, pagos.length),
    taxaPagamento: div(geradosNovos.filter((p) => p.status === "pago" || p.status === "reembolsado").length, geradosNovos.length),
  };
}

export function mrr(ass: Assinatura[]) {
  return ass.filter((a) => a.status === "ativa" || a.status === "atrasada").reduce((s, a) => s + a.valor, 0);
}

export function churn30(ass: Assinatura[]) {
  const j = janela(30);
  const cancel = ass.filter((a) => a.canceladaEm && dentro(a.canceladaEm, j)).length;
  const base = ass.filter((a) => new Date(a.inicio).getTime() <= j.ini && (!a.canceladaEm || new Date(a.canceladaEm).getTime() > j.ini)).length;
  return div(cancel, base || ass.length);
}

export function receitaPorDia(pedidos: Pedido[], dias: number) {
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const lista = Array.from({ length: dias }, (_, i) => {
    const d = new Date(hoje); d.setDate(d.getDate() - (dias - 1 - i));
    return { dia: d.toISOString().slice(0, 10), novos: 0, renov: 0, data: d };
  });
  const idx = new Map(lista.map((d, i) => [d.dia, i]));
  for (const p of pedidos) {
    if (p.status !== "pago" || !p.pagoEm) continue;
    const d = new Date(p.pagoEm); d.setHours(0, 0, 0, 0);
    const i = idx.get(d.toISOString().slice(0, 10));
    if (i === undefined) continue;
    if (p.origem === "renovacao") lista[i].renov += p.valor; else lista[i].novos += p.valor;
  }
  return lista;
}

export function porMetodo(pedidos: Pedido[], dias: number) {
  const j = janela(dias);
  const res: Record<Metodo, { gerados: number; pagos: number; receita: number }> = { pix: { gerados: 0, pagos: 0, receita: 0 }, cartao: { gerados: 0, pagos: 0, receita: 0 }, boleto: { gerados: 0, pagos: 0, receita: 0 } };
  for (const p of pedidos) {
    if (!dentro(p.criadoEm, j)) continue;
    res[p.metodo].gerados++;
    if (p.status === "pago") { res[p.metodo].pagos++; res[p.metodo].receita += p.valor; }
  }
  return res;
}

export function funilTotal(d: DadosAdmin, dias: number) {
  const f = d.funil.slice(-dias);
  return f.reduce((s, x) => ({ visitas: s.visitas + x.visitas, cadastros: s.cadastros + x.cadastros, checkouts: s.checkouts + x.checkouts, pagos: s.pagos + x.pagos }), { visitas: 0, cadastros: 0, checkouts: 0, pagos: 0 });
}

export const motorOnline = (vistoEm: string) => Date.now() - new Date(vistoEm).getTime() < 3 * 60000;

export function csv(linhas: (string | number | null)[][]) {
  return linhas.map((l) => l.map((c) => { const s = c === null ? "" : String(c); return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }).join(";")).join("\n");
}
export function baixarCsv(nome: string, conteudo: string) {
  const url = URL.createObjectURL(new Blob(["﻿" + conteudo], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a"); a.href = url; a.download = nome; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

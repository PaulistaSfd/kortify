"use client";
import { useState, type ReactNode } from "react";
import { brl, pct, div, dataCurta } from "@/lib/admin/calc";
import { nomeStatusPedido, nomeStatusAss, nomeMetodo, type StatusPedido, type StatusAssinatura, type Metodo } from "@/lib/admin/tipos";

// ---------- cabeçalho de página
export function Cabeca({ tc, rotulo, titulo, destaque, children, lado }: { tc: string; rotulo: string; titulo: string; destaque?: string; children?: ReactNode; lado?: ReactNode }) {
  return (
    <header className="k-head row">
      <div>
        <p className="k-label"><span className="tc num">{tc}</span> {rotulo}</p>
        <h1 className="k-h1 md">{titulo}{destaque ? <><br /><em>{destaque}</em></> : null}</h1>
        {children ? <p className="k-lead">{children}</p> : null}
      </div>
      {lado}
    </header>
  );
}

// ---------- seletor de período (segmentado, estilo timeline)
export function Periodos<T extends number>({ valor, opcoes, mudar }: { valor: T; opcoes: { v: T; nome: string }[]; mudar: (v: T) => void }) {
  return (
    <div className="a-seg" role="radiogroup" aria-label="Período">
      {opcoes.map((o) => (
        <button key={o.v} type="button" role="radio" aria-checked={valor === o.v} className={valor === o.v ? "on" : ""} onClick={() => mudar(o.v)}>{o.nome}</button>
      ))}
    </div>
  );
}

// ---------- número grande com variação
export function Kpi({ nome, valor, sub, delta, invertido, destaque }: { nome: string; valor: ReactNode; sub?: ReactNode; delta?: number | null; invertido?: boolean; destaque?: boolean }) {
  const bom = delta == null ? null : invertido ? delta < 0 : delta > 0;
  return (
    <div className={`a-kpi${destaque ? " hl" : ""}`}>
      <span className="a-kpi-n">{nome}</span>
      <b className="a-kpi-v num">{valor}</b>
      <span className="a-kpi-s">
        {delta != null && Number.isFinite(delta) ? <em className={`a-delta ${bom ? "up" : delta === 0 ? "" : "down"}`}>{delta > 0 ? "▲" : delta < 0 ? "▼" : "•"} {pct(Math.abs(delta), 0)}</em> : null}
        {sub}
      </span>
    </div>
  );
}
export const variacao = (agora: number, antes: number) => (antes > 0 ? (agora - antes) / antes : null);

// ---------- gráfico de barras da receita (cada dia é um clipe na timeline)
export function BarrasReceita({ dias }: { dias: { dia: string; novos: number; renov: number; data: Date }[] }) {
  const [foco, setFoco] = useState<number | null>(null);
  const max = Math.max(1, ...dias.map((d) => d.novos + d.renov));
  const topo = Math.ceil(max / 100) * 100;
  const sel = foco !== null ? dias[foco] : null;
  const total = dias.reduce((s, d) => s + d.novos + d.renov, 0);
  return (
    <div className="a-chart">
      <div className="a-chart-top">
        <div>
          <span className="k-label">{sel ? dataCurta(sel.data.toISOString()) : `Últimos ${dias.length} dias`}</span>
          <b className="a-chart-v num">{brl(sel ? sel.novos + sel.renov : total)}</b>
        </div>
        <div className="a-legend">
          <span><i className="l-novos" /> Vendas novas {sel ? <b className="num">{brl(sel.novos, false)}</b> : null}</span>
          <span><i className="l-renov" /> Renovações {sel ? <b className="num">{brl(sel.renov, false)}</b> : null}</span>
        </div>
      </div>
      <div className="a-bars" style={{ ["--n" as any]: dias.length }} onMouseLeave={() => setFoco(null)}>
        <div className="a-grid" aria-hidden="true">
          {[1, 0.5, 0].map((f) => <span key={f}><em className="num">{brl(topo * f, false)}</em></span>)}
        </div>
        {dias.map((d, i) => {
          const h = div(d.novos + d.renov, topo) * 100;
          const hn = div(d.novos, d.novos + d.renov) * 100;
          return (
            <button key={d.dia} type="button" className={`a-bar${foco === i ? " on" : ""}`} onMouseEnter={() => setFoco(i)} onFocus={() => setFoco(i)} onBlur={() => setFoco(null)}
              aria-label={`${dataCurta(d.data.toISOString())}: ${brl(d.novos + d.renov)}`}>
              <span className="a-bar-col" style={{ height: `${Math.max(h, d.novos + d.renov > 0 ? 2 : 0.6)}%` }}>
                <span className="a-bar-renov" style={{ height: `${100 - hn}%` }} />
              </span>
            </button>
          );
        })}
      </div>
      <div className="a-axis num" aria-hidden="true">
        {dias.map((d, i) => <span key={d.dia}>{i === 0 || i === dias.length - 1 || i % Math.ceil(dias.length / 6) === 0 ? dataCurta(d.data.toISOString()) : ""}</span>)}
      </div>
    </div>
  );
}

// ---------- funil (cada etapa é um clipe com alças, mais curto a cada passo)
export function Funil({ etapas }: { etapas: { nome: string; valor: number }[] }) {
  const max = Math.max(1, etapas[0]?.valor || 1);
  return (
    <ol className="a-funnel">
      {etapas.map((e, i) => {
        const w = Math.max(6, div(e.valor, max) * 100);
        const conv = i > 0 ? div(e.valor, etapas[i - 1].valor) : null;
        return (
          <li key={e.nome}>
            <div className="a-funnel-head">
              <span className="a-funnel-n num">{String(i + 1).padStart(2, "0")}</span>
              <span>{e.nome}</span>
              <b className="num">{e.valor.toLocaleString("pt-BR")}</b>
            </div>
            <div className="a-funnel-track"><span className="a-clipbar" style={{ width: `${w}%` }} /></div>
            {conv !== null && <span className="a-funnel-conv num">{pct(conv)} da etapa anterior</span>}
          </li>
        );
      })}
    </ol>
  );
}

// ---------- barra de proporção (Pix / cartão / boleto, planos)
export function Proporcao({ partes }: { partes: { nome: string; valor: number; cor: string; extra?: ReactNode }[] }) {
  const total = partes.reduce((s, p) => s + p.valor, 0);
  return (
    <div className="a-prop">
      <div className="a-prop-bar">
        {partes.map((p) => p.valor > 0 && <span key={p.nome} style={{ flexGrow: p.valor, background: p.cor }} title={`${p.nome}: ${pct(div(p.valor, total))}`} />)}
      </div>
      <ul className="a-prop-list">
        {partes.map((p) => (
          <li key={p.nome}><i style={{ background: p.cor }} /><span>{p.nome}</span><b className="num">{pct(div(p.valor, total), 0)}</b>{p.extra ? <em>{p.extra}</em> : null}</li>
        ))}
      </ul>
    </div>
  );
}

// ---------- etiquetas de status
export const StPedido = ({ s }: { s: StatusPedido }) => <span className={`a-st st-${s}`}>{nomeStatusPedido[s]}</span>;
export const StAss = ({ s }: { s: StatusAssinatura }) => <span className={`a-st sa-${s}`}>{nomeStatusAss[s]}</span>;
export const MetodoTag = ({ m }: { m: Metodo }) => <span className={`a-met m-${m}`}>{nomeMetodo[m]}</span>;

// ---------- abas de filtro com contagem
export function Abas<T extends string>({ valor, abas, mudar }: { valor: T; abas: { v: T; nome: string; n?: number }[]; mudar: (v: T) => void }) {
  return (
    <div className="k-tabs-in a-abas" role="tablist">
      {abas.map((a) => (
        <button key={a.v} type="button" role="tab" aria-selected={valor === a.v} className={valor === a.v ? "on" : ""} onClick={() => mudar(a.v)}>
          {a.nome}{a.n !== undefined ? <span className="a-count num">{a.n}</span> : null}
        </button>
      ))}
    </div>
  );
}

export function Vazio({ children }: { children: ReactNode }) {
  return <div className="k-empty"><p className="k-muted">{children}</p></div>;
}

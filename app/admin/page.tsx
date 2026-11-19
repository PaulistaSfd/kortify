"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useAdmin } from "@/components/admin/AdminShell";
import { Cabeca, Periodos, Kpi, variacao, BarrasReceita, Funil, Proporcao, StPedido, MetodoTag } from "@/components/admin/ui";
import { ChevronRight, Alert } from "@/components/app/icones";
import { brl, num, pct, div, resumoVendas, mrr, churn30, receitaPorDia, porMetodo, funilTotal, ha, motorOnline, type Periodo } from "@/lib/admin/calc";
import { nomePlano } from "@/lib/admin/tipos";

export default function VisaoGeral() {
  const d = useAdmin();
  const [per, setPer] = useState<Periodo>(30);

  const v = useMemo(() => resumoVendas(d.pedidos, per), [d, per]);
  const antes = useMemo(() => resumoVendas(d.pedidos, per, 1), [d, per]);
  const dias = useMemo(() => receitaPorDia(d.pedidos, per === 90 ? 30 : per), [d, per]);
  const met = useMemo(() => porMetodo(d.pedidos, per), [d, per]);
  const f = useMemo(() => funilTotal(d, Math.min(per, 30)), [d, per]);
  const ativos = d.assinaturas.filter((a) => a.status === "ativa" || a.status === "atrasada");
  const valorMrr = mrr(d.assinaturas);
  const churn = churn30(d.assinaturas);

  const alertas: { txt: string; href: string }[] = [];
  const atrasadas = d.assinaturas.filter((a) => a.status === "atrasada");
  if (atrasadas.length) alertas.push({ txt: `${atrasadas.length} ${atrasadas.length === 1 ? "assinatura atrasada" : "assinaturas atrasadas"} (${brl(atrasadas.reduce((s, a) => s + a.valor, 0), false)} em risco)`, href: "/admin/assinaturas" });
  const aguardando = d.pedidos.filter((p) => p.status === "gerado");
  if (aguardando.length) alertas.push({ txt: `${aguardando.length} ${aguardando.length === 1 ? "Pix gerado esperando" : "Pix e boletos esperando"} pagamento`, href: "/admin/vendas" });
  if (!d.motores.some((m) => motorOnline(m.vistoEm))) alertas.push({ txt: "Nenhum motor ligado: as lives ficam paradas na fila", href: "/admin/motor" });
  const falhas = d.gateway.webhooks.filter((w) => !w.ok).length;
  if (falhas) alertas.push({ txt: `${falhas} ${falhas === 1 ? "aviso do Asaas falhou" : "avisos do Asaas falharam"}`, href: "/admin/gateway" });
  if (!d.gateway.conectado) alertas.push({ txt: "Asaas ainda não conectado", href: "/admin/gateway" });

  const planos = (["start", "pro", "combo"] as const).map((p) => ({ p, n: ativos.filter((a) => a.plano === p).length }));

  return (
    <div className="k-page">
      <Cabeca tc="00:00:00" rotulo="Admin · visão geral" titulo="Quanto" destaque="entrou."
        lado={<Periodos valor={per} mudar={setPer} opcoes={[{ v: 7, nome: "7 dias" }, { v: 30, nome: "30 dias" }, { v: 90, nome: "90 dias" }]} />}>
        <b>{brl(v.receita)}</b> em {per} dias, {num(v.nPagos)} {v.nPagos === 1 ? "pagamento" : "pagamentos"}. Sobra <b>{brl(v.liquido)}</b> depois das taxas{v.reembolsos ? " e reembolsos" : ""}.
      </Cabeca>

      {alertas.length > 0 && (
        <ul className="a-alerts">
          {alertas.map((a) => <li key={a.txt}><Link href={a.href}><Alert width={16} height={16} /> <span>{a.txt}</span> <ChevronRight width={16} height={16} /></Link></li>)}
        </ul>
      )}

      <section className="a-kpis">
        <Kpi destaque nome="Receita" valor={brl(v.receita, false)} delta={variacao(v.receita, antes.receita)} sub={<>vs {per} dias antes</>} />
        <Kpi nome="MRR" valor={brl(valorMrr, false)} sub={<>{num(ativos.length)} assinantes</>} />
        <Kpi nome="Vendas novas" valor={num(v.nNovos)} delta={variacao(v.nNovos, antes.nNovos)} sub={<>{num(v.nGerados)} pedidos gerados</>} />
        <Kpi nome="Ticket médio" valor={brl(v.ticket)} delta={variacao(v.ticket, antes.ticket)} />
        <Kpi nome="Conversão" valor={pct(div(f.pagos, f.visitas), 2)} sub={<>visita → pago</>} />
        <Kpi nome="Cancelamento" valor={pct(churn)} invertido sub={<>últimos 30 dias</>} />
      </section>

      <section className="k-card a-sec">
        <div className="k-sec-head"><h2 className="k-h2">Receita por dia</h2><span className="k-muted sm">{per === 90 ? "mostrando os últimos 30" : ""}</span></div>
        <BarrasReceita dias={dias} />
      </section>

      <div className="a-two">
        <section className="k-card a-sec">
          <div className="k-sec-head"><h2 className="k-h2">Funil</h2><span className="k-muted sm num">{Math.min(per, 30)} dias</span></div>
          <Funil etapas={[{ nome: "Visitas no site", valor: f.visitas }, { nome: "Criaram conta", valor: f.cadastros }, { nome: "Abriram o pagamento", valor: f.checkouts }, { nome: "Pagaram", valor: f.pagos }]} />
        </section>

        <div className="a-stack">
          <section className="k-card a-sec">
            <div className="k-sec-head"><h2 className="k-h2">Como pagam</h2><span className="k-muted sm">aprovação</span></div>
            <Proporcao partes={[
              { nome: "Pix", valor: met.pix.receita, cor: "var(--k-pri)", extra: pct(div(met.pix.pagos, met.pix.gerados), 0) },
              { nome: "Cartão", valor: met.cartao.receita, cor: "var(--a-c2)", extra: pct(div(met.cartao.pagos, met.cartao.gerados), 0) },
              { nome: "Boleto", valor: met.boleto.receita, cor: "var(--a-c3)", extra: pct(div(met.boleto.pagos, met.boleto.gerados), 0) },
            ]} />
            <p className="k-muted sm">Aprovação é quantos pedidos gerados viraram pagamento. Pix baixo quase sempre é gente que gerou o QR e desistiu.</p>
          </section>
          <section className="k-card a-sec">
            <div className="k-sec-head"><h2 className="k-h2">Planos ativos</h2><span className="k-muted sm num">{num(ativos.length)}</span></div>
            <Proporcao partes={planos.map((x, i) => ({ nome: nomePlano[x.p], valor: x.n, cor: ["var(--a-c3)", "var(--k-pri)", "var(--a-c2)"][i], extra: num(x.n) }))} />
          </section>
        </div>
      </div>

      <section className="k-sec">
        <div className="k-sec-head"><h2 className="k-h2">Últimos pedidos</h2><Link href="/admin/vendas" className="k-link">Ver todos <ChevronRight width={16} height={16} /></Link></div>
        <div className="a-table-wrap">
          <table className="a-table">
            <thead><tr><th>Quando</th><th>Cliente</th><th>Plano</th><th>Forma</th><th className="r">Valor</th><th>Status</th></tr></thead>
            <tbody>
              {d.pedidos.slice(0, 8).map((p) => (
                <tr key={p.id}>
                  <td className="num a-dim" suppressHydrationWarning>há {ha(p.criadoEm)}</td>
                  <td><b>{p.cliente}</b><small>{p.email}</small></td>
                  <td>{nomePlano[p.plano]}{p.origem === "renovacao" ? <small>renovação</small> : null}</td>
                  <td><MetodoTag m={p.metodo} /></td>
                  <td className="r num">{brl(p.valor)}</td>
                  <td><StPedido s={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

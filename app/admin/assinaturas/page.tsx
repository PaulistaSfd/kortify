"use client";
import { useMemo, useState } from "react";
import { useAdmin } from "@/components/admin/AdminShell";
import { Cabeca, Abas, Kpi, StAss, MetodoTag, Vazio } from "@/components/admin/ui";
import { Search } from "@/components/app/icones";
import { brl, num, pct, div, mrr, churn30, dataCurta } from "@/lib/admin/calc";
import { nomePlano, type StatusAssinatura } from "@/lib/admin/tipos";

export default function Assinaturas() {
  const d = useAdmin();
  const [st, setSt] = useState<"todas" | StatusAssinatura>("todas");
  const [busca, setBusca] = useState("");
  const a = d.assinaturas;
  const ativas = a.filter((x) => x.status === "ativa");
  const atrasadas = a.filter((x) => x.status === "atrasada");
  const valorMrr = mrr(a);
  const churn = churn30(a);
  const ltv = churn > 0 ? div(valorMrr, ativas.length + atrasadas.length) / churn : null;
  const proximos7 = a.filter((x) => x.proxima && (x.status === "ativa" || x.status === "atrasada") && new Date(x.proxima).getTime() - Date.now() < 7 * 86400000);

  const motivos = useMemo(() => {
    const m = new Map<string, number>();
    for (const x of a) if (x.status === "cancelada" && x.motivo) m.set(x.motivo, (m.get(x.motivo) || 0) + 1);
    return [...m.entries()].sort((p, q) => q[1] - p[1]);
  }, [a]);

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return a.filter((x) => (st === "todas" || x.status === st) && (!q || `${x.cliente} ${x.email}`.toLowerCase().includes(q)));
  }, [a, st, busca]);

  return (
    <div className="k-page">
      <Cabeca tc="00:02:40" rotulo="Admin · assinaturas" titulo="Quem paga" destaque="todo mês.">
        <b>{brl(valorMrr, false)}</b> de receita recorrente por mês. {proximos7.length ? <>{num(proximos7.length)} cobranças nos próximos 7 dias.</> : null}
      </Cabeca>

      <section className="a-kpis">
        <Kpi destaque nome="MRR" valor={brl(valorMrr, false)} sub={<>{brl(valorMrr * 12, false)} por ano</>} />
        <Kpi nome="Ativas" valor={num(ativas.length)} />
        <Kpi nome="Atrasadas" valor={num(atrasadas.length)} sub={brl(atrasadas.reduce((s, x) => s + x.valor, 0), false)} />
        <Kpi nome="Cancelamento" valor={pct(churn)} invertido sub="últimos 30 dias" />
        <Kpi nome="Valor por cliente" valor={ltv ? brl(ltv, false) : "—"} sub="média até cancelar" />
        <Kpi nome="Em teste" valor={num(a.filter((x) => x.status === "teste").length)} />
      </section>

      <div className="a-two wide">
        <section className="k-sec">
          <Abas valor={st} mudar={setSt} abas={[
            { v: "todas", nome: "Todas", n: a.length },
            { v: "ativa", nome: "Ativas", n: ativas.length },
            { v: "atrasada", nome: "Atrasadas", n: atrasadas.length },
            { v: "teste", nome: "Teste", n: a.filter((x) => x.status === "teste").length },
            { v: "cancelada", nome: "Canceladas", n: a.filter((x) => x.status === "cancelada").length },
          ]} />
          <label className="k-search"><Search width={18} height={18} /><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar assinante" aria-label="Buscar assinante" /></label>
          {lista.length === 0 ? <Vazio>Nenhuma assinatura aqui.</Vazio> : (
            <div className="a-table-wrap">
              <table className="a-table">
                <thead><tr><th>Cliente</th><th>Plano</th><th>Forma</th><th className="r">Valor</th><th>Desde</th><th>Próxima</th><th>Status</th></tr></thead>
                <tbody>
                  {lista.slice(0, 120).map((x) => (
                    <tr key={x.id}>
                      <td><b>{x.cliente}</b><small>{x.email}</small></td>
                      <td>{nomePlano[x.plano]}</td>
                      <td><MetodoTag m={x.metodo} /></td>
                      <td className="r num">{brl(x.valor, false)}</td>
                      <td className="num a-dim">{dataCurta(x.inicio)}</td>
                      <td className="num a-dim">{x.proxima ? dataCurta(x.proxima + "T12:00:00") : x.canceladaEm ? <>saiu {dataCurta(x.canceladaEm)}</> : "—"}</td>
                      <td><StAss s={x.status} />{x.motivo ? <small>{x.motivo}</small> : null}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="a-stack">
          <section className="k-card a-sec">
            <h2 className="k-h2">Por que saem</h2>
            {motivos.length === 0 ? <p className="k-muted sm">Ninguém cancelou ainda.</p> : (
              <ul className="a-reasons">
                {motivos.map(([m, n]) => (
                  <li key={m}><span>{m}</span><b className="num">{n}</b><span className="a-reason-bar"><i style={{ width: `${div(n, motivos[0][1]) * 100}%` }} /></span></li>
                ))}
              </ul>
            )}
            <p className="k-muted sm">O motivo vem da pergunta que aparece quando a pessoa cancela no painel.</p>
          </section>
          <section className="k-card a-sec">
            <h2 className="k-h2">Cobranças da semana</h2>
            {proximos7.length === 0 ? <p className="k-muted sm">Nada nos próximos 7 dias.</p> : (
              <ul className="a-mini-list">
                {proximos7.sort((p, q) => (p.proxima || "").localeCompare(q.proxima || "")).slice(0, 8).map((x) => (
                  <li key={x.id}><span className="num a-dim">{dataCurta(x.proxima + "T12:00:00")}</span><span>{x.cliente}</span><b className="num">{brl(x.valor, false)}</b></li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

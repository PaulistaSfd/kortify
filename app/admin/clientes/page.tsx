"use client";
import { useMemo, useState } from "react";
import { useAdmin } from "@/components/admin/AdminShell";
import { Cabeca, Abas, Kpi, Vazio } from "@/components/admin/ui";
import { Download } from "@/components/admin/icones";
import { Search } from "@/components/app/icones";
import { brl, num, pct, div, dataCurta, csv, baixarCsv } from "@/lib/admin/calc";
import { nomePlano } from "@/lib/admin/tipos";

type Ordem = "recentes" | "gasto" | "uso" | "cortes";

export default function Clientes() {
  const d = useAdmin();
  const [plano, setPlano] = useState<"todos" | "pagantes" | "gratis">("todos");
  const [ordem, setOrdem] = useState<Ordem>("recentes");
  const [busca, setBusca] = useState("");
  const c = d.clientes;
  const pagantes = c.filter((x) => x.plano !== "gratis");
  const semUso = pagantes.filter((x) => x.videos === 0);
  const perto = pagantes.filter((x) => div(x.minutosUsados, x.minutosPlano) >= 0.85);

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    const l = c.filter((x) => (plano === "todos" || (plano === "gratis" ? x.plano === "gratis" : x.plano !== "gratis")) && (!q || `${x.nome} ${x.email}`.toLowerCase().includes(q)));
    const f: Record<Ordem, (a: typeof c[0], b: typeof c[0]) => number> = {
      recentes: (a, b) => b.criadoEm.localeCompare(a.criadoEm),
      gasto: (a, b) => b.gastoTotal - a.gastoTotal,
      uso: (a, b) => div(b.minutosUsados, b.minutosPlano) - div(a.minutosUsados, a.minutosPlano),
      cortes: (a, b) => b.cortes - a.cortes,
    };
    return [...l].sort(f[ordem]);
  }, [c, plano, ordem, busca]);

  const exportar = () => baixarCsv(`kortify-clientes-${new Date().toISOString().slice(0, 10)}.csv`, csv([
    ["nome", "email", "plano", "desde", "minutos_usados", "minutos_plano", "lives", "cortes", "baixados", "gasto_total"],
    ...lista.map((x) => [x.nome, x.email, nomePlano[x.plano], x.criadoEm.slice(0, 10), x.minutosUsados, x.minutosPlano, x.videos, x.cortes, x.baixados, x.gastoTotal.toFixed(2).replace(".", ",")]),
  ]));

  return (
    <div className="k-page">
      <Cabeca tc="00:03:55" rotulo="Admin · clientes" titulo="Quem usa" destaque="o Kortify.">
        {num(c.length)} contas, {num(pagantes.length)} pagando. Quem paga e não usa costuma cancelar: vale mandar uma mensagem.
      </Cabeca>

      <section className="a-kpis four">
        <Kpi nome="Contas" valor={num(c.length)} />
        <Kpi nome="Pagantes" valor={num(pagantes.length)} sub={pct(div(pagantes.length, c.length)) + " das contas"} />
        <Kpi nome="Pagam e não usam" valor={num(semUso.length)} invertido sub="risco de cancelar" />
        <Kpi nome="Quase sem minutos" valor={num(perto.length)} sub="chance de subir de plano" />
      </section>

      <section className="k-sec">
        <Abas valor={plano} mudar={setPlano} abas={[{ v: "todos", nome: "Todos", n: c.length }, { v: "pagantes", nome: "Pagantes", n: pagantes.length }, { v: "gratis", nome: "Grátis", n: c.length - pagantes.length }]} />
        <div className="k-filters">
          <label className="k-search"><Search width={18} height={18} /><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome ou e-mail" aria-label="Buscar clientes" /></label>
          <select className="a-select" value={ordem} onChange={(e) => setOrdem(e.target.value as Ordem)} aria-label="Ordenar">
            <option value="recentes">Mais novos</option><option value="gasto">Quem mais pagou</option><option value="uso">Mais uso do plano</option><option value="cortes">Mais cortes</option>
          </select>
          <button type="button" className="a-btn" onClick={exportar}><Download width={16} height={16} /> Baixar planilha</button>
        </div>
        {lista.length === 0 ? <Vazio>Ninguém com esse filtro.</Vazio> : (
          <div className="a-table-wrap">
            <table className="a-table">
              <thead><tr><th>Cliente</th><th>Plano</th><th>Uso no mês</th><th className="r">Lives</th><th className="r">Cortes</th><th className="r">Pagou ao todo</th><th>Desde</th></tr></thead>
              <tbody>
                {lista.slice(0, 150).map((x) => {
                  const u = div(x.minutosUsados, x.minutosPlano);
                  return (
                    <tr key={x.id}>
                      <td><b>{x.nome}</b><small>{x.email}</small></td>
                      <td><span className={`a-plan p-${x.plano}`}>{nomePlano[x.plano]}</span></td>
                      <td className="a-use">
                        <span className="a-use-bar"><i style={{ width: `${Math.min(100, u * 100)}%` }} className={u >= 0.85 ? "hot" : ""} /></span>
                        <small className="num">{num(x.minutosUsados)} de {num(x.minutosPlano)} min</small>
                      </td>
                      <td className="r num">{num(x.videos)}</td>
                      <td className="r num">{num(x.cortes)}<small>{num(x.baixados)} baixados</small></td>
                      <td className="r num">{x.gastoTotal ? brl(x.gastoTotal, false) : "—"}</td>
                      <td className="num a-dim">{dataCurta(x.criadoEm)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

"use client";
import { useMemo, useState } from "react";
import { useAdmin } from "@/components/admin/AdminShell";
import { Cabeca, Abas, Kpi, StPedido, MetodoTag, Vazio, Periodos } from "@/components/admin/ui";
import { Download } from "@/components/admin/icones";
import { Search } from "@/components/app/icones";
import { brl, num, pct, div, dataHora, csv, baixarCsv, resumoVendas, janela } from "@/lib/admin/calc";
import { nomePlano, nomeMetodo, nomeStatusPedido, type StatusPedido, type Metodo } from "@/lib/admin/tipos";

type Filtro = "todos" | StatusPedido;

export default function Vendas() {
  const d = useAdmin();
  const [st, setSt] = useState<Filtro>("todos");
  const [met, setMet] = useState<"todos" | Metodo>("todos");
  const [busca, setBusca] = useState("");
  const [per, setPer] = useState<7 | 30 | 90>(30);
  const [renov, setRenov] = useState(true);
  const [limite, setLimite] = useState(50);

  const noPeriodo = useMemo(() => { const j = janela(per); return d.pedidos.filter((p) => { const t = new Date(p.criadoEm).getTime(); return t >= j.ini && t <= j.fim && (renov || p.origem !== "renovacao"); }); }, [d, per, renov]);
  const cont = (s: StatusPedido) => noPeriodo.filter((p) => p.status === s).length;
  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return noPeriodo.filter((p) => (st === "todos" || p.status === st) && (met === "todos" || p.metodo === met) && (!q || `${p.cliente} ${p.email} ${p.gatewayId}`.toLowerCase().includes(q)));
  }, [noPeriodo, st, met, busca]);
  const v = resumoVendas(d.pedidos, per);
  const total = lista.filter((p) => p.status === "pago").reduce((s, p) => s + p.valor, 0);

  const exportar = () => baixarCsv(`kortify-pedidos-${new Date().toISOString().slice(0, 10)}.csv`, csv([
    ["id", "criado_em", "pago_em", "cliente", "email", "plano", "forma", "valor", "taxa", "status", "origem", "id_asaas"],
    ...lista.map((p) => [p.id, p.criadoEm, p.pagoEm, p.cliente, p.email, nomePlano[p.plano], nomeMetodo[p.metodo], p.valor.toFixed(2).replace(".", ","), p.taxa.toFixed(2).replace(".", ","), nomeStatusPedido[p.status], p.origem, p.gatewayId]),
  ]));

  return (
    <div className="k-page">
      <Cabeca tc="00:01:12" rotulo="Admin · vendas" titulo="Pedidos" destaque="e pagamentos."
        lado={<Periodos valor={per} mudar={setPer} opcoes={[{ v: 7, nome: "7 dias" }, { v: 30, nome: "30 dias" }, { v: 90, nome: "90 dias" }]} />}>
        Cada Pix gerado, cartão tentado e boleto emitido aparece aqui, pago ou não.
      </Cabeca>

      <section className="a-kpis four">
        <Kpi nome="Pedidos gerados" valor={num(v.nGerados)} sub="sem renovações" />
        <Kpi nome="Pagos" valor={num(v.nPagos)} sub={<>{num(v.nNovos)} novos</>} />
        <Kpi nome="Taxa de pagamento" valor={pct(v.taxaPagamento)} sub="gerado → pago" />
        <Kpi nome="Taxas do Asaas" valor={brl(v.taxas)} sub={<>{pct(div(v.taxas, v.receita))} da receita</>} />
      </section>

      <section className="k-sec">
        <Abas valor={st} mudar={setSt} abas={[
          { v: "todos", nome: "Todos", n: noPeriodo.length },
          { v: "pago", nome: "Pagos", n: cont("pago") },
          { v: "gerado", nome: "Aguardando", n: cont("gerado") },
          { v: "expirado", nome: "Expirados", n: cont("expirado") },
          { v: "recusado", nome: "Recusados", n: cont("recusado") },
          { v: "reembolsado", nome: "Reembolsados", n: cont("reembolsado") },
        ]} />
        <div className="k-filters">
          <label className="k-search"><Search width={18} height={18} /><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, e-mail ou ID do Asaas" aria-label="Buscar pedidos" /></label>
          <select className="a-select" value={met} onChange={(e) => setMet(e.target.value as any)} aria-label="Forma de pagamento">
            <option value="todos">Toda forma</option><option value="pix">Pix</option><option value="cartao">Cartão</option><option value="boleto">Boleto</option>
          </select>
          <label className="a-check"><input type="checkbox" checked={renov} onChange={(e) => setRenov(e.target.checked)} /> Mostrar renovações</label>
          <button type="button" className="a-btn" onClick={exportar}><Download width={16} height={16} /> Baixar planilha</button>
        </div>

        {lista.length === 0 ? <Vazio>Nenhum pedido com esses filtros.</Vazio> : (
          <>
            <p className="k-muted sm">{num(lista.length)} pedidos · <b className="num">{brl(total)}</b> pagos nesta lista</p>
            <div className="a-table-wrap">
              <table className="a-table">
                <thead><tr><th>Criado</th><th>Cliente</th><th>Plano</th><th>Forma</th><th className="r">Valor</th><th className="r">Taxa</th><th>Status</th><th>ID Asaas</th></tr></thead>
                <tbody>
                  {lista.slice(0, limite).map((p) => (
                    <tr key={p.id}>
                      <td className="num a-dim">{dataHora(p.criadoEm)}{p.pagoEm && p.status === "pago" ? <small>pago {dataHora(p.pagoEm)}</small> : null}</td>
                      <td><b>{p.cliente}</b><small>{p.email}</small></td>
                      <td>{nomePlano[p.plano]}<small>{p.origem === "renovacao" ? "renovação" : p.origem ? `origem: ${p.origem === "indicacao" ? "indicação" : p.origem}` : "origem direta"}</small></td>
                      <td><MetodoTag m={p.metodo} /></td>
                      <td className="r num">{brl(p.valor)}</td>
                      <td className="r num a-dim">{brl(p.taxa)}</td>
                      <td><StPedido s={p.status} /></td>
                      <td className="num a-dim a-id">{p.gatewayId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {lista.length > limite && <button type="button" className="a-btn a-more" onClick={() => setLimite((l) => l + 50)}>Mostrar mais {Math.min(50, lista.length - limite)}</button>}
          </>
        )}
      </section>
    </div>
  );
}

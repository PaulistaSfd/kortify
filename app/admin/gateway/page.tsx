"use client";
import { useState } from "react";
import { useAdmin } from "@/components/admin/AdminShell";
import { Cabeca, Kpi, StPedido, MetodoTag, Vazio } from "@/components/admin/ui";
import { External } from "@/components/admin/icones";
import { Copy, Check } from "@/components/app/icones";
import { brl, dataHora, ha } from "@/lib/admin/calc";
import type { StatusPedido } from "@/lib/admin/tipos";

export default function Gateway() {
  const { gateway: g, modo } = useAdmin();
  const [copiado, setCopiado] = useState(false);
  const urlWebhook = typeof window !== "undefined" ? `${window.location.origin}/api/asaas/webhook` : "/api/asaas/webhook";
  const painelAsaas = g.ambiente === "producao" ? "https://www.asaas.com" : "https://sandbox.asaas.com";
  const copiar = async () => { try { await navigator.clipboard.writeText(urlWebhook); setCopiado(true); setTimeout(() => setCopiado(false), 1600); } catch {} };

  return (
    <div className="k-page">
      <Cabeca tc="00:05:03" rotulo="Admin · Asaas" titulo="O dinheiro" destaque="na conta."
        lado={<a className="a-btn" href={painelAsaas} target="_blank" rel="noreferrer"><External width={16} height={16} /> Abrir o Asaas</a>}>
        Saldo, o que ainda vai cair e as últimas cobranças, puxados direto da API do Asaas.
      </Cabeca>

      <section className="k-card a-conn">
        <span className={`a-led big${g.conectado ? " on" : ""}`} aria-hidden="true" />
        <div>
          <b>{g.conectado ? "Asaas conectado" : "Asaas não conectado"}</b>
          <p className="k-muted sm">
            {g.conectado ? <>Ambiente: <b>{g.ambiente === "producao" ? "produção (dinheiro de verdade)" : "sandbox (teste)"}</b>{modo === "exemplo" ? " · dados de exemplo" : ""}</>
              : g.erro ? <>Erro: {g.erro}</> : <>Falta colocar a chave da API do Asaas na Cloudflare.</>}
          </p>
        </div>
      </section>

      {g.conectado ? (
        <section className="a-kpis three">
          <Kpi destaque nome="Saldo disponível" valor={g.saldo != null ? brl(g.saldo) : "—"} sub="pode sacar por Pix" />
          <Kpi nome="A receber" valor={g.aReceber != null ? brl(g.aReceber) : "—"} sub="cartão confirmado, ainda não caiu" />
          <Kpi nome="Taxas do mês" valor={g.taxasMes != null ? brl(g.taxasMes) : "—"} />
        </section>
      ) : (
        <section className="k-card a-sec a-setup">
          <h2 className="k-h2">Como conectar</h2>
          <ol className="a-steps">
            <li><b>Crie a conta no Asaas</b> em asaas.com. Para testar sem dinheiro de verdade, use o sandbox.asaas.com.</li>
            <li><b>Pegue a chave da API</b> em Integrações → Chave de API. Ela começa com <code>$aact_</code>. Não mande ela no chat.</li>
            <li><b>Na Cloudflare</b> (Workers → kortify → Settings → Variables and Secrets), adicione como <b>Secret</b>: <code>ASAAS_API_KEY</code> com a chave e <code>ASAAS_WEBHOOK_TOKEN</code> com uma senha que você inventar. Como <b>Text</b>: <code>ASAAS_AMBIENTE</code> = <code>sandbox</code>.</li>
            <li><b>No Asaas</b>, em Integrações → Webhooks, crie um webhook com a URL abaixo e a mesma senha do <code>ASAAS_WEBHOOK_TOKEN</code>. Marque os eventos de cobrança e de assinatura.</li>
          </ol>
        </section>
      )}

      <section className="k-card a-sec">
        <div className="k-sec-head"><h2 className="k-h2">Endereço dos avisos</h2></div>
        <p className="k-muted sm">O Asaas manda um aviso para este endereço cada vez que uma cobrança é paga, vence ou é estornada. É assim que o Kortify libera o plano sozinho.</p>
        <div className="a-copy">
          <code className="num">{urlWebhook}</code>
          <button type="button" className="a-btn" onClick={copiar}>{copiado ? <><Check width={16} height={16} /> Copiado</> : <><Copy width={16} height={16} /> Copiar</>}</button>
        </div>
      </section>

      <div className="a-two wide">
        <section className="k-sec">
          <div className="k-sec-head"><h2 className="k-h2">Últimas cobranças no Asaas</h2></div>
          {g.transacoes.length === 0 ? <Vazio>Nenhuma cobrança ainda.</Vazio> : (
            <div className="a-table-wrap">
              <table className="a-table">
                <thead><tr><th>Data</th><th>Descrição</th><th>Forma</th><th className="r">Valor</th><th className="r">Taxa</th><th>Status</th></tr></thead>
                <tbody>
                  {g.transacoes.map((t) => (
                    <tr key={t.id}>
                      <td className="num a-dim">{dataHora(t.data)}</td>
                      <td>{t.descricao}<small className="num">{t.id}</small></td>
                      <td><MetodoTag m={t.metodo} /></td>
                      <td className="r num">{brl(t.valor)}</td>
                      <td className="r num a-dim">{brl(t.taxa)}</td>
                      <td><StPedido s={t.status as StatusPedido} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="k-card a-sec">
          <h2 className="k-h2">Avisos recebidos</h2>
          {g.webhooks.length === 0 ? <p className="k-muted sm">Nenhum aviso chegou ainda.</p> : (
            <ul className="a-log">
              {g.webhooks.map((w) => (
                <li key={w.id} className={w.ok ? "" : "bad"}>
                  <span className="a-log-dot" aria-hidden="true" />
                  <code className="num">{w.evento}</code>
                  <span className="num a-dim" suppressHydrationWarning>há {ha(w.recebidoEm)}</span>
                  {!w.ok && <em>falhou</em>}
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}

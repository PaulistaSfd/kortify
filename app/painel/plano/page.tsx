"use client";
import { useState } from "react";
import { planos } from "@/lib/dados";
import { useDados } from "@/components/app/Dados";
import { Botao } from "@/components/app/Botao";
import { Check, QrCode, Card, Copy, Gift } from "@/components/app/icones";
import { Download } from "@/components/icons";

// QR de exemplo: três quadrados de canto e o resto pseudoaleatório.
const qr = (i: number) => {
  const x = i % 11, y = Math.floor(i / 11);
  const canto = (cx: number, cy: number) => x >= cx && x < cx + 3 && y >= cy && y < cy + 3;
  if (canto(0, 0) || canto(8, 0) || canto(0, 8)) return !(x % 8 === 1 && y % 8 === 1);
  if ((x < 4 && y < 4) || (x > 6 && y < 4) || (x < 4 && y > 6)) return false;
  return ((i * 2654435761) >>> 0) % 7 < 3;
};

export default function Plano() {
  const { usuario, faturas, videos } = useDados();
  const [metodo, setMetodo] = useState<"pix" | "cartao">("pix");
  const [copiado, setCopiado] = useState(false);
  const [cancelar, setCancelar] = useState(false);
  const [escolhido, setEscolhido] = useState("pro");
  const pct = Math.min(100, Math.round((usuario.minutosUsados / Math.max(1, usuario.minutosPlano)) * 100));
  const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="k-page">
      <header className="k-head">
        <p className="k-label"><span className="tc num">02:27:40</span> Assinatura</p>
        <h1 className="k-h1">Seu <em>plano.</em></h1>
      </header>

      <section className="k-card k-plan-now">
        <div>
          <p className="k-label"><span className="tc num">ATIVO</span> Renova em {usuario.renovaEm}</p>
          <h2 className="k-plan-name">{usuario.plano}</h2>
          <p className="k-plan-price"><b className="num">R$ {usuario.preco}</b>/mês</p>
        </div>
        <div className="k-plan-usage">
          <p className="k-big num">{usuario.minutosUsados}<small>/{usuario.minutosPlano} min</small></p>
          <div className="k-meter">
            {videos.filter((v) => v.minutos).map((v, i) => <i key={v.id} className={`m${i}`} style={{ flexGrow: v.minutos }} />)}
            <i className="free" style={{ flexGrow: Math.max(0, usuario.minutosPlano - usuario.minutosUsados) }} />
          </div>
          <p className="k-muted sm">{pct}% dos minutos usados. Minuto que sobra não acumula.</p>
          <button type="button" className="k-link"><Gift width={14} height={14} /> Comprar 2 horas avulsas por R$ 29</button>
        </div>
      </section>

      <section className="k-sec">
        <div className="k-sec-head"><h2 className="k-h2">Trocar de plano</h2></div>
        <ol className="k-prices">
          {planos.map((p, i) => {
            const atual = p.nome === usuario.plano;
            return (
              <li key={p.id} className={`k-price${escolhido === p.id ? " on" : ""}${p.breve ? " soon" : ""}`}>
                <span className="k-index-n num">{String(i + 1).padStart(2, "0")}</span>
                <div className="k-price-name">
                  <h3>{p.nome}</h3>
                  {atual && <span className="k-pill p-aprovado">Seu plano</span>}
                  {p.breve && <span className="k-pill">Em breve</span>}
                </div>
                <ul className="k-price-list">{p.itens.map((x) => <li key={x}><Check width={14} height={14} />{x}</li>)}</ul>
                <p className="k-price-v"><b className="num">R$ {p.preco}</b><small>/mês</small></p>
                <div className="k-price-act">
                  {atual ? <span className="k-muted sm">Plano atual</span> : p.breve ? <Botao v="line" disabled>Avise-me</Botao> : <Botao v={p.preco < usuario.preco ? "line" : "yellow"} onClick={() => setEscolhido(p.id)}>{p.preco < usuario.preco ? "Mudar para Start" : "Assinar"}</Botao>}
                </div>
              </li>
            );
          })}
        </ol>
        {escolhido === "start" && <p className="k-note">Você passa para o Start no dia {usuario.renovaEm}. Até lá continua com os 600 minutos do Pro.</p>}
      </section>

      <div className="k-two">
        <section className="k-card">
          <h2 className="k-h3">Forma de pagamento</h2>
          <div className="k-seg full">
            <button type="button" className={metodo === "pix" ? "on" : ""} onClick={() => setMetodo("pix")}><QrCode width={16} height={16} /> Pix</button>
            <button type="button" className={metodo === "cartao" ? "on" : ""} onClick={() => setMetodo("cartao")}><Card width={16} height={16} /> Cartão</button>
          </div>
          {metodo === "pix" ? (
            <div className="k-pix">
              <div className="k-qr" aria-label="QR Code do Pix de exemplo">
                {Array.from({ length: 121 }).map((_, i) => <i key={i} className={qr(i) ? "b" : ""} />)}
              </div>
              <div>
                <p>Todo mês a gente manda o Pix por e-mail 3 dias antes de vencer. Pagou, liberou na hora.</p>
                <button type="button" className="k-copy" onClick={() => { setCopiado(true); setTimeout(() => setCopiado(false), 1800); }}>
                  {copiado ? <Check width={16} height={16} /> : <Copy width={16} height={16} />}<span className="num">{copiado ? "Copiado" : "00020126…kortify…6304"}</span>
                </button>
              </div>
            </div>
          ) : (
            <form className="k-fields" onSubmit={(e) => e.preventDefault()}>
              <label className="k-field"><span>Número do cartão</span><input inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" /></label>
              <div className="k-two tight">
                <label className="k-field"><span>Validade</span><input autoComplete="cc-exp" placeholder="MM/AA" /></label>
                <label className="k-field"><span>CVV</span><input inputMode="numeric" autoComplete="cc-csc" placeholder="123" /></label>
              </div>
              <Botao type="submit" v="ink">Salvar cartão</Botao>
            </form>
          )}
        </section>

        <section className="k-card">
          <h2 className="k-h3">Faturas</h2>
          <table className="k-table">
            <thead><tr><th>Data</th><th>Valor</th><th>Pago com</th><th><span className="sr">Baixar</span></th></tr></thead>
            <tbody>
              {faturas.map((f) => (
                <tr key={f.id}>
                  <td className="num">{f.data}</td>
                  <td className="num">{brl(f.valor)}</td>
                  <td>{f.metodo}</td>
                  <td><button type="button" className="k-icon-btn" aria-label={`Baixar fatura de ${f.data}`}><Download width={16} height={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <section className="k-cancel">
        {!cancelar ? (
          <button type="button" className="k-link muted" onClick={() => setCancelar(true)}>Cancelar assinatura</button>
        ) : (
          <div className="k-card k-cancel-box">
            <h2 className="k-h3">Tem certeza?</h2>
            <p className="k-muted">Você continua com acesso até {usuario.renovaEm}. Os cortes ficam guardados por 30 dias depois disso.</p>
            <div className="k-row">
              <Botao v="ink" onClick={() => setCancelar(false)}>Continuar no Pro</Botao>
              <button type="button" className="k-link danger">Cancelar mesmo assim</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

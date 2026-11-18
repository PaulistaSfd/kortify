"use client";
import Link from "next/link";
import { Envio } from "@/components/app/Envio";
import { Etapas } from "@/components/app/Etapas";
import { Telefone } from "@/components/app/Telefone";
import { Botao } from "@/components/app/Botao";
import { ChevronRight, Flame } from "@/components/app/icones";
import { fmtDur } from "@/lib/dados";
import { useDados } from "@/components/app/Dados";

export default function Inicio() {
  const { usuario, videos, cortes } = useDados();
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
  const processando = videos.find((v) => v.status === "processando");
  const paraRevisar = cortes.filter((c) => c.status === "sugerido" || c.status === "aprovado").sort((a, b) => b.nota - a.nota);
  const pct = Math.min(100, Math.round((usuario.minutosUsados / Math.max(1, usuario.minutosPlano)) * 100));

  return (
    <div className="k-page">
      <header className="k-head">
        <p className="k-label"><span className="tc num">00:00:00</span> Painel</p>
        <h1 className="k-h1">{saudacao},<br /><em>{usuario.primeiroNome || "criador"}.</em></h1>
        <p className="k-lead">{videos.length === 0 ? <>Manda sua primeira live aqui embaixo. Em uns minutos os cortes aparecem nesta tela.</> : <>Você tem <b>{paraRevisar.length} {paraRevisar.length === 1 ? "corte" : "cortes"}</b> esperando sua escolha{processando ? " e uma live sendo cortada agora" : ""}.</>}</p>
      </header>

      <div className="k-grid-home">
        <Envio />

        <section className="k-card k-usage" aria-labelledby="uso-t">
          <p className="k-label"><span className="tc num">MIN</span> <span id="uso-t">Uso do mês</span></p>
          <p className="k-big num">{usuario.minutosUsados}<small>/{usuario.minutosPlano} min</small></p>
          <div className="k-meter" aria-hidden="true">
            {videos.filter((v) => v.minutos).map((v, i) => (
              <i key={v.id} style={{ flexGrow: v.minutos }} className={`m${i}`} title={v.titulo} />
            ))}
            <i className="free" style={{ flexGrow: Math.max(0, usuario.minutosPlano - usuario.minutosUsados) }} />
          </div>
          <ul className="k-legend">
            {videos.filter((v) => v.minutos).map((v, i) => (
              <li key={v.id}><i className={`m${i}`} />{v.canal}<span className="num">{v.minutos} min</span></li>
            ))}
          </ul>
          <p className="k-muted sm">{pct}% usado. Renova em {usuario.renovaEm}.</p>
          <Botao href="/painel/plano" v="line">Ver plano</Botao>
        </section>
      </div>

      {processando && (
        <section className="k-card k-live" aria-labelledby="live-t">
          <div className="k-live-head">
            <span className="k-rec"><i /> Cortando agora</span>
            <h2 id="live-t" className="k-h3">{processando.titulo}</h2>
            <span className="k-muted num">{processando.duracao} de live, enviada {processando.enviadoEm.toLowerCase()}</span>
            <Link href={`/painel/videos/${processando.id}`} className="k-more">Abrir <ChevronRight width={16} height={16} /></Link>
          </div>
          <Etapas inicio={processando.etapa} />
        </section>
      )}

      {paraRevisar.length > 0 && <section className="k-sec" aria-labelledby="rev-t">
        <div className="k-sec-head">
          <h2 id="rev-t" className="k-h2">Prontos para escolher</h2>
          <Link href="/painel/cortes" className="k-more">Todos os cortes <ChevronRight width={16} height={16} /></Link>
        </div>
        <div className="k-reel">
          {paraRevisar.map((c, i) => (
            <Link key={c.id} href={`/painel/cortes/${c.id}`} className="k-clip" style={{ ["--d" as string]: `${i * 60}ms` }}>
              <Telefone cor={c.cor} gancho={c.gancho} legenda={c.legenda} dur={fmtDur(c.dur)} ativa={1} />
              <span className="k-clip-meta">
                <span className="k-score num"><Flame width={14} height={14} />{c.nota}</span>
                <b>{c.titulo}</b>
                <span className="k-muted num">{c.inicio} na live</span>
              </span>
            </Link>
          ))}
        </div>
      </section>}
    </div>
  );
}

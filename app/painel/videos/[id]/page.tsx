"use client";
import Link from "next/link";
import { useParams } from "next/navigation";

import { fmtDur } from "@/lib/dados";
import { useDados } from "@/components/app/Dados";
import { Etapas } from "@/components/app/Etapas";
import { Telefone } from "@/components/app/Telefone";
import { Botao } from "@/components/app/Botao";
import { ArrowLeft, Flame, Check, X, Undo, Alert, Wand, Zap } from "@/components/app/icones";
import { Download } from "@/components/icons";

export default function VideoPage() {
  const { id } = useParams<{ id: string }>();
  const { videos, cortes, marcarCorte: marcar, carregando, modo, atualizar } = useDados();
  const v = videos.find((x) => x.id === id) || (carregando ? null : videos[0]);
  if (!v) return <div className="k-page"><p className="k-muted">{carregando ? "Carregando…" : "Live não encontrada."}</p></div>;
  const lista = cortes.filter((c) => c.videoId === v.id).sort((a, b) => b.nota - a.nota);
  const estado = Object.fromEntries(lista.map((c) => [c.id, c.status]));
  const aprovados = lista.filter((c) => estado[c.id] === "aprovado" || estado[c.id] === "baixado").length;

  return (
    <div className="k-page">
      <Link href="/painel/videos" className="k-back"><ArrowLeft width={16} height={16} /> Lives enviadas</Link>
      <header className="k-head">
        <p className="k-label"><span className="tc num">{v.duracao}</span> {v.canal}</p>
        <h1 className="k-h1 md">{v.titulo}</h1>
      </header>

      {(v.status === "aguardando" || v.status === "ao_vivo") && (
        <section className="k-card k-proc">
          {v.status === "aguardando" ? (
            <div className="k-wait">
              <span className="k-wait-pulse"><Zap width={22} height={22} /></span>
              <h2 className="k-h3">Esperando a live começar</h2>
              <p className="k-muted">O Kortify confere o canal a cada minuto. Assim que você entrar ao vivo, ele começa a gravar e os cortes vão aparecendo aqui.</p>
            </div>
          ) : (
            <div className="k-proc-head">
              <span className="k-rec"><i /> Ao vivo · gravando</span>
              <p className="k-muted">Ao vivo há <b className="num">{v.duracao}</b>. A cada 10 minutos o Kortify analisa o bloco e solta os melhores momentos aqui embaixo.</p>
            </div>
          )}
          <div className="k-row">
            <button type="button" className="k-link danger" onClick={async () => { if (modo === "real") { await fetch("/api/envio/parar", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: v.id }) }); atualizar(); } }}>Parar captura</button>
          </div>
        </section>
      )}

      {v.status === "processando" && (
        <section className="k-card k-proc">
          <div className="k-proc-head">
            <span className="k-rec"><i /> Cortando agora</span>
            <p className="k-muted">Uma live de 4 horas leva uns 20 minutos. Pode fechar esta página, a gente te avisa por e-mail.</p>
          </div>
          <Etapas inicio={v.etapa} />
          <div className="k-found">
            <p className="k-label"><span className="tc num">03</span> Momentos achados até agora</p>
            <div className="k-found-list">
              {["01:12:40", "02:03:18", "02:51:07"].map((t, i) => (
                <span key={t} className="k-found-item" style={{ ["--d" as string]: `${i * 120}ms` }}><Flame width={14} height={14} /><span className="num">{t}</span></span>
              ))}
              <span className="k-found-item ghost">procurando…</span>
            </div>
          </div>
        </section>
      )}

      {v.status === "erro" && (
        <section className="k-card k-err">
          <Alert width={24} height={24} />
          <div>
            <h2 className="k-h3">Não deu para abrir esse arquivo</h2>
            <p className="k-muted">O vídeo parece estar corrompido ou sem áudio. Os minutos não foram descontados do seu plano. Tente exportar de novo e mandar outra vez.</p>
          </div>
          <Botao href="/painel#enviar">Mandar de novo</Botao>
        </section>
      )}

      {(v.status === "pronto" || (v.status === "ao_vivo" && lista.length > 0)) && (
        <>
          <div className="k-toolbar">
            <p><b className="num">{lista.length}</b> cortes sugeridos · <b className="num">{aprovados}</b> escolhidos</p>
            <div className="k-row">
              <button type="button" className="k-link" onClick={() => lista.forEach((c) => estado[c.id] === "sugerido" && marcar(c.id, "aprovado"))}>Escolher todos</button>
              <Botao v="yellow" icon={<Download width={16} height={16} />} disabled={!aprovados}>Baixar escolhidos</Botao>
            </div>
          </div>

          <ol className="k-picks">
            {lista.map((c, i) => {
              const s = estado[c.id];
              const fora = s === "descartado";
              return (
                <li key={c.id} className={`k-pick s-${s}`}>
                  <span className="k-pick-n num">{String(i + 1).padStart(2, "0")}</span>
                  <Link href={`/painel/cortes/${c.id}`} className="k-pick-thumb" aria-label={`Editar ${c.titulo}`}>
                    <Telefone cor={c.cor} gancho={c.gancho} dur={fmtDur(c.dur)} />
                  </Link>
                  <div className="k-pick-body">
                    <span className="k-score num"><Flame width={14} height={14} />{c.nota}</span>
                    <h3 className="k-h3">{c.titulo}</h3>
                    <p className="k-muted num">Começa em {c.inicio} · {c.dur}s</p>
                    <p className="k-quote">“{c.legenda}”</p>
                    <ul className="k-tags">{c.motivos.map((m) => <li key={m}>{m}</li>)}</ul>
                  </div>
                  <div className="k-pick-act">
                    {fora ? (
                      <button type="button" className="k-ghost" onClick={() => marcar(c.id, "sugerido")}><Undo width={16} height={16} /> Desfazer</button>
                    ) : (
                      <>
                        <button type="button" className={`k-toggle${s !== "sugerido" ? " on" : ""}`} aria-pressed={s !== "sugerido"} onClick={() => marcar(c.id, s === "sugerido" ? "aprovado" : "sugerido")}>
                          <Check width={16} height={16} /> {s === "baixado" ? "Baixado" : s === "aprovado" ? "Escolhido" : "Escolher"}
                        </button>
                        <Link href={`/painel/cortes/${c.id}`} className="k-ghost"><Wand width={16} height={16} /> Editar</Link>
                        <button type="button" className="k-ghost danger" onClick={() => marcar(c.id, "descartado")} aria-label="Descartar"><X width={16} height={16} /> Descartar</button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </div>
  );
}

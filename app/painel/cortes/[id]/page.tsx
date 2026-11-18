"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { estilosLegenda } from "@/lib/dados";
import { useDados } from "@/components/app/Dados";
import { Botao } from "@/components/app/Botao";
import { ArrowLeft, Play, Pause, Undo, Eye, Check } from "@/components/app/icones";
import { Download, Captions, Volume2, Scissors } from "@/components/icons";

const cores = ["#FACC15", "#6366F1", "#38BDF8", "#22C55E", "#F43F5E", "#FFFFFF"];
type Aba = "texto" | "estilo" | "audio";

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const { cortes, videos, carregando } = useDados();
  const c = cortes.find((x) => x.id === id) || (carregando ? null : cortes[0]);
  if (!c) return <div className="k-page"><p className="k-muted">{carregando ? "Carregando…" : "Corte não encontrado."}</p></div>;
  return <EditorCorte key={c.id} c={c} v={videos.find((x) => x.id === c.videoId)} />;
}

function EditorCorte({ c, v }: { c: import("@/lib/dados").Corte; v?: import("@/lib/dados").Video }) {
  const { salvarCorte, marcarCorte, modo } = useDados();

  const [gancho, setGancho] = useState(c.gancho);
  const [legenda, setLegenda] = useState(c.legenda);
  const [estilo, setEstilo] = useState("pop");
  const [cor, setCor] = useState(cores[0]);
  const [pos, setPos] = useState<"cima" | "meio" | "baixo">("baixo");
  const [aba, setAba] = useState<Aba>("texto");
  const [musica, setMusica] = useState(true);
  const [vol, setVol] = useState(30);
  const [silencio, setSilencio] = useState(true);
  const [zoom, setZoom] = useState(true);
  const [zona, setZona] = useState<"off" | "tiktok" | "shorts">("off");
  const [ini, setIni] = useState(0);
  const [fim, setFim] = useState(c.dur);
  const [t, setT] = useState(0);
  const [tocando, setTocando] = useState(false);
  const [salvo, setSalvo] = useState<"" | "salvo" | "baixando" | "erro">("");

  const palavras = useMemo(() => legenda.trim().split(/\s+/), [legenda]);
  const total = c.dur;
  const dur = Math.max(1, fim - ini);

  useEffect(() => {
    if (!tocando) return;
    const tm = setInterval(() => setT((x) => (x + 0.1 >= dur ? 0 : x + 0.1)), 100);
    return () => clearInterval(tm);
  }, [tocando, dur]);

  // palavra atual e o bloco de 3 palavras que aparece na tela
  const atual = Math.min(palavras.length - 1, Math.floor((t / dur) * palavras.length));
  const bloco = Math.floor(atual / 3) * 3;
  const visiveis = palavras.slice(bloco, bloco + 3);
  const s = (n: number) => `0:${String(Math.round(n)).padStart(2, "0")}`;

  const salvar = async () => {
    await salvarCorte(c.id, { gancho, legenda, estilo, cor_destaque: cor, posicao: pos });
    setSalvo("salvo");
  };
  const baixar = async () => {
    setSalvo("baixando");
    await salvarCorte(c.id, { gancho, legenda, estilo, cor_destaque: cor, posicao: pos });
    if (modo === "real") {
      const r = await fetch(`/api/cortes/${c.id}/baixar`).then((x) => x.json()).catch(() => ({}));
      if (r.url) { location.href = r.url; marcarCorte(c.id, "baixado"); setSalvo("salvo"); return; }
      setSalvo("erro"); return;
    }
    setTimeout(() => setSalvo("salvo"), 1600);
  };

  return (
    <div className="k-page k-editor-page">
      <Link href={`/painel/videos/${c.videoId}`} className="k-back"><ArrowLeft width={16} height={16} /> {v?.titulo}</Link>

      <div className="k-editor">
        <div className="k-stage">
          <div className={`k-phone big ed pos-${pos}`} style={{ ["--c" as string]: c.cor, ["--hl" as string]: cor }}>
            <div className={`k-phone-scene${zoom && tocando ? " zoom" : ""}`} aria-hidden="true"><span /><span /></div>
            {gancho && <p className="k-hook">{gancho}</p>}
            <p className={`k-cap cap-${estilo}`} aria-live="off">
              {visiveis.map((w, i) => <span key={bloco + i} className={bloco + i === atual ? "on" : ""}>{w} </span>)}
            </p>
            {zona !== "off" && (
              <div className={`k-zone z-${zona}`} aria-hidden="true">
                <span className="z-right" /><span className="z-bottom" /><span className="z-top" />
                <em>Área coberta pelos botões do {zona === "tiktok" ? "TikTok" : "Shorts"}</em>
              </div>
            )}
            <button type="button" className="k-play" onClick={() => setTocando((p) => !p)} aria-label={tocando ? "Pausar" : "Tocar"}>
              {tocando ? <Pause width={22} height={22} /> : <Play width={22} height={22} />}
            </button>
          </div>
          <div className="k-zone-pick" role="radiogroup" aria-label="Mostrar área segura">
            <Eye width={16} height={16} />
            {(["off", "tiktok", "shorts"] as const).map((z) => (
              <button key={z} type="button" role="radio" aria-checked={zona === z} className={zona === z ? "on" : ""} onClick={() => setZona(z)}>
                {z === "off" ? "Sem guia" : z === "tiktok" ? "TikTok" : "Shorts"}
              </button>
            ))}
          </div>
        </div>

        <div className="k-panel">
          <header className="k-panel-head">
            <p className="k-label"><span className="tc num">{c.inicio}</span> Editar corte</p>
            <h1 className="k-h1 sm">{c.titulo}</h1>
          </header>

          <div className="k-tabs-in" role="tablist">
            {([["texto", "Texto", Captions], ["estilo", "Estilo", Scissors], ["audio", "Áudio", Volume2]] as const).map(([k, n, I]) => (
              <button key={k} role="tab" aria-selected={aba === k} className={aba === k ? "on" : ""} onClick={() => setAba(k)}><I width={16} height={16} />{n}</button>
            ))}
          </div>

          {aba === "texto" && (
            <div className="k-fields">
              <label className="k-field">
                <span>Gancho no topo <small className="num">{gancho.length}/32</small></span>
                <input value={gancho} maxLength={32} onChange={(e) => setGancho(e.target.value.toUpperCase())} />
                <small className="k-muted">Aparece nos 3 primeiros segundos. Frase curta que faz a pessoa parar de rolar.</small>
              </label>
              <label className="k-field">
                <span>Legenda <small>a gente transcreveu, corrija o que errou</small></span>
                <textarea rows={4} value={legenda} onChange={(e) => setLegenda(e.target.value)} />
              </label>
              <button type="button" className="k-link" onClick={() => { setGancho(c.gancho); setLegenda(c.legenda); }}><Undo width={14} height={14} /> Voltar ao texto original</button>
            </div>
          )}

          {aba === "estilo" && (
            <div className="k-fields">
              <div className="k-field">
                <span>Estilo da legenda</span>
                <div className="k-styles">
                  {estilosLegenda.map((e) => (
                    <button key={e.id} type="button" className={`k-style${estilo === e.id ? " on" : ""}`} onClick={() => setEstilo(e.id)} aria-pressed={estilo === e.id}>
                      <span className={`k-style-demo cap-${e.id}`} style={{ ["--hl" as string]: cor }}><span>QUE </span><span className="on">LANCE</span></span>
                      <b>{e.nome}</b><small>{e.desc}</small>
                    </button>
                  ))}
                </div>
              </div>
              <div className="k-field">
                <span>Cor da palavra falada</span>
                <div className="k-swatches">
                  {cores.map((x) => (
                    <button key={x} type="button" className={`k-swatch${cor === x ? " on" : ""}`} style={{ background: x }} onClick={() => setCor(x)} aria-label={`Cor ${x}`} aria-pressed={cor === x} />
                  ))}
                </div>
              </div>
              <div className="k-field">
                <span>Posição</span>
                <div className="k-seg">
                  {(["cima", "meio", "baixo"] as const).map((p) => (
                    <button key={p} type="button" className={pos === p ? "on" : ""} onClick={() => setPos(p)}>{p === "cima" ? "Em cima" : p === "meio" ? "No meio" : "Embaixo"}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {aba === "audio" && (
            <div className="k-fields">
              <Interruptor on={musica} set={setMusica} t="Música de fundo" d="Abaixa sozinha quando alguém fala." />
              {musica && (
                <label className="k-field">
                  <span>Volume da música <small className="num">{vol}%</small></span>
                  <input type="range" min={0} max={100} value={vol} onChange={(e) => setVol(+e.target.value)} className="k-range" style={{ ["--p" as string]: `${vol}%` }} />
                </label>
              )}
              <Interruptor on={silencio} set={setSilencio} t="Cortar silêncio" d="Tira as pausas maiores que meio segundo." />
              <Interruptor on={zoom} set={setZoom} t="Zoom no rosto" d="Aproxima devagar quando a fala fica intensa." />
            </div>
          )}

          <div className="k-trim">
            <div className="k-trim-head">
              <span className="k-label"><span className="tc num">{s(ini)}</span> Início</span>
              <b className="num">{s(dur)}</b>
              <span className="k-label"><span className="tc num">{s(fim)}</span> Fim</span>
            </div>
            <div className="k-trim-track" style={{ ["--a" as string]: `${(ini / total) * 100}%`, ["--b" as string]: `${(fim / total) * 100}%`, ["--h" as string]: `${((ini + t) / total) * 100}%` }}>
              <span className="k-trim-wave" aria-hidden="true" />
              <span className="k-trim-sel" aria-hidden="true" />
              <span className="k-trim-head-line" aria-hidden="true" />
              <input type="range" min={0} max={total} value={ini} aria-label="Início do corte" onChange={(e) => { const n = Math.min(+e.target.value, fim - 5); setIni(n); setT(0); }} />
              <input type="range" min={0} max={total} value={fim} aria-label="Fim do corte" onChange={(e) => { const n = Math.max(+e.target.value, ini + 5); setFim(n); setT(0); }} />
            </div>
            <p className="k-muted sm">{dur > 60 ? "Passou de 60 segundos: o Shorts aceita, mas corte curto prende mais." : "Entre 20 e 45 segundos costuma prender mais."}</p>
          </div>

          <div className="k-panel-foot">
            <Botao v="line" onClick={salvar}>Salvar</Botao>
            <Botao v="yellow" icon={<Download width={16} height={16} />} onClick={baixar}>{salvo === "baixando" ? "Gerando MP4…" : "Baixar MP4"}</Botao>
          </div>
          {salvo === "salvo" && <p className="k-saved" role="status"><Check width={16} height={16} /> Salvo.</p>}
          {salvo === "erro" && <p className="k-saved bad" role="status">O MP4 desse corte ainda está sendo gerado. Tenta de novo em um minuto.</p>}
        </div>
      </div>
    </div>
  );
}

function Interruptor({ on, set, t, d }: { on: boolean; set: (v: boolean) => void; t: string; d: string }) {
  return (
    <button type="button" className="k-switch-row" role="switch" aria-checked={on} onClick={() => set(!on)}>
      <span><b>{t}</b><small className="k-muted">{d}</small></span>
      <span className={`k-switch${on ? " on" : ""}`} aria-hidden="true"><i /></span>
    </button>
  );
}

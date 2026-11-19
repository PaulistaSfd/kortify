"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { Upload } from "../icons";
import { FileVideo, X, Check, Zap } from "./icones";
import { Link as LinkIcon } from "../icons";
import { lerLink, nomeFonte } from "@/lib/fontes";
import { Botao } from "./Botao";
import { useDados } from "./Dados";

// Caixa de envio: arquivo (vai direto para o R2), link de VOD ou captura de live ao vivo.
type Fase = "vazio" | "enviando" | "pronto";

export function Envio() {
  const { modo, atualizar } = useDados();
  const [erro, setErro] = useState("");
  const [novoId, setNovoId] = useState("");
  const xhr = useRef<XMLHttpRequest | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const [fase, setFase] = useState<Fase>("vazio");
  const [arquivo, setArquivo] = useState({ nome: "", mb: 0 });
  const [pct, setPct] = useState(0);
  const [arrastando, setArrastando] = useState(false);
  const [destino, setDestino] = useState<"os dois" | "shorts" | "tiktok">("os dois");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [aba, setAba] = useState<"arquivo" | "link" | "live">("arquivo");
  const [url, setUrl] = useState("");
  const [autorizado, setAutorizado] = useState(false);
  const [enviandoLink, setEnviandoLink] = useState(false);
  const [msgLink, setMsgLink] = useState("");
  const fonte = url ? lerLink(url) : null;
  const linkOk = !!fonte && (aba === "live" ? fonte.tipo === "canal" : fonte.tipo === "vod");

  const mandarLink = async () => {
    setErro("");
    if (!linkOk) { setErro(aba === "live" ? "Cole o link do canal, tipo twitch.tv/seucanal ou kick.com/seucanal." : "Cole o link do vídeo (VOD) da Twitch, da Kick ou do YouTube."); return; }
    if (!autorizado) { setErro("Marque a confirmação de que o vídeo é seu ou que você tem autorização."); return; }
    if (modo === "exemplo") { setNovoId(aba === "live" ? "v-ao-vivo" : "v-rp-cidade"); setMsgLink(fonte!.nome); setFase("pronto"); return; }
    setEnviandoLink(true);
    const r = await fetch("/api/envio/link", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url, destino, aoVivo: aba === "live", autorizado }) })
      .then((x) => x.json()).catch(() => ({ erro: "Sem conexão." }));
    setEnviandoLink(false);
    if (!r.id) { setErro(r.erro || "Não deu para registrar."); return; }
    setNovoId(r.id); setMsgLink(r.nome); setFase("pronto"); atualizar();
  };

  const enviarDeVerdade = async (f: File) => {
    setArquivo({ nome: f.name, mb: Math.max(1, Math.round(f.size / 1048576)) });
    setFase("enviando"); setPct(0); setErro("");
    const r = await fetch("/api/envio", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ nome: f.name, tamanho: f.size, tipo: f.type, destino }) })
      .then((x) => x.json()).catch(() => ({ erro: "Sem conexão." }));
    if (!r.url) { setErro(r.erro || "Não deu para começar o envio."); setFase("vazio"); return; }
    const x = new XMLHttpRequest(); xhr.current = x;
    x.open("PUT", r.url);
    x.setRequestHeader("content-type", f.type || "video/mp4");
    x.upload.onprogress = (e) => e.lengthComputable && setPct((e.loaded / e.total) * 100);
    x.onload = async () => {
      if (x.status >= 300) { setErro("O envio falhou no meio. Tenta de novo."); setFase("vazio"); return; }
      await fetch("/api/envio/concluir", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: r.id }) });
      setNovoId(r.id); setPct(100); setFase("pronto"); atualizar();
    };
    x.onerror = () => { setErro("A conexão caiu durante o envio. Tenta de novo."); setFase("vazio"); };
    x.send(f);
  };
  const escolher = (f: File) => (modo === "real" ? enviarDeVerdade(f) : comecar(f.name, f.size));

  const comecar = (nome: string, bytes: number) => {
    setArquivo({ nome, mb: Math.max(1, Math.round(bytes / 1048576)) });
    setFase("enviando");
    setPct(0);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setPct((p) => {
        const n = Math.min(100, p + 3 + Math.random() * 7);
        if (n >= 100 && timer.current) { clearInterval(timer.current); setTimeout(() => setFase("pronto"), 350); }
        return n;
      });
    }, 120);
  };
  const cancelar = () => { if (timer.current) clearInterval(timer.current); xhr.current?.abort(); setFase("vazio"); setPct(0); };

  return (
    <section id="enviar" className={`k-drop${arrastando ? " over" : ""} is-${fase}`}
      onDragOver={(e) => { e.preventDefault(); setArrastando(true); }}
      onDragLeave={() => setArrastando(false)}
      onDrop={(e) => { e.preventDefault(); setArrastando(false); const f = e.dataTransfer.files[0]; if (f) escolher(f); }}>
      <div className="k-drop-wave" aria-hidden="true" />
      <input ref={input} type="file" accept="video/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) escolher(f); }} />

      {fase === "vazio" && (
        <div className="k-drop-in">
          <div className="k-seg k-src" role="tablist" aria-label="Como mandar a live">
            <button type="button" role="tab" aria-selected={aba === "arquivo"} className={aba === "arquivo" ? "on" : ""} onClick={() => { setAba("arquivo"); setErro(""); }}><Upload width={16} height={16} /> Arquivo</button>
            <button type="button" role="tab" aria-selected={aba === "link"} className={aba === "link" ? "on" : ""} onClick={() => { setAba("link"); setErro(""); }}><LinkIcon width={16} height={16} /> Link do VOD</button>
            <button type="button" role="tab" aria-selected={aba === "live"} className={aba === "live" ? "on" : ""} onClick={() => { setAba("live"); setErro(""); }}><i className="k-dot-rec" /> Ao vivo</button>
          </div>

          {aba === "arquivo" && (<>
            <h2 className="k-h2">Solta a live aqui</h2>
            <p className="k-muted">MP4, MOV ou MKV, até 6 horas. Arrasta o arquivo para cá ou escolhe no computador.</p>
          </>)}
          {aba === "link" && (<>
            <h2 className="k-h2">Cola o link do VOD</h2>
            <p className="k-muted">Twitch, Kick ou YouTube. O Kortify baixa a live sozinho, você não precisa baixar nada.</p>
          </>)}
          {aba === "live" && (<>
            <h2 className="k-h2">Corta enquanto você joga</h2>
            <p className="k-muted">Cola o link do seu canal. Quando a live começar, o Kortify grava em blocos de 10 minutos e vai soltando os cortes durante a live. Para sozinho quando ela acaba.</p>
          </>)}

          {aba !== "arquivo" && (
            <div className="k-url">
              <label className={`k-url-in${url && !linkOk ? " bad" : ""}`}>
                <LinkIcon width={18} height={18} />
                <input type="url" inputMode="url" placeholder={aba === "live" ? "twitch.tv/seucanal ou kick.com/seucanal" : "twitch.tv/videos/123… ou kick.com/…/videos/…"} value={url} onChange={(e) => { setUrl(e.target.value); setErro(""); }} />
                {fonte && <span className={`k-src-tag s-${fonte.fonte}`}>{nomeFonte[fonte.fonte]} · {fonte.tipo === "canal" ? "canal" : "VOD"}</span>}
              </label>
              <label className="k-check">
                <input type="checkbox" checked={autorizado} onChange={(e) => setAutorizado(e.target.checked)} />
                <span>O canal é meu, ou tenho autorização do dono para cortar esse conteúdo.</span>
              </label>
            </div>
          )}

          <div className="k-seg" role="radiogroup" aria-label="Para onde vão os cortes">
            {(["os dois", "shorts", "tiktok"] as const).map((d) => (
              <button key={d} type="button" role="radio" aria-checked={destino === d} className={destino === d ? "on" : ""} onClick={() => setDestino(d)}>
                {d === "os dois" ? "Shorts e TikTok" : d === "shorts" ? "Só Shorts" : "Só TikTok"}
              </button>
            ))}
          </div>

          {aba === "arquivo" ? (
            <Botao v="yellow" size="" onClick={() => input.current?.click()}>Escolher arquivo</Botao>
          ) : (
            <Botao v="yellow" size="" icon={aba === "live" ? <Zap width={16} height={16} /> : undefined} onClick={mandarLink} disabled={enviandoLink}>{enviandoLink ? "Mandando…" : aba === "live" ? "Ativar captura ao vivo" : "Cortar esse VOD"}</Botao>
          )}
          {aba === "arquivo" && modo === "exemplo" && <button type="button" className="k-link" onClick={() => comecar("live-de-teste.mp4", 2.4e9)}>Testar com uma live de exemplo</button>}
          {erro && <p className="k-saved bad" role="alert">{erro}</p>}
        </div>
      )}

      {fase === "pronto" && msgLink && (
        <div className="k-drop-done">
          <p>{aba === "live" ? <>Captura ativada para <b>{msgLink}</b>. Quando a live começar, os cortes vão aparecendo no painel, e a gente te avisa por e-mail.</> : <>Recebido: <b>{msgLink}</b>. O Kortify baixa a live, ouve tudo e separa os melhores momentos. A gente te avisa por e-mail quando terminar.</>}</p>
          <div className="k-row">
            <Botao href={`/painel/videos/${novoId}`} v="ink">Acompanhar</Botao>
            <button type="button" className="k-link" onClick={() => { setFase("vazio"); setMsgLink(""); setUrl(""); }}>Mandar outra</button>
          </div>
        </div>
      )}

      {fase !== "vazio" && !msgLink && (
        <div className="k-drop-file">
          <span className="k-file-icon"><FileVideo width={22} height={22} /></span>
          <div className="k-file-t">
            <b>{arquivo.nome}</b>
            <span className="k-muted num">{fase === "pronto" ? `${arquivo.mb} MB enviados` : `${Math.round((arquivo.mb * pct) / 100)} de ${arquivo.mb} MB`}</span>
            <span className="k-bar lg"><i style={{ width: `${pct}%` }} /></span>
          </div>
          {fase === "enviando" ? (
            <button type="button" className="k-icon-btn" onClick={cancelar} aria-label="Cancelar envio"><X width={18} height={18} /></button>
          ) : (
            <span className="k-ok"><Check width={18} height={18} /></span>
          )}
        </div>
      )}
      {fase === "pronto" && !msgLink && (
        <div className="k-drop-done">
          <p>Recebido. Agora o Kortify ouve a live inteira e separa os melhores momentos para {destino === "os dois" ? "Shorts e TikTok" : destino === "shorts" ? "Shorts" : "TikTok"}. A gente te avisa por e-mail quando terminar.</p>
          <div className="k-row">
            <Botao href={`/painel/videos/${novoId || "v-rp-cidade"}`} v="ink">Acompanhar</Botao>
            <button type="button" className="k-link" onClick={cancelar}>Mandar outra</button>
          </div>
        </div>
      )}
    </section>
  );
}

export function LinkCorte({ id, children }: { id: string; children: React.ReactNode }) {
  return <Link href={`/painel/cortes/${id}`} className="k-clip-link">{children}</Link>;
}

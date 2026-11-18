"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { Upload } from "../icons";
import { FileVideo, X, Check } from "./icones";
import { Botao } from "./Botao";
import { useDados } from "./Dados";

// Caixa de envio da live. Hoje simula o upload; depois manda direto para o R2.
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
          <span className="k-drop-icon"><Upload width={26} height={26} /></span>
          <h2 className="k-h2">Solta a live aqui</h2>
          <p className="k-muted">MP4, MOV ou MKV, até 6 horas. Baixe o VOD no painel da Twitch ou do YouTube e arraste para cá.</p>
          <div className="k-seg" role="radiogroup" aria-label="Para onde vão os cortes">
            {(["os dois", "shorts", "tiktok"] as const).map((d) => (
              <button key={d} type="button" role="radio" aria-checked={destino === d} className={destino === d ? "on" : ""} onClick={() => setDestino(d)}>
                {d === "os dois" ? "Shorts e TikTok" : d === "shorts" ? "Só Shorts" : "Só TikTok"}
              </button>
            ))}
          </div>
          <Botao v="yellow" size="" onClick={() => input.current?.click()}>Escolher arquivo</Botao>
          {modo === "exemplo" && <button type="button" className="k-link" onClick={() => comecar("live-de-teste.mp4", 2.4e9)}>Testar com uma live de exemplo</button>}
          {erro && <p className="k-saved bad" role="alert">{erro}</p>}
        </div>
      )}

      {fase !== "vazio" && (
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
      {fase === "pronto" && (
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

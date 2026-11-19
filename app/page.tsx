import { Sun, Moon, Captions, ScanFace, Volume2, ClockArrowDown, Scissors, Check, Download, Link, Upload } from "@/components/icons";
import Interactions from "@/components/Interactions";
import { Contador } from "@/components/Contador";

type Cena = "voadora" | "assalto" | "fuga" | "mecanico";

const momentos: { id: Cena; titulo: string; tempo: string; nota: number; motivos: string[]; legenda: string; gancho: string; dur: string }[] = [
  { id: "voadora", titulo: "Voadora no meio da abordagem", tempo: "02:27:40", nota: 94, motivos: ["grito", "movimento", "“voadora”"], legenda: "DEU UMA VOADORA NELE", gancho: "ELE NÃO ESPERAVA ISSO", dur: "0:38" },
  { id: "assalto", titulo: "Assalto na joalheria dá errado", tempo: "01:38:05", nota: 88, motivos: ["“assalto”", "risada"], legenda: "O ASSALTO DEU ERRADO", gancho: "O PLANO ERA PERFEITO", dur: "0:52" },
  { id: "fuga", titulo: "Fuga pela contramão", tempo: "03:24:18", nota: 81, motivos: ["movimento", "grito"], legenda: "FUGIU PELA CONTRAMÃO MANO", gancho: "A POLÍCIA FICOU PRA TRÁS", dur: "0:44" },
  { id: "mecanico", titulo: "Resenha com o mecânico", tempo: "00:41:12", nota: 72, motivos: ["risada"], legenda: "O MECÂNICO NÃO AGUENTOU", gancho: "ELE PEDIU DESCONTO", dur: "0:29" },
];

const passos = [
  { n: "01", t: "Envie a live", d: "Arraste o arquivo ou cole o link do VOD da Twitch ou da Kick.", c: "ARRASTA E SOLTA", h: "4 HORAS DE LIVE" },
  { n: "02", t: "Ele ouve tudo", d: "Mede grito, risada e movimento na tela, e procura falas como “voadora” e “assalto”.", c: "ACHOU UMA VOADORA", h: "NOTA 94 DE 100" },
  { n: "03", t: "Você escolhe", d: "Chegam de 5 a 8 sugestões, cada uma com nota e motivo. Fique só com as boas.", c: "ESSE AQUI VAI", h: "MARCADO PARA BAIXAR" },
  { n: "04", t: "Baixe e poste", d: "Cada corte sai em 1080×1920, com legenda, gancho e música.", c: "PRONTO PRO TIKTOK", h: "1080×1920" },
];

const perguntas = [
  { p: "Posso colar link do YouTube?", r: "Por enquanto, não. O YouTube não deixa ferramentas de fora baixarem os vídeos, então pedimos o arquivo. Se a live é sua, baixe pelo YouTube Studio e envie aqui." },
  { p: "Funciona com live de RP?", r: "Foi feito pensando nisso. A busca dá mais peso para ação, briga e fala forte, que é o que mais rende em corte de RP." },
  { p: "Quanto tempo demora?", r: "Depende do tamanho da live. Você não precisa ficar com a tela aberta: mandamos um e-mail quando os cortes ficam prontos." },
  { p: "Posso cancelar quando quiser?", r: "Pode, pelo próprio painel e sem multa. O plano continua valendo até o fim do mês que você já pagou." },
  { p: "E os direitos do vídeo?", r: "Você só pode enviar conteúdo seu ou que tem autorização para usar. Os vídeos enviados são apagados depois de 7 dias." },
];


const cenas: Cena[] = ["voadora", "assalto", "fuga", "mecanico"];
const hits: Record<number, { n: number; cena: Cena; hook: string; cap: string }> = {
  4: { n: 72, cena: "mecanico", hook: "ELE PEDIU DESCONTO", cap: "O MECÂNICO NÃO AGUENTOU" },
  10: { n: 88, cena: "assalto", hook: "O PLANO ERA PERFEITO", cap: "O ASSALTO DEU ERRADO" },
  15: { n: 94, cena: "voadora", hook: "ELE NÃO ESPERAVA ISSO", cap: "DEU UMA VOADORA NELE" },
  21: { n: 81, cena: "fuga", hook: "A POLÍCIA FICOU PRA TRÁS", cap: "FUGIU PELA CONTRAMÃO MANO" },
};
const reel = Array.from({ length: 26 }, (_, i) => {
  const seg = Math.round((i * 14530) / 25);
  const tc = [Math.floor(seg / 3600), Math.floor((seg % 3600) / 60), seg % 60].map((x) => String(x).padStart(2, "0")).join(":");
  const h = hits[i];
  return { tc, cena: h ? h.cena : cenas[i % 4], hit: h ? h.n : 0, hook: h?.hook, cap: h?.cap };
});

const karaoke =
  "Você faz a live. O Kortify acha a jogada absurda e a risada que ninguém segurou, corta na vertical, coloca a legenda e entrega pronto para postar. Você só escolhe quais vão para o ar.";

const marquee = ["VOADORA", "ASSALTO", "FUGA NA CONTRAMÃO", "RESENHA", "GRITO", "RISADA", "PERSEGUIÇÃO", "FALA FORTE"];

function Legenda({ texto }: { texto: string }) {
  return (
    <p className="caption">
      {texto.split(" ").map((w, i) => (
        <span key={i} className="w" style={{ ["--i" as string]: i }}>{w}</span>
      ))}
    </p>
  );
}

function Telefone({ cena, gancho, legenda, className = "" }: { cena: Cena; gancho: string; legenda: string; className?: string }) {
  return (
    <div className={`phone ${className}`}>
      <div className="phone-screen">
        <div className={`scene scene-${cena}`} />
        <p className="hook">{gancho}</p>
        <Legenda texto={legenda} />
        <div className="progress"><span /></div>
      </div>
    </div>
  );
}

function Marca() {
  return (
    <svg className="logo-mark" viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <clipPath id="lg-b"><path d="M0 32V24.4L32 11.6V32Z" /></clipPath>
        <clipPath id="lg-t"><path d="M0 0H32V8.4L0 21.2Z" /></clipPath>
      </defs>
      <g clipPath="url(#lg-b)"><rect x="8" y="2.5" width="16" height="27" rx="4.5" className="lm-b" /></g>
      <g clipPath="url(#lg-t)" transform="translate(1.6 -1.2)"><rect x="8" y="2.5" width="16" height="27" rx="4.5" className="lm-t" /></g>
      <path d="M14.2 20.6 19.6 23.6 14.2 26.6Z" className="lm-p" />
    </svg>
  );
}

function Btn({ href, children, v = "yellow", size = "", rec = false }: { href: string; children: string; v?: string; size?: string; rec?: boolean }) {
  return (
    <a href={href} className={`btn btn-${v} ${size}`} data-magnetic>
      <span className="btn-handle l" aria-hidden="true" />
      {rec && <i className="rec" aria-hidden="true" />}
      <span className="btn-roll" data-text={children}><span>{children}</span></span>
      <span className="btn-handle r" aria-hidden="true" />
    </a>
  );
}

function Rotulo({ n, t }: { n: string; t: string }) {
  return <p className="label"><span className="tc num">{n}</span> {t}</p>;
}

export default function Home() {
  return (
    <>
      <Interactions />
      <Contador />
      <div className="cursor" data-cursor aria-hidden="true"><span className="cursor-label" /></div>

      <header className="top">
        <div className="wrap top-inner">
          <a href="#" className="logo" aria-label="Kortify, início"><Marca /><span className="logo-word">kortify</span></a>
          <nav className="nav">
            <a href="#como">Como funciona</a>
            <a href="#demo">Demo</a>
            <a href="#precos">Preços</a>
            <a href="#duvidas">Dúvidas</a>
          </nav>
          <button type="button" className="mode" data-mode-toggle aria-label="Alternar modo claro e escuro">
            <Sun className="mode-sun" width={18} height={18} />
            <Moon className="mode-moon" width={18} height={18} />
          </button>
          <Btn href="/entrar" v="yellow" size="btn-sm">Testar grátis</Btn>
        </div>
      </header>

      <main>
        <section className="hero" data-hero>
          <div className="wrap">
            <div className="hero-meta">
              <span>Cortes de live para Shorts e TikTok</span>
              <span>RP, games e podcast</span>
              <span>Feito no Brasil</span>
            </div>
            <h1 className="mega">
              <span className="line">Live longa,</span>
              <span className="line line-2"><em>corte curto.</em></span>
            </h1>
            <div className="hero-grid">
              <div className="hero-copy">
                <p className="lead">
                  Mande a live e o Kortify ouve as horas inteiras, acha os momentos que prendem quem rola o feed e
                  entrega cada um na vertical, com legenda palavra por palavra.
                </p>
                <div className="cta-row">
                  <Btn href="/entrar" v="yellow" size="btn-lg" rec>Testar com 1 hora grátis</Btn>
                  <Btn href="#demo" v="line" size="btn-lg">Ver a demo</Btn>
                </div>
                <p className="fine">O teste não pede cartão.</p>
              </div>
              <div className="stage-wrap" aria-hidden="true">
                <div className="stage" data-stage>
                  <Telefone cena="assalto" gancho="O PLANO ERA PERFEITO" legenda="O ASSALTO DEU ERRADO" className="p-left" />
                  <Telefone cena="fuga" gancho="A POLÍCIA FICOU PRA TRÁS" legenda="FUGIU PELA CONTRAMÃO MANO" className="p-right" />
                  <Telefone cena="voadora" gancho="ELE NÃO ESPERAVA ISSO" legenda="DEU UMA VOADORA NELE" className="p-main" />
                  <span className="score-chip"><b className="num">94</b> voadora · 02:27:40</span>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-strip" aria-hidden="true">
            <div className="wrap strip-inner">
              <span className="strip-file">live_sexta_rp.mp4</span>
              <div className="wave">
                <span className="playhead" />
                {[{ l: 14, n: 72 }, { l: 37, n: 88 }, { l: 58, n: 94 }, { l: 81, n: 81 }].map((m) => (
                  <span key={m.l} className="hit" style={{ left: `${m.l}%` }}><em className="num">{m.n}</em></span>
                ))}
              </div>
              <span className="num strip-time">4:02:11</span>
            </div>
          </div>
        </section>

        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[0, 1].map((k) => (
              <span key={k} className="marquee-group">
                {marquee.map((w) => <span key={w}>{w}<i>✦</i></span>)}
              </span>
            ))}
          </div>
        </div>


        <section className="story" data-story>
          <div className="story-sticky">
            <div className="wrap story-head">
              <div>
                <Rotulo n="00:00:00" t="Role para cortar" />
                <h2 className="big">A live passa.<br />Os cortes ficam.</h2>
              </div>
              <p className="story-count"><b className="num" data-story-count>0</b><span>/4 cortes<br />encontrados</span></p>
            </div>
            <div className="story-stage">
              <div className="reel-window">
                <div className="reel" data-reel>
                  {reel.map((f, i) => (
                    <div key={i} className={`frame scene-${f.cena}${f.hit ? " frame-hit" : ""}`}
                      data-hit={f.hit ? "1" : undefined} data-hook={f.hook} data-caption={f.cap} data-cena={f.cena}>
                      <span className="frame-tc num">{f.tc}</span>
                      {f.hit && <span className="frame-score num">{f.hit}</span>}
                    </div>
                  ))}
                </div>
                <span className="reel-playhead" aria-hidden="true"><i /></span>
              </div>
              <div className="story-phone">
                <Telefone cena="mecanico" gancho="ELE PEDIU DESCONTO" legenda="O MECÂNICO NÃO AGUENTOU" className="phone-story" />
              </div>
            </div>
            <div className="wrap"><div className="story-progress"><span data-story-bar /></div></div>
          </div>
        </section>

        <section className="karaoke" data-karaoke>
          <div className="wrap">
            <p className="karaoke-text">
              {karaoke.split(" ").map((w, i) => <span key={i} className="kw">{w} </span>)}
            </p>
          </div>
        </section>

        <section id="como" className="section">
          <div className="wrap">
            <div className="sec-head" data-reveal>
              <Rotulo n="00:00:41" t="Como funciona" />
              <h2 className="big">Da live ao corte<br />sem abrir editor</h2>
            </div>
            <ol className="index">
              {passos.map((p) => (
                <li key={p.n} className="index-row" data-row data-caption={p.c} data-hook={p.h} data-reveal>
                  <span className="index-n num">{p.n}</span>
                  <h3 className="index-t">{p.t}</h3>
                  <p className="index-d">{p.d}</p>
                  <span className="index-arrow" aria-hidden="true">↗</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="cursor-card" data-cursor-card aria-hidden="true">
            <div className="phone phone-mini">
              <div className="phone-screen">
                <div className="scene scene-voadora" />
                <p className="hook">4 HORAS DE LIVE</p>
                <p className="caption"><span className="w" style={{ ["--i" as string]: 0 }}>ARRASTA</span><span className="w" style={{ ["--i" as string]: 1 }}>E</span><span className="w" style={{ ["--i" as string]: 2 }}>SOLTA</span><span className="w" style={{ ["--i" as string]: 3 }} /></p>
              </div>
            </div>
          </div>
        </section>

        <section id="demo" className="section section-green">
          <div className="wrap">
            <div className="sec-head split" data-reveal>
              <div>
                <Rotulo n="01:38:05" t="Demo" />
                <h2 className="big">É isso que chega<br />depois da live</h2>
              </div>
              <p className="lead small">Clique num momento para ver o corte e use o visto para marcar os que quer baixar. Os dados são de uma live de RP de exemplo.</p>
            </div>

            <div className="app" data-demo data-reveal>
              <div className="app-bar">
                <span className="dots"><i /><i /><i /></span>
                <span className="app-file">live_sexta_rp.mp4</span>
                <span className="app-status"><span className="pulse" />Análise pronta · 4:02:11 de live</span>
              </div>
              <div className="app-body">
                <div className="moments">
                  <p className="moments-head"><span>{momentos.length} momentos encontrados</span><span className="num" data-count>2 marcados</span></p>
                  <ul>
                    {momentos.map((m, i) => (
                      <li key={m.id}>
                        <button type="button" className={`moment${i === 0 ? " is-active" : ""}`} aria-pressed={i === 0}
                          data-id={m.id} data-hook={m.gancho} data-caption={m.legenda} data-dur={m.dur}>
                          <span className="moment-top">
                            <span className="moment-time num">{m.tempo}</span>
                            <span className="score num">{m.nota}</span>
                          </span>
                          <span className="moment-title">{m.titulo}</span>
                          <span className="bar"><span style={{ width: `${m.nota}%` }} /></span>
                          <span className="tags">{m.motivos.map((t) => <span key={t} className="tag">{t}</span>)}</span>
                        </button>
                        <button type="button" className={`pick${i < 2 ? " is-on" : ""}`} aria-pressed={i < 2} aria-label={`Marcar ${m.titulo}`}>
                          <Check width={16} height={16} strokeWidth={2} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="preview">
                  <Telefone cena="voadora" gancho={momentos[0].gancho} legenda={momentos[0].legenda} className="phone-demo" />
                  <div className="preview-meta">
                    <span className="num" data-meta>1080×1920 · 0:38</span>
                    <button type="button" className="btn btn-yellow btn-sm"><Download width={16} height={16} strokeWidth={2} />Baixar corte</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="recursos" className="section">
          <div className="wrap">
            <div className="sec-head" data-reveal>
              <Rotulo n="02:27:40" t="Em cada corte" />
              <h2 className="big">O acabamento do CapCut,<br />feito sozinho</h2>
            </div>
            <div className="bento">
              <article className="tile tile-wide" data-reveal>
                <div className="tile-art art-caption" aria-hidden="true"><Legenda texto="ISSO AQUI PRENDE MUITO" /></div>
                <div className="tile-text">
                  <Captions className="tile-icon" />
                  <h3>Legenda palavra por palavra</h3>
                  <p>A palavra falada acende na hora, no estilo que segura quem assiste sem som.</p>
                </div>
              </article>
              <article className="tile" data-reveal>
                <div className="tile-art art-zoom" aria-hidden="true"><div className="wide-frame"><span className="crop" /><span className="face" /></div></div>
                <div className="tile-text">
                  <ScanFace className="tile-icon" />
                  <h3>Zoom no rosto</h3>
                  <p>A live é horizontal, o corte é vertical. O enquadramento acompanha quem fala.</p>
                </div>
              </article>
              <article className="tile" data-reveal>
                <div className="tile-art art-silence" aria-hidden="true">
                  <div className="clip-row"><span style={{ flex: 3 }} /><span className="gap" /><span style={{ flex: 2 }} /><span className="gap" /><span style={{ flex: 4 }} /></div>
                </div>
                <div className="tile-text">
                  <ClockArrowDown className="tile-icon" />
                  <h3>Silêncio cortado</h3>
                  <p>As pausas longas somem e o corte fica no ritmo de vídeo curto.</p>
                </div>
              </article>
              <article className="tile" data-reveal>
                <div className="tile-art art-duck" aria-hidden="true">
                  <svg viewBox="0 0 240 80" preserveAspectRatio="none">
                    <path className="duck-voice" d="M0 60 H60 L66 30 L72 56 L78 22 L84 52 L90 28 L96 58 L102 34 L108 60 H240" />
                    <path className="duck-music" d="M0 40 H50 C58 40 58 64 66 64 H110 C118 64 118 40 126 40 H240" />
                  </svg>
                  <span className="duck-key"><i className="k-voice" />voz <i className="k-music" />música</span>
                </div>
                <div className="tile-text">
                  <Volume2 className="tile-icon" />
                  <h3>Música que abaixa sozinha</h3>
                  <p>A trilha diminui quando alguém fala. Só usamos músicas livres de direitos.</p>
                </div>
              </article>
              <article className="tile" data-reveal>
                <div className="tile-art art-hook" aria-hidden="true"><div className="mini-phone"><span className="mini-hook">O PLANO ERA PERFEITO</span></div></div>
                <div className="tile-text">
                  <Scissors className="tile-icon" />
                  <h3>Gancho no começo</h3>
                  <p>Uma frase curta no topo dos primeiros segundos diz por que vale ver até o fim.</p>
                </div>
              </article>
            </div>
            <div className="flow" data-reveal>
              <span className="flow-label">Recebe</span>
              <span className="flow-item"><Upload width={16} height={16} />Arquivo MP4</span>
              <span className="flow-item"><Link width={16} height={16} />VOD da Twitch</span>
              <span className="flow-item"><Link width={16} height={16} />VOD da Kick</span>
              <span className="flow-label flow-to">Entrega para</span>
              <span className="flow-item flow-out">YouTube Shorts</span>
              <span className="flow-item flow-out">TikTok</span>
            </div>
          </div>
        </section>

        <section id="precos" className="section section-paper2">
          <div className="wrap">
            <div className="sec-head split" data-reveal>
              <div>
                <Rotulo n="03:24:18" t="Preços" />
                <h2 className="big">Pague por mês,<br />saia quando quiser</h2>
              </div>
              <p className="lead small">Todo plano começa com 1 hora de vídeo grátis. Sem cartão para testar.</p>
            </div>
            <div className="price-rows">
              <article className="price-row" data-reveal>
                <div className="pr-name"><h3>Start</h3><p>Algumas lives por semana</p></div>
                <ul className="pr-list"><li>5 horas de vídeo por mês</li><li>Até 40 cortes por mês</li><li>Legenda, zoom e música</li></ul>
                <p className="pr-price"><span>R$</span><b className="num">47</b><span>/mês</span></p>
                <Btn href="/entrar" v="ink">Começar</Btn>
              </article>
              <article className="price-row price-hot" data-reveal>
                <div className="pr-name"><h3>Pro <span className="badge">Recomendado</span></h3><p>Live todo dia</p></div>
                <ul className="pr-list"><li>20 horas de vídeo por mês</li><li>Cortes sem limite</li><li>Sem marca d&apos;água</li></ul>
                <p className="pr-price"><span>R$</span><b className="num">97</b><span>/mês</span></p>
                <Btn href="/entrar" v="yellow">Começar</Btn>
              </article>
              <article className="price-row price-soon" data-reveal>
                <div className="pr-name"><h3>Agendador <span className="badge badge-quiet">Em breve</span></h3><p>Postar sem abrir cada rede</p></div>
                <p className="pr-soon">Agende os cortes direto no TikTok, no YouTube e no Instagram. Vai dar para assinar sozinho ou no combo com o Kortify, com desconto.</p>
              </article>
            </div>
          </div>
        </section>

        <section id="duvidas" className="section">
          <div className="wrap faq-wrap">
            <div className="sec-head" data-reveal>
              <Rotulo n="04:02:11" t="Dúvidas" />
              <h2 className="big">Antes<br />de testar</h2>
            </div>
            <div className="faq" data-reveal>
              {perguntas.map((q) => (
                <details key={q.p}><summary>{q.p}</summary><p>{q.r}</p></details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="end">
        <div className="wrap">
          <div className="end-top">
            <h2 className="end-title">Manda a próxima<br /><em>live.</em></h2>
            <div className="end-cta">
              <p>1 hora de vídeo grátis, sem cartão.</p>
              <Btn href="/entrar" v="yellow" size="btn-lg">Testar agora</Btn>
            </div>
          </div>
          <div className="end-links">
            <span className="end-brand"><Marca />© 2026 Kortify</span>
            <nav><a href="#">Termos de uso</a><a href="#">Privacidade</a><a href="#">Contato</a></nav>
          </div>
        </div>
        <p className="wordmark" aria-hidden="true">KORTIFY</p>
      </footer>
    </>
  );
}

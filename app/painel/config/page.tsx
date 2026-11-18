"use client";
import { useEffect, useState } from "react";
import { estilosLegenda } from "@/lib/dados";
import { useDados } from "@/components/app/Dados";
import { Botao } from "@/components/app/Botao";
import { Check, Lock } from "@/components/app/icones";

export default function Config() {
  const { usuario, perfil, salvarPerfil } = useDados();
  const [nome, setNome] = useState(usuario.nome);
  const [estilo, setEstilo] = useState("pop");
  const [destino, setDestino] = useState("os dois");
  const [avisos, setAvisos] = useState({ pronto: true, dicas: false, fatura: true });
  const [palavras, setPalavras] = useState("que isso, não acredito, olha isso, clipa");
  const [salvo, setSalvo] = useState(false);
  useEffect(() => {
    if (perfil.nome) setNome(perfil.nome);
    if (perfil.estilo_legenda) setEstilo(perfil.estilo_legenda);
    if (perfil.destino) setDestino(perfil.destino);
    if (perfil.palavras) setPalavras(perfil.palavras);
    if (perfil.avisos) setAvisos((a) => ({ ...a, ...perfil.avisos }));
  }, [perfil]);

  return (
    <div className="k-page">
      <header className="k-head">
        <p className="k-label"><span className="tc num">03:24:18</span> Configurações</p>
        <h1 className="k-h1">Do seu <em>jeito.</em></h1>
      </header>

      <form className="k-settings" onSubmit={async (e) => { e.preventDefault(); await salvarPerfil({ nome, estilo_legenda: estilo, destino, palavras, avisos }); setSalvo(true); setTimeout(() => setSalvo(false), 2000); }}>
        <section className="k-set">
          <div className="k-set-t"><span className="num">01</span><h2 className="k-h3">Perfil</h2></div>
          <div className="k-fields">
            <label className="k-field"><span>Nome</span><input value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" /></label>
            <label className="k-field"><span>E-mail</span><input type="email" value={usuario.email} readOnly autoComplete="email" /></label>
            <button type="button" className="k-link"><Lock width={14} height={14} /> Trocar senha</button>
          </div>
        </section>

        <section className="k-set">
          <div className="k-set-t"><span className="num">02</span><h2 className="k-h3">Padrão dos cortes</h2><p className="k-muted sm">Vale para toda live nova. Dá para mudar em cada corte depois.</p></div>
          <div className="k-fields">
            <div className="k-field">
              <span>Estilo da legenda</span>
              <div className="k-styles">
                {estilosLegenda.map((e) => (
                  <button key={e.id} type="button" className={`k-style${estilo === e.id ? " on" : ""}`} onClick={() => setEstilo(e.id)} aria-pressed={estilo === e.id}>
                    <span className={`k-style-demo cap-${e.id}`}><span>QUE </span><span className="on">LANCE</span></span>
                    <b>{e.nome}</b><small>{e.desc}</small>
                  </button>
                ))}
              </div>
            </div>
            <div className="k-field">
              <span>Para onde vão os cortes</span>
              <div className="k-seg">
                {["os dois", "shorts", "tiktok"].map((d) => (
                  <button key={d} type="button" className={destino === d ? "on" : ""} onClick={() => setDestino(d)}>{d === "os dois" ? "Shorts e TikTok" : d === "shorts" ? "Só Shorts" : "Só TikTok"}</button>
                ))}
              </div>
            </div>
            <label className="k-field">
              <span>Palavras que valem corte</span>
              <input value={palavras} onChange={(e) => setPalavras(e.target.value)} />
              <small className="k-muted">Separe por vírgula. Quando alguém fala uma delas, o trecho ganha mais nota.</small>
            </label>
          </div>
        </section>

        <section className="k-set">
          <div className="k-set-t"><span className="num">03</span><h2 className="k-h3">Avisos por e-mail</h2></div>
          <div className="k-fields">
            {([["pronto", "Quando os cortes ficarem prontos"], ["fatura", "Pix e faturas"], ["dicas", "Dicas para crescer no Shorts e no TikTok"]] as const).map(([k, t]) => (
              <button key={k} type="button" role="switch" aria-checked={avisos[k]} className="k-switch-row" onClick={() => setAvisos((a) => ({ ...a, [k]: !a[k] }))}>
                <span><b>{t}</b></span><span className={`k-switch${avisos[k] ? " on" : ""}`} aria-hidden="true"><i /></span>
              </button>
            ))}
          </div>
        </section>

        <section className="k-set">
          <div className="k-set-t"><span className="num">04</span><h2 className="k-h3">Contas conectadas</h2><p className="k-muted sm">Chega junto com o Agendador.</p></div>
          <div className="k-fields">
            {["TikTok", "YouTube", "Instagram"].map((r) => (
              <div key={r} className="k-conn"><b>{r}</b><span className="k-pill">Em breve</span></div>
            ))}
          </div>
        </section>

        <div className="k-save-bar">
          {salvo && <span className="k-saved" role="status"><Check width={16} height={16} /> Salvo</span>}
          <Botao type="submit">Salvar alterações</Botao>
        </div>

        <section className="k-set danger">
          <div className="k-set-t"><span className="num">05</span><h2 className="k-h3">Apagar conta</h2></div>
          <div className="k-fields">
            <p className="k-muted">Apaga suas lives, cortes e dados de uma vez. Não tem como desfazer.</p>
            <button type="button" className="k-link danger">Quero apagar minha conta</button>
          </div>
        </section>
      </form>
    </div>
  );
}

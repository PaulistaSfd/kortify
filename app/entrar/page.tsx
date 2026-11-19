"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/app/Marca";
import { Modo } from "@/components/app/Modo";
import { Botao } from "@/components/app/Botao";
import { Telefone } from "@/components/app/Telefone";
import { Mail, Check } from "@/components/app/icones";
import "../painel/painel.css";
import { supaLigado } from "@/lib/supabase/config";
import { supaNavegador } from "@/lib/supabase/client";

export default function Entrar() {
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState("");
  const [indo, setIndo] = useState(false);
  const volta = () => `${location.origin}/auth/callback`;
  const google = async () => {
    if (!supaLigado()) return router.push("/painel");
    setErro("");
    const { error } = await supaNavegador().auth.signInWithOAuth({ provider: "google", options: { redirectTo: volta() } });
    if (error) setErro("Não deu para abrir o Google agora. Tenta pelo e-mail.");
  };
  const porEmail = async () => {
    if (!email.includes("@")) return;
    if (!supaLigado()) return setEnviado(true);
    setIndo(true); setErro("");
    const { error } = await supaNavegador().auth.signInWithOtp({ email, options: { emailRedirectTo: volta(), data: nome ? { full_name: nome } : undefined } });
    setIndo(false);
    if (error) setErro(error.message.includes("rate") ? "Muitos pedidos seguidos. Espera um minuto e tenta de novo." : "Não deu para mandar o link. Confere o e-mail.");
    else setEnviado(true);
  };
  const router = useRouter();

  return (
    <div className="k-auth">
      <div className="k-auth-form">
        <div className="k-auth-top"><Logo /><Modo /></div>

        <div className="k-auth-box">
          {!enviado ? (
            <>
              <p className="k-label"><span className="tc num">{modo === "entrar" ? "00:00:00" : "REC ●"}</span> {modo === "entrar" ? "Entrar" : "Criar conta"}</p>
              <h1 className="k-h1">{modo === "entrar" ? <>Bem-vindo<br /><em>de volta.</em></> : <>Primeira hora<br /><em>é grátis.</em></>}</h1>
              <p className="k-muted">{modo === "entrar" ? "Entre para ver seus cortes." : "Sem cartão. Manda uma live e vê os cortes antes de pagar qualquer coisa."}</p>

              <button type="button" className="k-google" onClick={google}>
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.3 12 2.3 6.7 2.3 2.4 6.6 2.4 12s4.3 9.7 9.6 9.7c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z" /></svg>
                Continuar com Google
              </button>
              <div className="k-or"><span>ou com e-mail</span></div>

              <form className="k-fields" onSubmit={(e) => { e.preventDefault(); porEmail(); }}>
                {modo === "criar" && <label className="k-field"><span>Seu nome</span><input autoComplete="name" placeholder="Como te chamam na live" value={nome} onChange={(e) => setNome(e.target.value)} /></label>}
                <label className="k-field"><span>E-mail</span><input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" /></label>
                <Botao type="submit" size="btn-lg" full icon={<Mail width={18} height={18} />}>{indo ? "Mandando…" : modo === "entrar" ? "Receber link de acesso" : "Criar conta grátis"}</Botao>
                {erro && <p className="k-saved bad" role="alert">{erro}</p>}
              </form>
              <p className="k-muted sm">Sem senha: a gente manda um link para o seu e-mail e você entra com um clique.</p>

              <p className="k-switch-auth">
                {modo === "entrar" ? "Ainda não tem conta?" : "Já tem conta?"}{" "}
                <button type="button" className="k-link" onClick={() => setModo(modo === "entrar" ? "criar" : "entrar")}>{modo === "entrar" ? "Criar grátis" : "Entrar"}</button>
              </p>
            </>
          ) : (
            <div className="k-sent">
              <span className="k-ok big"><Check width={28} height={28} /></span>
              <h1 className="k-h1 md">Olha seu e-mail.</h1>
              <p className="k-muted">Mandamos um link para <b>{email}</b>. Ele vale por 15 minutos.</p>
              {!supaLigado() && <Botao href="/painel" v="ink">Abrir o painel (exemplo)</Botao>}
              <button type="button" className="k-link" onClick={() => setEnviado(false)}>Usar outro e-mail</button>
            </div>
          )}
        </div>
        <p className="k-auth-legal k-muted sm">Ao continuar você aceita os <a href="#">Termos</a> e a <a href="#">Privacidade</a>.</p>
      </div>

      <aside className="k-auth-art" aria-hidden="true">
        <p className="k-auth-mega">Live longa,<br /><em>corte curto.</em></p>
        <div className="k-auth-phones">
          <Telefone cor="#6366f1" gancho="ELE NÃO ESPERAVA ISSO" legenda="olha o que ele fez" ativa={1} />
          <Telefone cor="#0ea5e9" gancho="NINGUÉM AGUENTOU" legenda="todo mundo rindo junto" ativa={2} grande />
          <Telefone cor="#f59e0b" gancho="ESPERA ATÉ O FIM" legenda="ele volta de ré" ativa={0} />
        </div>
        <div className="k-auth-strip"><span className="num">01:38:05</span><i /><span className="num">02:27:40</span><i /><span className="num">03:24:18</span></div>
      </aside>
    </div>
  );
}

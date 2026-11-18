"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "./Marca";
import { Modo } from "./Modo";
import { Home, Film, Grid, Card, Settings, LogOut, Plus } from "./icones";
import { CalendarClock } from "../icons";
import { DadosProvider, useDados } from "./Dados";

const menu = [
  { href: "/painel", nome: "Início", icone: Home, curto: "Início" },
  { href: "/painel/videos", nome: "Lives enviadas", icone: Film, curto: "Lives" },
  { href: "/painel/cortes", nome: "Meus cortes", icone: Grid, curto: "Cortes" },
  { href: "/painel/plano", nome: "Plano", icone: Card, curto: "Plano" },
  { href: "/painel/config", nome: "Configurações", icone: Settings, curto: "Ajustes" },
];

export function Shell({ children }: { children: ReactNode }) {
  return <DadosProvider><Moldura>{children}</Moldura></DadosProvider>;
}

function Moldura({ children }: { children: ReactNode }) {
  const { usuario, sair, modo } = useDados();
  const path = usePathname() || "/painel";
  const ativo = (href: string) => (href === "/painel" ? path === "/painel" || path === "/painel/" : path.startsWith(href));
  const pct = Math.min(100, Math.round((usuario.minutosUsados / Math.max(1, usuario.minutosPlano)) * 100));

  return (
    <div className="k-shell">
      <aside className="k-side">
        <Logo href="/painel" />
        <Link href="/painel#enviar" className="k-new"><Plus width={18} height={18} /> Mandar live</Link>
        <nav className="k-nav" aria-label="Menu da conta">
          {menu.map((m, i) => {
            const I = m.icone;
            return (
              <Link key={m.href} href={m.href} className={`k-nav-item${ativo(m.href) ? " on" : ""}`} aria-current={ativo(m.href) ? "page" : undefined}>
                <span className="k-nav-n num">{String(i + 1).padStart(2, "0")}</span>
                <I width={18} height={18} />
                <span>{m.nome}</span>
              </Link>
            );
          })}
          <span className="k-nav-item off" aria-disabled="true">
            <span className="k-nav-n num">06</span>
            <CalendarClock width={18} height={18} />
            <span>Agendador</span>
            <em className="k-soon">em breve</em>
          </span>
        </nav>

        <div className="k-side-foot">
          <Link href="/painel/plano" className="k-mini-usage">
            <span className="k-mini-top"><b>Plano {usuario.plano}</b><span className="num">{pct}%</span></span>
            <span className="k-bar"><i style={{ width: `${pct}%` }} /></span>
            <span className="k-mini-sub">{usuario.minutosPlano - usuario.minutosUsados} min de live sobrando</span>
          </Link>
          <div className="k-user">
            <span className="k-avatar" aria-hidden="true">{iniciais(usuario.nome)}</span>
            <span className="k-user-t"><b>{usuario.nome}</b><small>{usuario.email}</small></span>
            <button type="button" onClick={sair} className="k-icon-btn" aria-label="Sair"><LogOut width={18} height={18} /></button>
          </div>
        </div>
      </aside>

      <div className="k-main">
        <header className="k-top">
          <span className="k-top-logo"><Logo href="/painel" /></span>
          <span className="k-top-tc num" aria-hidden="true">REC ● <Relogio /></span>
          <div className="k-top-actions">
            <Modo />
            <span className="k-avatar sm" aria-hidden="true">{iniciais(usuario.nome)}</span>
          </div>
        </header>
        <main className="k-content">
          {modo === "exemplo" && <p className="k-demo">Modo exemplo: os dados abaixo são de mentira até o banco ser ligado.</p>}
          {children}
        </main>
      </div>

      <nav className="k-tabs" aria-label="Menu">
        {menu.map((m) => {
          const I = m.icone;
          return (
            <Link key={m.href} href={m.href} className={ativo(m.href) ? "on" : ""} aria-current={ativo(m.href) ? "page" : undefined}>
              <I width={20} height={20} /><span>{m.curto}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

const iniciais = (n: string) => n.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "K";

// Timecode que anda, como o contador de uma gravação.
import { useEffect, useState } from "react";
function Relogio() {
  const [s, setS] = useState(0);
  useEffect(() => { const t = setInterval(() => setS((v) => v + 1), 1000); return () => clearInterval(t); }, []);
  const p = (n: number) => String(n).padStart(2, "0");
  return <>{p(Math.floor(s / 3600))}:{p(Math.floor(s / 60) % 60)}:{p(s % 60)}</>;
}

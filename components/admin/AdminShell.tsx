"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, useTransition, type ReactNode } from "react";
import { Logo } from "@/components/app/Marca";
import { Modo } from "@/components/app/Modo";
import { Alert } from "@/components/app/icones";
import { Gauge, Receipt, Repeat, Users, Landmark, Cpu, Refresh, External } from "./icones";
import type { DadosAdmin } from "@/lib/admin/tipos";
import { ha, motorOnline } from "@/lib/admin/calc";

const Ctx = createContext<DadosAdmin | null>(null);
export const useAdmin = () => { const d = useContext(Ctx); if (!d) throw new Error("useAdmin fora do AdminShell"); return d; };

const menu = [
  { href: "/admin", nome: "Visão geral", curto: "Geral", icone: Gauge },
  { href: "/admin/vendas", nome: "Vendas e pedidos", curto: "Vendas", icone: Receipt },
  { href: "/admin/assinaturas", nome: "Assinaturas", curto: "Assin.", icone: Repeat },
  { href: "/admin/clientes", nome: "Clientes", curto: "Clientes", icone: Users },
  { href: "/admin/gateway", nome: "Asaas", curto: "Asaas", icone: Landmark },
  { href: "/admin/motor", nome: "Motor de cortes", curto: "Motor", icone: Cpu },
];

export function AdminShell({ dados, quem, children }: { dados: DadosAdmin; quem: string; children: ReactNode }) {
  const path = usePathname() || "/admin";
  const router = useRouter();
  const [carregando, start] = useTransition();
  const [agora, setAgora] = useState<number | null>(null);
  // As telas usam data e hora do navegador (fuso de quem abre). Renderiza só no navegador para não brigar com o servidor.
  useEffect(() => { setAgora(Date.now()); const t = setInterval(() => setAgora(Date.now()), 30000); return () => clearInterval(t); }, []);
  const ativo = (h: string) => (h === "/admin" ? path === "/admin" || path === "/admin/" : path.startsWith(h));
  const online = dados.motores.some((m) => motorOnline(m.vistoEm));
  const atrasadas = dados.assinaturas.filter((a) => a.status === "atrasada").length;
  const atualizar = () => start(() => router.refresh());

  return (
    <Ctx.Provider value={dados}>
      <div className="k-shell a-shell">
        <aside className="k-side">
          <div className="a-brand"><Logo href="/admin" /><span className="a-tag">admin</span></div>
          <nav className="k-nav" aria-label="Menu do admin">
            {menu.map((m, i) => {
              const I = m.icone;
              const badge = m.href === "/admin/assinaturas" && atrasadas ? atrasadas : null;
              return (
                <Link key={m.href} href={m.href} className={`k-nav-item${ativo(m.href) ? " on" : ""}`} aria-current={ativo(m.href) ? "page" : undefined}>
                  <span className="k-nav-n num">{String(i + 1).padStart(2, "0")}</span>
                  <I width={18} height={18} />
                  <span>{m.nome}</span>
                  {badge ? <em className="a-badge num">{badge}</em> : null}
                  {m.href === "/admin/motor" ? <i className={`a-led${online ? " on" : ""}`} aria-label={online ? "motor ligado" : "motor desligado"} /> : null}
                </Link>
              );
            })}
          </nav>
          <div className="k-side-foot">
            <Link href="/painel" className="a-side-link"><External width={16} height={16} /> Abrir painel do cliente</Link>
            <div className="a-who"><span className="k-label">Logado como</span><b>{quem}</b></div>
          </div>
        </aside>

        <div className="k-main">
          <header className="k-top">
            <span className="k-top-logo"><Logo href="/admin" /></span>
            <span className="k-top-tc num" aria-live="polite">
              {dados.modo === "real" ? "AO VIVO" : "EXEMPLO"} · atualizado há <span suppressHydrationWarning>{agora ? ha(dados.geradoEm, agora) : "0s"}</span>
            </span>
            <div className="k-top-actions">
              <button type="button" className="a-refresh" onClick={atualizar} disabled={carregando} aria-label="Atualizar números">
                <Refresh width={16} height={16} className={carregando ? "spin" : ""} /><span>Atualizar</span>
              </button>
              <Modo />
            </div>
          </header>
          <main className="k-content">
            {dados.modo === "exemplo" && !dados.aviso && <p className="k-demo">Modo exemplo: números de mentira para você ver como fica. Quando o banco e o Asaas estiverem ligados, aparecem os de verdade.</p>}
            {dados.aviso && <p className="k-demo a-warn"><Alert width={16} height={16} /> {dados.aviso}</p>}
            {agora ? children : <div className="k-page a-loading" aria-busy="true"><span className="k-label">Carregando números…</span></div>}
          </main>
        </div>

        <nav className="k-tabs a-tabs" aria-label="Menu">
          {menu.map((m) => { const I = m.icone; return (
            <Link key={m.href} href={m.href} className={ativo(m.href) ? "on" : ""} aria-current={ativo(m.href) ? "page" : undefined}><I width={20} height={20} /><span>{m.curto}</span></Link>
          ); })}
        </nav>
      </div>
    </Ctx.Provider>
  );
}

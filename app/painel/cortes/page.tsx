"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { fmtDur } from "@/lib/dados";
import { useDados } from "@/components/app/Dados";
import { Telefone } from "@/components/app/Telefone";
import { Search, Flame } from "@/components/app/icones";

const filtros = [
  { id: "todos", nome: "Todos" },
  { id: "sugerido", nome: "Para escolher" },
  { id: "aprovado", nome: "Escolhidos" },
  { id: "baixado", nome: "Baixados" },
] as const;

export default function Cortes() {
  const { cortes, videos } = useDados();
  const video = (id: string) => videos.find((v) => v.id === id);
  const [f, setF] = useState<(typeof filtros)[number]["id"]>("todos");
  const [q, setQ] = useState("");
  const [ordem, setOrdem] = useState<"nota" | "recente">("nota");
  const lista = useMemo(() => {
    let l = cortes.filter((c) => (f === "todos" ? true : c.status === f));
    if (q) l = l.filter((c) => (c.titulo + c.legenda + c.gancho).toLowerCase().includes(q.toLowerCase()));
    return [...l].sort((a, b) => (ordem === "nota" ? b.nota - a.nota : a.id < b.id ? 1 : -1));
  }, [f, q, ordem, cortes]);

  return (
    <div className="k-page">
      <header className="k-head">
        <p className="k-label"><span className="tc num">01:38:05</span> Biblioteca</p>
        <h1 className="k-h1">Meus <em>cortes.</em></h1>
      </header>

      <div className="k-filters">
        <div className="k-seg" role="tablist" aria-label="Filtrar cortes">
          {filtros.map((x) => (
            <button key={x.id} role="tab" aria-selected={f === x.id} className={f === x.id ? "on" : ""} onClick={() => setF(x.id)}>
              {x.nome}<span className="num">{x.id === "todos" ? cortes.length : cortes.filter((c) => c.status === x.id).length}</span>
            </button>
          ))}
        </div>
        <label className="k-search">
          <Search width={18} height={18} />
          <input type="search" placeholder="Buscar pela fala ou título" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <select className="k-select" value={ordem} onChange={(e) => setOrdem(e.target.value as "nota" | "recente")} aria-label="Ordenar">
          <option value="nota">Maior nota</option>
          <option value="recente">Mais recentes</option>
        </select>
      </div>

      {lista.length === 0 ? (
        <div className="k-empty">
          <p className="k-h3">Nada por aqui.</p>
          <p className="k-muted">Nenhum corte combina com esse filtro. Tente buscar outra palavra.</p>
        </div>
      ) : (
        <div className="k-gallery">
          {lista.map((c, i) => (
            <Link key={c.id} href={`/painel/cortes/${c.id}`} className="k-clip" style={{ ["--d" as string]: `${i * 50}ms` }}>
              <Telefone cor={c.cor} gancho={c.gancho} legenda={c.legenda} dur={fmtDur(c.dur)} ativa={0} />
              <span className="k-clip-meta">
                <span className="k-clip-top">
                  <span className="k-score num"><Flame width={14} height={14} />{c.nota}</span>
                  <span className={`k-pill p-${c.status}`}>{c.status === "sugerido" ? "Para escolher" : c.status === "aprovado" ? "Escolhido" : c.status === "baixado" ? "Baixado" : "Descartado"}</span>
                </span>
                <b>{c.titulo}</b>
                <span className="k-muted num">{video(c.videoId)?.canal} · {c.inicio}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

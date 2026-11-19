"use client";
import Link from "next/link";
import { useDados } from "@/components/app/Dados";
import { Botao } from "@/components/app/Botao";
import { ChevronRight, Alert, Loader } from "@/components/app/icones";

const rotulo = { pronto: "Pronta", processando: "Cortando", erro: "Deu erro", aguardando: "Esperando a live", ao_vivo: "Ao vivo" };

export default function Lives() {
  const { videos, cortes } = useDados();
  const cortesDo = (id: string) => cortes.filter((c) => c.videoId === id);
  return (
    <div className="k-page">
      <header className="k-head row">
        <div>
          <p className="k-label"><span className="tc num">00:41:00</span> Lives enviadas</p>
          <h1 className="k-h1">Suas <em>lives.</em></h1>
        </div>
        <Botao href="/painel#enviar">Mandar live</Botao>
      </header>

      {videos.length === 0 && <div className="k-empty"><p className="k-h3">Nenhuma live ainda.</p><p className="k-muted">Quando você mandar a primeira, ela aparece aqui.</p></div>}
      <ol className="k-index">
        {videos.map((v, i) => {
          const n = cortesDo(v.id).length;
          return (
            <li key={v.id}>
              <Link href={`/painel/videos/${v.id}`} className={`k-index-row st-${v.status}`}>
                <span className="k-index-n num">{String(i + 1).padStart(2, "0")}</span>
                <span className="k-index-main">
                  <b>{v.titulo}</b>
                  <span className="k-muted num">{v.canal} · {v.duracao} · {v.enviadoEm}</span>
                </span>
                <span className="k-index-tags">
                  {v.plataformas.map((p) => <span key={p} className="k-chip">{p === "shorts" ? "Shorts" : "TikTok"}</span>)}
                </span>
                <span className={`k-status s-${v.status}`}>
                  {v.status === "processando" && <Loader width={14} height={14} className="spin" />}
                  {v.status === "erro" && <Alert width={14} height={14} />}
                  {v.status === "ao_vivo" && <i className="k-dot-rec" />}
                  {rotulo[v.status]}
                </span>
                <span className="k-index-count num">{v.status === "pronto" || v.status === "ao_vivo" ? `${n} cortes` : "–"}</span>
                <ChevronRight width={18} height={18} className="k-index-go" />
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

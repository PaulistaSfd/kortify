"use client";
import { useMemo, useState } from "react";
import { useAdmin } from "@/components/admin/AdminShell";
import { Cabeca, Abas, Kpi, Vazio } from "@/components/admin/ui";
import { num, ha, motorOnline, dataHora } from "@/lib/admin/calc";

const nomeStatus: Record<string, string> = { enviando: "Enviando", na_fila: "Na fila", processando: "Cortando", pronto: "Pronto", erro: "Erro", aguardando: "Esperando a live", ao_vivo: "Ao vivo" };
const nomeOrigem: Record<string, string> = { arquivo: "Arquivo", link: "Link", live: "Ao vivo" };

export default function Motor() {
  const d = useAdmin();
  const [f, setF] = useState<"todos" | "fila" | "erro">("todos");
  const fila = d.jobs.filter((j) => j.status === "na_fila");
  const cortando = d.jobs.filter((j) => j.status === "processando");
  const vivas = d.jobs.filter((j) => j.status === "ao_vivo" || j.status === "aguardando");
  const erros = d.jobs.filter((j) => j.status === "erro");
  const online = d.motores.filter((m) => motorOnline(m.vistoEm));
  const minutosFila = fila.reduce((s, j) => s + j.minutos, 0);

  const lista = useMemo(() => d.jobs.filter((j) => f === "todos" || (f === "fila" ? ["na_fila", "processando", "ao_vivo", "aguardando"].includes(j.status) : j.status === "erro")), [d, f]);

  return (
    <div className="k-page">
      <Cabeca tc="00:06:21" rotulo="Admin · motor" titulo="A fábrica" destaque="de cortes.">
        {online.length ? <>{num(online.length)} {online.length === 1 ? "motor ligado" : "motores ligados"}. </> : <>Nenhum motor ligado agora. </>}
        {fila.length ? <>{num(fila.length)} na fila, uns {num(minutosFila)} minutos de vídeo para cortar.</> : <>Fila vazia.</>}
      </Cabeca>

      <section className="a-kpis four">
        <Kpi nome="Na fila" valor={num(fila.length)} sub={`${num(minutosFila)} min de vídeo`} />
        <Kpi nome="Cortando agora" valor={num(cortando.length)} />
        <Kpi nome="Lives acompanhadas" valor={num(vivas.length)} />
        <Kpi nome="Com erro" valor={num(erros.length)} invertido />
      </section>

      <section className="k-sec">
        <div className="k-sec-head"><h2 className="k-h2">Motores</h2><span className="k-muted sm">PC ou VPS que fazem os cortes</span></div>
        {d.motores.length === 0 ? <Vazio>Nenhum motor se conectou ainda. Quando o programa rodar no seu PC, ele aparece aqui.</Vazio> : (
          <ul className="a-engines">
            {d.motores.map((m) => {
              const on = motorOnline(m.vistoEm);
              const job = m.trabalhando ? d.jobs.find((j) => j.id === m.trabalhando) : null;
              return (
                <li key={m.nome} className={`k-card${on ? " on" : ""}`}>
                  <span className={`a-led big${on ? " on" : ""}`} aria-hidden="true" />
                  <div>
                    <b className="num">{m.nome}</b>
                    <small suppressHydrationWarning>{on ? "Ligado" : "Desligado"} · visto há {ha(m.vistoEm)}{m.versao ? ` · v${m.versao}` : ""}</small>
                    {on && job ? <small>Cortando: {job.titulo}</small> : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="k-sec">
        <Abas valor={f} mudar={setF} abas={[{ v: "todos", nome: "Últimos trabalhos", n: d.jobs.length }, { v: "fila", nome: "Em andamento", n: fila.length + cortando.length + vivas.length }, { v: "erro", nome: "Erros", n: erros.length }]} />
        {lista.length === 0 ? <Vazio>Nada aqui.</Vazio> : (
          <div className="a-table-wrap">
            <table className="a-table">
              <thead><tr><th>Enviado</th><th>Live</th><th>Cliente</th><th>Entrada</th><th className="r">Minutos</th><th>Status</th></tr></thead>
              <tbody>
                {lista.map((j) => (
                  <tr key={j.id}>
                    <td className="num a-dim">{dataHora(j.criadoEm)}</td>
                    <td><b>{j.titulo}</b>{j.erro ? <small className="a-err">{j.erro}</small> : null}</td>
                    <td>{j.cliente}</td>
                    <td>{nomeOrigem[j.origem] || j.origem}<small>{j.fonte !== "arquivo" ? j.fonte : ""}</small></td>
                    <td className="r num">{num(j.minutos)}</td>
                    <td><span className={`a-st sj-${j.status}`}>{nomeStatus[j.status] || j.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

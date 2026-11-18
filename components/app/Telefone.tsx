// Miniatura 9:16 de um corte: fundo com o tom do corte, gancho em cima e legenda embaixo.
export function Telefone({ cor, gancho, legenda, dur, estilo = "pop", grande = false, ativa = -1 }: { cor: string; gancho: string; legenda?: string; dur?: string; estilo?: string; grande?: boolean; ativa?: number }) {
  const palavras = (legenda || "").split(" ").slice(0, grande ? 6 : 4);
  return (
    <div className={`k-phone${grande ? " big" : ""}`} style={{ ["--c" as string]: cor }}>
      <div className="k-phone-scene" aria-hidden="true"><span /><span /></div>
      <p className="k-hook">{gancho}</p>
      {legenda && (
        <p className={`k-cap cap-${estilo}`}>
          {palavras.map((w, i) => <span key={i} className={i === ativa ? "on" : ""}>{w} </span>)}
        </p>
      )}
      {dur && <span className="k-dur num">{dur}</span>}
    </div>
  );
}

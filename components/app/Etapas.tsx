"use client";
import { useEffect, useState } from "react";
import { etapas } from "@/lib/dados";
import { Check } from "./icones";

// Linha do tempo do processamento: cada etapa é um trecho da timeline.
export function Etapas({ inicio = 0, animar = true }: { inicio?: number; animar?: boolean }) {
  const [atual, setAtual] = useState(inicio);
  const [pct, setPct] = useState(35);
  useEffect(() => {
    if (!animar) return;
    const t = setInterval(() => {
      setPct((p) => {
        if (p >= 100) { setAtual((a) => (a < etapas.length - 1 ? a + 1 : a)); return 0; }
        return p + 4;
      });
    }, 220);
    return () => clearInterval(t);
  }, [animar]);

  return (
    <ol className="k-steps">
      {etapas.map((e, i) => {
        const st = i < atual ? "done" : i === atual ? "now" : "wait";
        return (
          <li key={e} className={`k-step ${st}`}>
            <span className="k-step-bar"><i style={{ width: st === "done" ? "100%" : st === "now" ? `${pct}%` : "0%" }} /></span>
            <span className="k-step-t">
              <span className="k-step-n num">{st === "done" ? <Check width={14} height={14} /> : String(i + 1).padStart(2, "0")}</span>
              {e}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

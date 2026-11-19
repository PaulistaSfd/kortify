"use client";
import { useEffect } from "react";

// Avisa o funil do admin que alguém abriu o site (uma vez por aba).
export function Contador() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("k-visita")) return;
      const sessao = crypto.randomUUID();
      sessionStorage.setItem("k-visita", sessao);
      const q = new URLSearchParams(location.search);
      const origem = q.get("utm_source") || (document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : null);
      const corpo = JSON.stringify({ tipo: "visita", sessao, origem, pagina: location.pathname });
      if (!navigator.sendBeacon?.("/api/ev", new Blob([corpo], { type: "application/json" }))) fetch("/api/ev", { method: "POST", body: corpo, keepalive: true });
    } catch {}
  }, []);
  return null;
}

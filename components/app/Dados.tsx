"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import * as ex from "@/lib/dados";
import type { Corte, Video, StatusCorte } from "@/lib/dados";
import { supaLigado } from "@/lib/supabase/config";
import { supaNavegador } from "@/lib/supabase/client";

// Fonte única dos dados do painel. Sem Supabase configurado, usa os dados de exemplo.

type Usuario = typeof ex.usuario;
type Fatura = (typeof ex.faturas)[number];
type Perfil = { nome?: string; estilo_legenda?: string; destino?: string; palavras?: string; avisos?: Record<string, boolean> };

type Ctx = {
  modo: "exemplo" | "real";
  carregando: boolean;
  usuario: Usuario;
  perfil: Perfil;
  videos: Video[];
  cortes: Corte[];
  faturas: Fatura[];
  atualizar: () => Promise<void>;
  marcarCorte: (id: string, s: StatusCorte) => void;
  salvarCorte: (id: string, campos: Record<string, unknown>) => Promise<void>;
  salvarPerfil: (campos: Perfil) => Promise<void>;
  sair: () => Promise<void>;
};

const C = createContext<Ctx | null>(null);
export const useDados = () => { const c = useContext(C); if (!c) throw new Error("DadosProvider faltando"); return c; };

const PRECO: Record<string, number> = { gratis: 0, start: 47, pro: 97, combo: 137 };
const NOME_PLANO: Record<string, string> = { gratis: "Grátis", start: "Start", pro: "Pro", combo: "Pro + Agendador" };
const CORES = ["#6366f1", "#0ea5e9", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6", "#14b8a6"];
const tc = (s: number) => [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map((n) => String(n).padStart(2, "0")).join(":");
const quando = (iso: string) => {
  const d = new Date(iso), hoje = new Date();
  const h = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  if (d.toDateString() === hoje.toDateString()) return `Hoje, ${h}`;
  const ontem = new Date(hoje); ontem.setDate(hoje.getDate() - 1);
  if (d.toDateString() === ontem.toDateString()) return `Ontem, ${h}`;
  return d.toLocaleDateString("pt-BR", { day: "numeric", month: "short" }).replace(".", "");
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const paraVideo = (r: any): Video => ({
  id: r.id, titulo: r.titulo, canal: quando(r.criado_em), duracao: r.duracao_seg ? tc(r.duracao_seg) : "--:--:--",
  minutos: r.minutos || 0, enviadoEm: quando(r.criado_em),
  status: r.status === "pronto" ? "pronto" : r.status === "erro" ? "erro" : r.status === "aguardando" ? "aguardando" : r.status === "ao_vivo" ? "ao_vivo" : "processando",
  origem: r.origem, fonte: r.fonte,
  etapa: r.status === "enviando" ? 0 : r.status === "na_fila" ? 0 : r.etapa, plataformas: r.plataformas,
});
const paraCorte = (r: any, i: number): Corte => ({
  id: r.id, videoId: r.video_id, titulo: r.titulo, gancho: r.gancho, legenda: r.legenda,
  inicio: tc(r.inicio_seg), dur: r.dur_seg, nota: r.nota, motivos: r.motivos || [], status: r.status,
  cor: CORES[i % CORES.length],
});

export function DadosProvider({ children }: { children: ReactNode }) {
  const real = supaLigado();
  const [carregando, setCarregando] = useState(real);
  const [usuario, setUsuario] = useState<Usuario>(real ? { ...ex.usuario, nome: "", primeiroNome: "", email: "", minutosUsados: 0 } : ex.usuario);
  const [perfil, setPerfil] = useState<Perfil>({});
  const [videos, setVideos] = useState<Video[]>(real ? [] : ex.videos);
  const [cortes, setCortes] = useState<Corte[]>(real ? [] : ex.cortes);
  const [faturas, setFaturas] = useState<Fatura[]>(real ? [] : ex.faturas);

  const atualizar = useCallback(async () => {
    if (!real) return;
    const s = supaNavegador();
    const { data: { user } } = await s.auth.getUser();
    if (!user) { location.href = "/entrar"; return; }
    const [p, v, c, f, m] = await Promise.all([
      s.from("perfis").select("*").eq("id", user.id).single(),
      s.from("videos").select("*").order("criado_em", { ascending: false }),
      s.from("cortes").select("*").order("nota", { ascending: false }),
      s.from("faturas").select("*").order("criado_em", { ascending: false }),
      s.rpc("minutos_usados", { uid: user.id }),
    ]);
    const pf = p.data || {};
    const nome = pf.nome || user.email?.split("@")[0] || "";
    setPerfil(pf);
    setUsuario({
      nome, primeiroNome: nome.split(" ")[0], email: user.email || "",
      plano: NOME_PLANO[pf.plano] || "Grátis", preco: PRECO[pf.plano] || 0,
      minutosUsados: m.data || 0, minutosPlano: pf.minutos_plano || 60,
      renovaEm: pf.renova_em ? new Date(pf.renova_em).toLocaleDateString("pt-BR", { day: "numeric", month: "long" }) : "—",
    });
    setVideos((v.data || []).map(paraVideo));
    setCortes((c.data || []).map(paraCorte));
    setFaturas((f.data || []).map((x: any) => ({ id: x.id, data: new Date(x.pago_em || x.criado_em).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" }).replace(".", ""), valor: Number(x.valor), metodo: x.metodo, status: x.status })));
    setCarregando(false);
  }, [real]);

  useEffect(() => { atualizar(); }, [atualizar]);
  // enquanto alguma live estiver sendo cortada, confere de 8 em 8 segundos
  const temFila = videos.some((v) => v.status === "processando" || v.status === "ao_vivo" || v.status === "aguardando");
  useEffect(() => {
    if (!real || !temFila) return;
    const t = setInterval(atualizar, 8000);
    return () => clearInterval(t);
  }, [real, temFila, atualizar]);

  const marcarCorte = useCallback((id: string, st: StatusCorte) => {
    setCortes((l) => l.map((c) => (c.id === id ? { ...c, status: st } : c)));
    if (real) supaNavegador().from("cortes").update({ status: st }).eq("id", id).then(() => {});
  }, [real]);

  const salvarCorte = useCallback(async (id: string, campos: Record<string, unknown>) => {
    if (real) await supaNavegador().from("cortes").update(campos).eq("id", id);
  }, [real]);

  const salvarPerfil = useCallback(async (campos: Perfil) => {
    setPerfil((p) => ({ ...p, ...campos }));
    if (campos.nome) setUsuario((u) => ({ ...u, nome: campos.nome!, primeiroNome: campos.nome!.split(" ")[0] }));
    if (real) {
      const s = supaNavegador();
      const { data: { user } } = await s.auth.getUser();
      if (user) await s.from("perfis").update(campos).eq("id", user.id);
    }
  }, [real]);

  const sair = useCallback(async () => {
    if (real) await supaNavegador().auth.signOut();
    location.href = "/entrar";
  }, [real]);

  const valor = useMemo<Ctx>(() => ({ modo: real ? "real" : "exemplo", carregando, usuario, perfil, videos, cortes, faturas, atualizar, marcarCorte, salvarCorte, salvarPerfil, sair }),
    [real, carregando, usuario, perfil, videos, cortes, faturas, atualizar, marcarCorte, salvarCorte, salvarPerfil, sair]);
  return <C.Provider value={valor}>{children}</C.Provider>;
}

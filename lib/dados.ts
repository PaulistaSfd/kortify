// Dados de exemplo da área do cliente. Quando o back-end (Supabase) entrar,
// estas funções passam a buscar do banco e as telas continuam iguais.

export type Plataforma = "shorts" | "tiktok";
export type StatusVideo = "pronto" | "processando" | "erro";
export type StatusCorte = "sugerido" | "aprovado" | "baixado" | "descartado";

export type Corte = {
  id: string;
  videoId: string;
  titulo: string;
  gancho: string;
  legenda: string;
  inicio: string; // timecode na live
  dur: number; // segundos
  nota: number; // 0 a 100
  motivos: string[];
  status: StatusCorte;
  cor: string; // tom da miniatura
};

export type Video = {
  id: string;
  titulo: string;
  canal: string;
  duracao: string;
  minutos: number;
  enviadoEm: string;
  status: StatusVideo;
  etapa?: number; // 0 a 4, só quando processando
  plataformas: Plataforma[];
};

export const usuario = {
  nome: "Luis Rocha",
  primeiroNome: "Luis",
  email: "voce@exemplo.com",
  plano: "Pro",
  preco: 97,
  minutosUsados: 412,
  minutosPlano: 600,
  renovaEm: "18 de dezembro",
};

export const videos: Video[] = [
  { id: "v-rp-cidade", titulo: "RP na cidade: assalto ao banco central", canal: "Live da terça", duracao: "04:12:08", minutos: 252, enviadoEm: "Hoje, 14:02", status: "processando", etapa: 2, plataformas: ["shorts", "tiktok"] },
  { id: "v-fuga", titulo: "Fuga da polícia com o mecânico novo", canal: "Live de domingo", duracao: "03:01:44", minutos: 182, enviadoEm: "Ontem, 22:40", status: "pronto", plataformas: ["shorts", "tiktok"] },
  { id: "v-podcast", titulo: "Podcast #12: como comecei a fazer live", canal: "Podcast", duracao: "01:38:20", minutos: 98, enviadoEm: "15 nov", status: "pronto", plataformas: ["shorts"] },
  { id: "v-teste", titulo: "Teste de áudio (arquivo corrompido)", canal: "Rascunho", duracao: "00:00:00", minutos: 0, enviadoEm: "12 nov", status: "erro", plataformas: ["tiktok"] },
];

export const cortes: Corte[] = [
  { id: "c-voadora", videoId: "v-fuga", titulo: "A voadora no mecânico", gancho: "ELE NÃO ESPERAVA ISSO", legenda: "e do nada ele vem voando pra cima do mecânico, olha isso", inicio: "01:38:05", dur: 34, nota: 96, motivos: ["Grito alto", "Chat explodiu", "Movimento rápido"], status: "aprovado", cor: "#6366f1" },
  { id: "c-assalto", videoId: "v-fuga", titulo: "O assalto que deu errado", gancho: "O PLANO ERA PERFEITO", legenda: "o plano era perfeito até o carro morrer na frente da delegacia", inicio: "02:27:40", dur: 41, nota: 91, motivos: ["Risada", "Palavra-chave: assalto"], status: "sugerido", cor: "#0ea5e9" },
  { id: "c-fuga", videoId: "v-fuga", titulo: "Fuga pela contramão", gancho: "A POLÍCIA FICOU PRA TRÁS", legenda: "entra na contramão, sobe a calçada e a polícia ficou pra trás", inicio: "03:24:18", dur: 28, nota: 88, motivos: ["Música subiu", "Movimento rápido"], status: "baixado", cor: "#f59e0b" },
  { id: "c-mecanico", videoId: "v-fuga", titulo: "Mecânico chorando de rir", gancho: "NINGUÉM AGUENTOU", legenda: "o mecânico olhou o carro e começou a chorar de rir", inicio: "00:41:12", dur: 22, nota: 79, motivos: ["Risada longa"], status: "sugerido", cor: "#10b981" },
  { id: "c-final", videoId: "v-fuga", titulo: "O final que ninguém viu", gancho: "ESPERA ATÉ O FIM", legenda: "quando todo mundo achou que acabou ele volta de ré", inicio: "02:58:02", dur: 37, nota: 74, motivos: ["Pausa e grito"], status: "sugerido", cor: "#ec4899" },
  { id: "c-comecei", videoId: "v-podcast", titulo: "Comecei com celular", gancho: "EU NÃO TINHA NADA", legenda: "eu comecei com um celular emprestado e um fone quebrado", inicio: "00:12:30", dur: 45, nota: 85, motivos: ["Frase forte", "Pausa dramática"], status: "aprovado", cor: "#8b5cf6" },
  { id: "c-dica", videoId: "v-podcast", titulo: "A dica que mudou tudo", gancho: "FAZ ISSO NA PRIMEIRA LIVE", legenda: "a primeira coisa é avisar o horário e cumprir toda semana", inicio: "00:57:48", dur: 39, nota: 81, motivos: ["Conselho direto"], status: "baixado", cor: "#14b8a6" },
];

export const etapas = ["Enviando o arquivo", "Ouvindo o áudio", "Achando os momentos", "Cortando na vertical", "Colocando a legenda"];

export const estilosLegenda = [
  { id: "pop", nome: "Pop", desc: "Branca, contorno grosso, palavra atual em destaque" },
  { id: "caixa", nome: "Caixa", desc: "Fundo sólido atrás de cada palavra" },
  { id: "neon", nome: "Neon", desc: "Brilho colorido, bom para game" },
  { id: "limpa", nome: "Limpa", desc: "Discreta, para podcast" },
];

export const faturas = [
  { id: "f-11", data: "18 nov 2026", valor: 97, metodo: "Pix", status: "Pago" },
  { id: "f-10", data: "18 out 2026", valor: 97, metodo: "Pix", status: "Pago" },
  { id: "f-09", data: "18 set 2026", valor: 47, metodo: "Cartão final 4242", status: "Pago" },
];

export const planos = [
  { id: "start", nome: "Start", preco: 47, minutos: 240, itens: ["4 horas de live por mês", "Legenda palavra por palavra", "Download em 1080p"] },
  { id: "pro", nome: "Pro", preco: 97, minutos: 600, itens: ["10 horas de live por mês", "Tudo do Start", "Música com volume automático", "Fila na frente"] },
  { id: "combo", nome: "Pro + Agendador", preco: 137, minutos: 600, itens: ["Tudo do Pro", "Agendar no TikTok, Shorts e Reels", "Em breve"], breve: true },
];

export const corte = (id: string) => cortes.find((c) => c.id === id);
export const video = (id: string) => videos.find((v) => v.id === id);
export const cortesDo = (videoId: string) => cortes.filter((c) => c.videoId === videoId);
export const fmtDur = (s: number) => `0:${String(s).padStart(2, "0")}`;

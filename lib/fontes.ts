// Reconhece de onde vem um link e se é um VOD ou um canal (para capturar ao vivo).
export type Fonte = { fonte: "twitch" | "kick" | "youtube"; tipo: "vod" | "canal"; canal?: string; nome: string };

export function lerLink(bruto: string): Fonte | null {
  let u: URL;
  try { u = new URL(bruto.trim().startsWith("http") ? bruto.trim() : `https://${bruto.trim()}`); } catch { return null; }
  const host = u.hostname.replace(/^(www\.|m\.)/, "");
  const partes = u.pathname.split("/").filter(Boolean);

  if (host === "twitch.tv") {
    if (partes[0] === "videos" && partes[1]) return { fonte: "twitch", tipo: "vod", nome: "VOD da Twitch" };
    if (partes[1] === "video" || partes[1] === "videos") return { fonte: "twitch", tipo: "vod", canal: partes[0], nome: `VOD da Twitch · ${partes[0]}` };
    if (partes[0] && partes.length === 1) return { fonte: "twitch", tipo: "canal", canal: partes[0], nome: `Live da Twitch · ${partes[0]}` };
  }
  if (host === "kick.com") {
    if (partes[0] === "video" && partes[1]) return { fonte: "kick", tipo: "vod", nome: "VOD da Kick" };
    if (partes[1] === "videos" && partes[2]) return { fonte: "kick", tipo: "vod", canal: partes[0], nome: `VOD da Kick · ${partes[0]}` };
    if (partes[0] && partes.length === 1) return { fonte: "kick", tipo: "canal", canal: partes[0], nome: `Live da Kick · ${partes[0]}` };
  }
  if (host === "youtube.com" || host === "youtu.be") {
    if (host === "youtu.be" || u.searchParams.get("v") || partes[0] === "live" || partes[0] === "shorts") return { fonte: "youtube", tipo: "vod", nome: "Vídeo do YouTube" };
    if (partes[0]?.startsWith("@")) return { fonte: "youtube", tipo: "canal", canal: partes[0], nome: `Live do YouTube · ${partes[0]}` };
  }
  return null;
}

export const nomeFonte = { twitch: "Twitch", kick: "Kick", youtube: "YouTube" } as const;

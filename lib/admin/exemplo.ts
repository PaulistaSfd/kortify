// Dados de exemplo do admin: sempre os mesmos (semente fixa), contados a partir de "agora".
import type { DadosAdmin, Pedido, Assinatura, Cliente, DiaFunil, Job, Metodo, PlanoId, StatusPedido, Transacao } from "./tipos";

function rng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

const NOMES = ["Bruno", "Camila", "Diego", "Larissa", "Rafael", "Juliana", "Thiago", "Beatriz", "Gustavo", "Mariana", "Felipe", "Letícia", "Matheus", "Aline", "Vinícius", "Bianca", "Lucas", "Natália", "Pedro", "Carol", "Caio", "Isabela", "Rodrigo", "Yasmin", "Danilo", "Paula", "Igor", "Renata", "Hugo", "Tainá"];
const SOBRENOMES = ["Lima", "Souza", "Alves", "Costa", "Ribeiro", "Martins", "Rocha", "Araújo", "Melo", "Barbosa", "Teixeira", "Moura", "Cardoso", "Nunes", "Freitas"];
const ORIGENS = ["tiktok", "instagram", "youtube", "google", null, "indicacao"];
const PRECO: Record<PlanoId, number> = { start: 47, pro: 97, combo: 137 };
const MIN: Record<PlanoId, number> = { start: 240, pro: 600, combo: 600 };
const TITULOS = ["RP na cidade: perseguição na ponte", "Live de sexta: fuga do presídio", "Podcast #31 com convidado", "Ranked até o mestre", "Reagindo aos clipes do chat", "Corrida ilegal no porto", "Jogando com inscritos", "Live de 8 horas"];

export function dadosExemplo(agora = new Date()): DadosAdmin {
  const r = rng(20261118);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const dia = (n: number) => { const d = new Date(agora); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - n); return d; };
  const emHora = (d: Date) => { const x = new Date(d); x.setHours(8 + Math.floor(r() * 15), Math.floor(r() * 60)); return x > agora ? new Date(agora.getTime() - 60000 * (5 + Math.floor(r() * 50))) : x; };
  const iso = (d: Date) => d.toISOString();

  // ---- clientes
  const clientes: Cliente[] = [];
  for (let i = 0; i < 96; i++) {
    const n = `${pick(NOMES)} ${pick(SOBRENOMES)}`;
    const plano: Cliente["plano"] = r() < 0.32 ? "gratis" : r() < 0.38 ? "start" : r() < 0.86 ? "pro" : "combo";
    const mp = plano === "gratis" ? 60 : MIN[plano];
    const videos = Math.floor(r() * (plano === "gratis" ? 2 : 14));
    const cortes = videos * (4 + Math.floor(r() * 6));
    clientes.push({
      id: `u-${i}`, nome: n, email: `${n.split(" ")[0].toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")}${i}@exemplo.com`,
      criadoEm: iso(emHora(dia(Math.floor(r() * 120)))), plano,
      minutosUsados: Math.min(mp, Math.floor(r() * mp * 1.05)), minutosPlano: mp,
      videos, cortes, baixados: Math.floor(cortes * (0.3 + r() * 0.5)), gastoTotal: 0,
    });
  }
  const pagantes = clientes.filter((c) => c.plano !== "gratis");

  // ---- assinaturas
  const assinaturas: Assinatura[] = pagantes.map((c, i) => {
    const plano = c.plano as PlanoId;
    const st = r();
    const status = st < 0.8 ? "ativa" : st < 0.88 ? "atrasada" : st < 0.95 ? "cancelada" : "teste";
    const inicio = new Date(c.criadoEm);
    const prox = new Date(agora); prox.setDate(prox.getDate() + 1 + Math.floor(r() * 29));
    const metodo: Metodo = r() < 0.64 ? "pix" : r() < 0.93 ? "cartao" : "boleto";
    return {
      id: `a-${i}`, cliente: c.nome, email: c.email, plano, valor: PRECO[plano], metodo, status,
      inicio: iso(inicio), proxima: status === "cancelada" ? null : prox.toISOString().slice(0, 10),
      canceladaEm: status === "cancelada" ? iso(emHora(dia(Math.floor(r() * 25)))) : null,
      motivo: status === "cancelada" ? pick(["Achei caro", "Parei de fazer live", "Cortes não ficaram bons", "Vou voltar depois"]) : null,
    };
  });
  // inativos não contam como pagantes
  for (const a of assinaturas) if (a.status === "cancelada") { const c = clientes.find((x) => x.email === a.email); if (c) c.plano = "gratis"; }

  // ---- funil e pedidos dos últimos 30 dias
  const funil: DiaFunil[] = [];
  const pedidos: Pedido[] = [];
  let pid = 0;
  for (let n = 29; n >= 0; n--) {
    const d = dia(n);
    const tendencia = 1 + (29 - n) / 40;
    const fds = d.getDay() === 0 || d.getDay() === 6 ? 1.25 : 1;
    const visitas = Math.round((90 + r() * 110) * tendencia * fds);
    const cadastros = Math.round(visitas * (0.07 + r() * 0.04));
    const checkouts = Math.round(cadastros * (0.34 + r() * 0.16));
    let pagos = 0;
    for (let k = 0; k < checkouts; k++) {
      const c = pick(clientes);
      const plano: PlanoId = r() < 0.3 ? "start" : r() < 0.85 ? "pro" : "combo";
      const metodo: Metodo = r() < 0.66 ? "pix" : r() < 0.94 ? "cartao" : "boleto";
      const sr = r();
      let status: StatusPedido = metodo === "cartao" ? (sr < 0.82 ? "pago" : "recusado") : sr < 0.63 ? "pago" : "expirado";
      if (n === 0 && metodo !== "cartao" && sr > 0.45) status = "gerado";
      if (status === "pago" && r() < 0.02) status = "reembolsado";
      if (status === "pago") pagos++;
      const criado = emHora(d);
      const valor = PRECO[plano];
      pedidos.push({
        id: `p-${++pid}`, cliente: c.nome, email: c.email, plano, valor,
        taxa: metodo === "pix" ? 1.99 : metodo === "boleto" ? 1.99 : +(valor * 0.0299 + 0.49).toFixed(2),
        metodo, status, criadoEm: iso(criado),
        pagoEm: status === "pago" || status === "reembolsado" ? iso(new Date(Math.min(agora.getTime(), criado.getTime() + 60000 * (1 + Math.floor(r() * 40))))) : null,
        gatewayId: `pay_${(100000 + pid * 7919).toString(36)}`, origem: pick(ORIGENS),
      });
    }
    funil.push({ dia: d.toISOString().slice(0, 10), visitas, cadastros, checkouts, pagos });
  }
  // renovações automáticas (não passam pelo funil)
  for (const a of assinaturas.filter((x) => x.status === "ativa")) {
    const d = dia(Math.floor(r() * 30));
    const criado = emHora(d);
    pedidos.push({ id: `p-${++pid}`, cliente: a.cliente, email: a.email, plano: a.plano, valor: a.valor, taxa: a.metodo === "cartao" ? +(a.valor * 0.0299 + 0.49).toFixed(2) : 1.99, metodo: a.metodo, status: "pago", criadoEm: iso(criado), pagoEm: iso(criado), gatewayId: `sub_${(900000 + pid * 104729).toString(36)}`, origem: "renovacao" });
  }
  pedidos.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  for (const p of pedidos) if (p.status === "pago") { const c = clientes.find((x) => x.email === p.email); if (c) c.gastoTotal += p.valor; }

  // ---- motor
  const jobs: Job[] = [];
  const stJobs = ["processando", "na_fila", "na_fila", "ao_vivo", "pronto", "pronto", "pronto", "pronto", "erro", "pronto", "pronto", "aguardando", "pronto", "pronto"];
  stJobs.forEach((status, i) => {
    const c = pick(pagantes);
    const origem: Job["origem"] = status === "ao_vivo" || status === "aguardando" ? "live" : r() < 0.5 ? "link" : "arquivo";
    jobs.push({
      id: `j-${i}`, titulo: pick(TITULOS), cliente: c.nome, origem, fonte: origem === "arquivo" ? "arquivo" : pick(["twitch", "kick", "youtube"]), status,
      minutos: 40 + Math.floor(r() * 300), criadoEm: iso(new Date(agora.getTime() - 60000 * (i * 37 + 3))),
      erro: status === "erro" ? "VOD privado: o link pede login" : null,
    });
  });
  const motores = [
    { nome: "pc-luis", vistoEm: iso(new Date(agora.getTime() - 14000)), versao: "0.3.0", trabalhando: "j-0" },
    { nome: "vps-sp-1", vistoEm: iso(new Date(agora.getTime() - 60000 * 47)), versao: "0.2.4", trabalhando: null },
  ];

  // ---- gateway
  const pagos30 = pedidos.filter((p) => p.status === "pago");
  const transacoes: Transacao[] = [...pedidos].sort((a, b) => (b.pagoEm || b.criadoEm).localeCompare(a.pagoEm || a.criadoEm)).slice(0, 14).map((p) => ({ id: p.gatewayId, data: p.pagoEm || p.criadoEm, descricao: `Kortify ${p.plano === "combo" ? "Pro + Agendador" : p.plano === "pro" ? "Pro" : "Start"} · ${p.cliente}`, valor: p.valor, taxa: p.taxa, status: p.status, metodo: p.metodo }));
  const liquido = pagos30.reduce((s, p) => s + p.valor - p.taxa, 0);

  return {
    modo: "exemplo", aviso: null, geradoEm: iso(agora),
    pedidos, assinaturas, clientes, funil, jobs, motores,
    gateway: {
      conectado: true, nome: "Asaas", ambiente: "sandbox",
      saldo: Math.round(liquido * 0.62 * 100) / 100, aReceber: Math.round(liquido * 0.21 * 100) / 100,
      taxasMes: Math.round(pagos30.reduce((s, p) => s + p.taxa, 0) * 100) / 100,
      transacoes,
      webhooks: [
        { id: "w1", evento: "PAYMENT_RECEIVED", ok: true, recebidoEm: iso(new Date(agora.getTime() - 60000 * 4)) },
        { id: "w2", evento: "PAYMENT_CREATED", ok: true, recebidoEm: iso(new Date(agora.getTime() - 60000 * 9)) },
        { id: "w3", evento: "PAYMENT_OVERDUE", ok: true, recebidoEm: iso(new Date(agora.getTime() - 60000 * 63)) },
        { id: "w4", evento: "PAYMENT_RECEIVED", ok: false, recebidoEm: iso(new Date(agora.getTime() - 60000 * 180)) },
        { id: "w5", evento: "SUBSCRIPTION_DELETED", ok: true, recebidoEm: iso(new Date(agora.getTime() - 60000 * 410)) },
      ],
      erro: null,
    },
  };
}

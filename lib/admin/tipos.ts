// Formato dos dados do painel admin. Igual para dados reais e de exemplo.

export type Metodo = "pix" | "cartao" | "boleto";
export type StatusPedido = "gerado" | "pago" | "expirado" | "recusado" | "reembolsado";
export type StatusAssinatura = "ativa" | "atrasada" | "cancelada" | "teste";
export type PlanoId = "start" | "pro" | "combo";

export type Pedido = {
  id: string; cliente: string; email: string; plano: PlanoId; valor: number; taxa: number;
  metodo: Metodo; status: StatusPedido; criadoEm: string; pagoEm: string | null; gatewayId: string; origem: string | null;
};

export type Assinatura = {
  id: string; cliente: string; email: string; plano: PlanoId; valor: number; metodo: Metodo;
  status: StatusAssinatura; inicio: string; proxima: string | null; canceladaEm: string | null; motivo: string | null;
};

export type Cliente = {
  id: string; nome: string; email: string; criadoEm: string; plano: PlanoId | "gratis";
  minutosUsados: number; minutosPlano: number; videos: number; cortes: number; baixados: number; gastoTotal: number;
};

export type DiaFunil = { dia: string; visitas: number; cadastros: number; checkouts: number; pagos: number };

export type Job = { id: string; titulo: string; cliente: string; origem: "arquivo" | "link" | "live"; fonte: string; status: string; minutos: number; criadoEm: string; erro: string | null };
export type Motor = { nome: string; vistoEm: string; versao: string | null; trabalhando: string | null };

export type Transacao = { id: string; data: string; descricao: string; valor: number; taxa: number; status: string; metodo: Metodo };
export type Webhook = { id: string; evento: string; ok: boolean; recebidoEm: string };

export type Gateway = {
  conectado: boolean; nome: string; ambiente: "sandbox" | "producao" | null;
  saldo: number | null; aReceber: number | null; taxasMes: number | null;
  transacoes: Transacao[]; webhooks: Webhook[]; erro: string | null;
};

export type DadosAdmin = {
  modo: "real" | "exemplo";
  aviso: string | null;
  geradoEm: string;
  pedidos: Pedido[];
  assinaturas: Assinatura[];
  clientes: Cliente[];
  funil: DiaFunil[];
  jobs: Job[];
  motores: Motor[];
  gateway: Gateway;
};

export const nomePlano: Record<string, string> = { gratis: "Grátis", start: "Start", pro: "Pro", combo: "Pro + Agendador" };
export const nomeMetodo: Record<Metodo, string> = { pix: "Pix", cartao: "Cartão", boleto: "Boleto" };
export const nomeStatusPedido: Record<StatusPedido, string> = { gerado: "Aguardando", pago: "Pago", expirado: "Expirou", recusado: "Recusado", reembolsado: "Reembolsado" };
export const nomeStatusAss: Record<StatusAssinatura, string> = { ativa: "Ativa", atrasada: "Atrasada", cancelada: "Cancelada", teste: "Teste" };

-- Kortify: tabelas do painel admin (vendas, assinaturas, funil e motor).
-- Rode no SQL Editor do Supabase depois dos arquivos 001 a 003.
-- Só o servidor (chave secreta) lê e escreve aqui. Cliente logado não vê nada.

-- Cada cobrança criada na gateway (Pix gerado, cartão tentado, boleto emitido)
create table if not exists public.pedidos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text,
  plano text not null check (plano in ('start','pro','combo')),
  valor numeric(10,2) not null,
  metodo text not null check (metodo in ('pix','cartao','boleto')),
  status text not null default 'gerado' check (status in ('gerado','pago','expirado','recusado','reembolsado')),
  gateway text not null default 'asaas',
  gateway_id text unique,
  taxa numeric(10,2) not null default 0,
  origem text, -- utm_source da visita que virou pedido
  criado_em timestamptz not null default now(),
  pago_em timestamptz
);
create index if not exists pedidos_criado_idx on public.pedidos (criado_em desc);
create index if not exists pedidos_status_idx on public.pedidos (status, criado_em desc);

-- Assinatura de cada cliente (uma ativa por vez)
create table if not exists public.assinaturas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plano text not null check (plano in ('start','pro','combo')),
  valor numeric(10,2) not null,
  metodo text not null check (metodo in ('pix','cartao','boleto')),
  status text not null default 'ativa' check (status in ('ativa','atrasada','cancelada','teste')),
  gateway_id text unique,
  inicio timestamptz not null default now(),
  proxima_cobranca date,
  cancelada_em timestamptz,
  motivo_cancelamento text
);
create index if not exists assinaturas_status_idx on public.assinaturas (status);
create index if not exists assinaturas_user_idx on public.assinaturas (user_id);

-- Funil: visita no site, cadastro, abriu o checkout, pagou
create table if not exists public.eventos (
  id bigint generated always as identity primary key,
  tipo text not null check (tipo in ('visita','cadastro','checkout','pago')),
  sessao text,
  user_id uuid references auth.users(id) on delete set null,
  origem text,
  pagina text,
  criado_em timestamptz not null default now()
);
create index if not exists eventos_tipo_idx on public.eventos (tipo, criado_em desc);

-- Batida de cada motor (PC ou VPS) para saber se está ligado
create table if not exists public.motores (
  nome text primary key,
  visto_em timestamptz not null default now(),
  versao text,
  trabalhando uuid references public.videos(id) on delete set null
);

-- Avisos que a gateway manda (webhook), guardados para conferir
create table if not exists public.webhooks (
  id bigint generated always as identity primary key,
  gateway text not null,
  evento text not null,
  ok boolean not null default true,
  corpo jsonb,
  recebido_em timestamptz not null default now()
);
create index if not exists webhooks_recebido_idx on public.webhooks (recebido_em desc);

-- Tudo fechado para o público e para quem está logado
alter table public.pedidos enable row level security;
alter table public.assinaturas enable row level security;
alter table public.eventos enable row level security;
alter table public.motores enable row level security;
alter table public.webhooks enable row level security;

revoke all on public.pedidos, public.assinaturas, public.eventos, public.motores, public.webhooks from anon, authenticated;
grant all on public.pedidos, public.assinaturas, public.eventos, public.motores, public.webhooks to service_role;
grant usage, select on all sequences in schema public to service_role;

-- O cliente pode ver a própria assinatura (para a tela Plano)
grant select on public.assinaturas to authenticated;
drop policy if exists "assinatura_propria" on public.assinaturas;
create policy "assinatura_propria" on public.assinaturas for select using (auth.uid() = user_id);

-- Funil por dia (últimos N dias), contado no banco para não puxar milhares de linhas
create or replace function public.funil_diario(dias int default 30)
returns table (dia date, visitas bigint, cadastros bigint, checkouts bigint, pagos bigint)
language sql stable security definer set search_path = public as $$
  with d as (select generate_series(current_date - (dias - 1), current_date, interval '1 day')::date as dia)
  select d.dia,
    (select count(distinct coalesce(e.sessao, e.id::text)) from eventos e where e.tipo = 'visita' and e.criado_em::date = d.dia),
    (select count(*) from perfis p where p.criado_em::date = d.dia),
    (select count(*) from pedidos o where o.criado_em::date = d.dia and coalesce(o.origem,'') <> 'renovacao'),
    (select count(*) from pedidos o where o.pago_em::date = d.dia and o.status = 'pago' and coalesce(o.origem,'') <> 'renovacao')
  from d order by d.dia;
$$;
revoke all on function public.funil_diario(int) from public, anon, authenticated;
grant execute on function public.funil_diario(int) to service_role;

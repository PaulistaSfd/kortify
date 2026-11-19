-- Kortify: banco de dados no Supabase.
-- Rode este arquivo inteiro no SQL Editor do Supabase (ou pelo conector).

-- Perfil de cada cliente (criado sozinho quando a pessoa entra pela 1ª vez)
create table if not exists public.perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  email text,
  plano text not null default 'gratis' check (plano in ('gratis','start','pro','combo')),
  minutos_plano int not null default 60,
  renova_em date,
  estilo_legenda text not null default 'pop',
  destino text not null default 'os dois',
  palavras text not null default 'que isso, não acredito, olha isso, clipa',
  avisos jsonb not null default '{"pronto": true, "fatura": true, "dicas": false}',
  criado_em timestamptz not null default now()
);

-- Cada live enviada
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null,
  arquivo_key text not null,
  tamanho_bytes bigint,
  duracao_seg int,
  minutos int not null default 0,
  status text not null default 'enviando' check (status in ('enviando','na_fila','processando','pronto','erro')),
  etapa int not null default 0,
  plataformas text[] not null default '{shorts,tiktok}',
  erro text,
  criado_em timestamptz not null default now()
);
create index if not exists videos_user_idx on public.videos (user_id, criado_em desc);
create index if not exists videos_fila_idx on public.videos (status, criado_em) where status = 'na_fila';

-- Cada corte sugerido pelo motor
create table if not exists public.cortes (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null,
  gancho text not null default '',
  legenda text not null default '',
  inicio_seg int not null default 0,
  dur_seg int not null default 30,
  nota int not null default 0,
  motivos text[] not null default '{}',
  status text not null default 'sugerido' check (status in ('sugerido','aprovado','baixado','descartado')),
  estilo text not null default 'pop',
  cor_destaque text not null default '#FACC15',
  posicao text not null default 'baixo',
  arquivo_key text,
  criado_em timestamptz not null default now()
);
create index if not exists cortes_video_idx on public.cortes (video_id, nota desc);
create index if not exists cortes_user_idx on public.cortes (user_id, criado_em desc);

-- Pagamentos
create table if not exists public.faturas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  valor numeric(10,2) not null,
  metodo text not null,
  status text not null default 'pendente',
  referencia text,
  pago_em timestamptz,
  criado_em timestamptz not null default now()
);

-- Segurança: cada cliente só vê e mexe no que é dele
alter table public.perfis enable row level security;
alter table public.videos enable row level security;
alter table public.cortes enable row level security;
alter table public.faturas enable row level security;

drop policy if exists "perfil_proprio" on public.perfis;
create policy "perfil_proprio" on public.perfis for all using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "videos_proprios" on public.videos;
create policy "videos_proprios" on public.videos for select using (auth.uid() = user_id);
drop policy if exists "cortes_ler" on public.cortes;
create policy "cortes_ler" on public.cortes for select using (auth.uid() = user_id);
drop policy if exists "cortes_editar" on public.cortes;
create policy "cortes_editar" on public.cortes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "faturas_ler" on public.faturas;
create policy "faturas_ler" on public.faturas for select using (auth.uid() = user_id);
-- O plano e os minutos só mudam pelo servidor (pagamento), nunca pelo navegador
revoke update (plano, minutos_plano, renova_em) on public.perfis from authenticated;

-- Cria o perfil quando alguém se cadastra
create or replace function public.novo_usuario() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfis (id, nome, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), new.email)
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario after insert on auth.users for each row execute function public.novo_usuario();

-- Minutos usados no mês atual
create or replace function public.minutos_usados(uid uuid) returns int
language sql stable security definer set search_path = public as $$
  select coalesce(sum(minutos), 0)::int from public.videos
  where user_id = uid and status <> 'erro' and criado_em >= date_trunc('month', now());
$$;

-- O worker pega a próxima live da fila sem duas máquinas pegarem a mesma
create or replace function public.pegar_proxima_live() returns setof public.videos
language sql security definer set search_path = public as $$
  update public.videos set status = 'processando', etapa = 1
  where id = (select id from public.videos where status = 'na_fila' order by criado_em limit 1 for update skip locked)
  returning *;
$$;
revoke execute on function public.pegar_proxima_live() from anon, authenticated;

-- Links e live ao vivo: rode também o arquivo 002_links_e_live.sql

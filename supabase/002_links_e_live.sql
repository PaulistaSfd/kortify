-- Kortify 002: receber links de VOD (Twitch, Kick, YouTube) e capturar live ao vivo.
-- Pode rodar mais de uma vez sem problema.

alter table public.videos add column if not exists origem text not null default 'arquivo';
alter table public.videos add column if not exists url_origem text;
alter table public.videos add column if not exists fonte text; -- twitch, kick, youtube, arquivo
alter table public.videos add column if not exists autorizado_em timestamptz; -- quando o cliente confirmou que pode usar o vídeo
alter table public.videos alter column arquivo_key drop not null;

alter table public.videos drop constraint if exists videos_origem_check;
alter table public.videos add constraint videos_origem_check check (origem in ('arquivo','link','live'));
alter table public.videos drop constraint if exists videos_status_check;
alter table public.videos add constraint videos_status_check
  check (status in ('enviando','na_fila','processando','aguardando','ao_vivo','pronto','erro'));

create index if not exists videos_live_idx on public.videos (status) where status in ('aguardando','ao_vivo');

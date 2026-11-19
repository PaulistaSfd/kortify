-- Kortify 003: permissões. Projetos novos do Supabase não liberam as tabelas sozinhos.
-- Pode rodar mais de uma vez.

-- quem está logado lê o que é seu (as regras RLS filtram por dono)
grant usage on schema public to authenticated, service_role;
grant select on public.perfis, public.videos, public.cortes, public.faturas to authenticated;
grant update (nome, estilo_legenda, destino, palavras, avisos) on public.perfis to authenticated;
grant update (gancho, legenda, status, estilo, cor_destaque, posicao) on public.cortes to authenticated;

-- o servidor (chave secreta) faz tudo
grant all on public.perfis, public.videos, public.cortes, public.faturas to service_role;

-- visitante sem login não vê nada
revoke all on public.perfis, public.videos, public.cortes, public.faturas from anon;

-- só o servidor pega live da fila
revoke execute on function public.pegar_proxima_live() from public, anon, authenticated;
grant execute on function public.pegar_proxima_live() to service_role;

-- minutos usados: cada um só consulta os próprios
create or replace function public.minutos_usados(uid uuid) returns int
language sql stable security definer set search_path = public as $$
  select coalesce(sum(minutos), 0)::int from public.videos
  where user_id = uid and (uid = auth.uid() or auth.role() = 'service_role')
    and status <> 'erro' and criado_em >= date_trunc('month', now());
$$;
revoke execute on function public.minutos_usados(uuid) from public, anon;
grant execute on function public.minutos_usados(uuid) to authenticated, service_role;

revoke execute on function public.novo_usuario() from public, anon, authenticated;

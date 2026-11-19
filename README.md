# Kortify

Site de vendas + área do cliente. Next.js 15, publicado na Cloudflare (Workers, via OpenNext).

## Rodar no computador
    npm install
    npm run dev        # http://localhost:3000

## Publicar na Cloudflare
    npm run deploy     # precisa de CLOUDFLARE_API_TOKEN e CLOUDFLARE_ACCOUNT_ID

## Banco de dados
Rode `supabase/schema.sql` no SQL Editor do Supabase. As variáveis ficam em `.env.example`.

## Como funciona o envio
1. O navegador pede `/api/envio`, que cria a live no banco e devolve um link do R2.
2. O arquivo vai direto para o R2 (não passa pelo servidor).
3. `/api/envio/concluir` coloca a live na fila.
4. O motor (clipador.py num servidor) chama `/api/worker/proximo`, corta, manda os MP4 para o R2 e avisa `/api/worker/resultado`.

## E-mails de login

Os modelos ficam em `supabase/emails/`. Rode `node supabase/emails/gerar.mjs` e cole o HTML em Supabase → Authentication → Emails → Templates.

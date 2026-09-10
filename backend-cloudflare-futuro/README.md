# Backend futuro (Cloudflare Worker + D1) — pausado

Experimento começado para permitir sincronizar os gastos entre aparelhos (hoje o
app funciona 100% offline, salvando só no localStorage do navegador). Ainda não
está ligado ao app nem publicado — é só o rascunho do backend.

O que tem aqui:
- `worker.js` — Worker que serve o app estático e expõe rotas `/api/*` (listar,
  adicionar, editar, apagar, importar, resumo por voz).
- `schema.sql` — tabelas `items` e `learn` para o banco D1.
- `parser.js` — a mesma lógica de interpretar frases ("35 no mercado") usada
  pelo app, extraída para o Worker poder usar também (ex.: atalho da Siri sem
  precisar abrir o app).
- `wrangler.jsonc` — config do Cloudflare Worker (falta criar o banco D1 real e
  preencher `database_id`).

## Por que está pausado

O app principal continua simples e sem custo, publicado no GitHub Pages
(raiz do repositório). Ligar esse backend exigiria:
1. Criar/logar numa conta Cloudflare (`npx wrangler login`) — passo que só o
   Denis pode fazer.
2. Criar o banco: `npx wrangler d1 create gastei` e colar o `database_id` aqui.
3. Atualizar `app.js` para sincronizar com `/api/*` em vez de só o localStorage.
4. Publicar com `npx wrangler deploy`.

Se um dia fizer sentido ter os gastos em mais de um aparelho, retomar por aqui.

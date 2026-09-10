// Gastei – backend (Cloudflare Worker + D1)
import './parser.js';
const P = globalThis.GasteiParser;

const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const text = (s, status = 200) => new Response(s, { status, headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' } });
const todayIso = () => {
  // fuso de Brasília (UTC-3)
  const d = new Date(Date.now() - 3 * 3600 * 1000);
  return d.toISOString().slice(0, 10);
};
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const validKey = k => typeof k === 'string' && /^[a-z0-9]{16,40}$/.test(k);

async function getLearned(db, key) {
  const { results } = await db.prepare('SELECT place, cat FROM learn WHERE user_key = ?').bind(key).all();
  const o = {}; for (const r of results) o[r.place] = r.cat; return o;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);

    const key = url.searchParams.get('k') || request.headers.get('x-key');
    if (!validKey(key)) return text('Chave inválida. Abra o app, toque em "?" e copie a chave.', 401);
    const db = env.DB;
    const route = url.pathname.slice(5);
    let body = {};
    if (request.method === 'POST') { try { body = await request.json(); } catch (e) { body = {}; } }

    try {
      // Lista tudo (app)
      if (route === 'items' && request.method === 'GET') {
        const { results } = await db.prepare('SELECT id, value, place, cat, type, date, created FROM items WHERE user_key = ? ORDER BY date DESC, created DESC LIMIT 5000').bind(key).all();
        return json({ items: results, learned: await getLearned(db, key) });
      }

      // Adiciona por frase (atalho da Siri e app): /api/add?k=...&t=35 no mercado
      if (route === 'add') {
        const t = (url.searchParams.get('t') || body.t || '').trim();
        if (!t) return text('Fale o valor e onde gastou. Ex.: "35 no mercado"', 400);
        const p = P.parse(t, await getLearned(db, key));
        if (!(p.value > 0)) return text('Não entendi o valor em: "' + t + '"', 422);
        const item = { id: uid(), value: p.value, place: p.place, cat: p.cat, type: p.type, date: todayIso(), created: Date.now() };
        await db.prepare('INSERT INTO items (id, user_key, value, place, cat, type, date, created) VALUES (?,?,?,?,?,?,?,?)')
          .bind(item.id, key, item.value, item.place, item.cat, item.type, item.date, item.created).run();
        const msg = (p.type === 'in' ? 'Recebido: ' : 'Anotado: ') + P.money(p.value) + (p.place ? ' · ' + p.place : '') + ' · ' + P.CATS[p.cat].nome;
        if (url.searchParams.get('json')) return json({ ok: true, item, msg });
        // resposta em texto puro para a notificação do atalho
        const totals = await db.prepare("SELECT SUM(CASE WHEN type='out' THEN value ELSE 0 END) AS g FROM items WHERE user_key = ? AND date >= date(?, 'start of month')").bind(key, item.date).first();
        return text(msg + '\nMês: ' + P.money(totals && totals.g));
      }

      // Salva/edita item completo (app)
      if (route === 'save' && request.method === 'POST') {
        const x = body.item || {};
        if (!x.id || !(x.value > 0) || !x.date) return json({ error: 'item inválido' }, 400);
        await db.prepare('INSERT INTO items (id, user_key, value, place, cat, type, date, created) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value, place=excluded.place, cat=excluded.cat, type=excluded.type, date=excluded.date WHERE user_key = excluded.user_key')
          .bind(x.id, key, x.value, x.place || '', x.cat || 'outros', x.type || 'out', x.date, x.created || Date.now()).run();
        return json({ ok: true });
      }

      if (route === 'delete' && request.method === 'POST') {
        await db.prepare('DELETE FROM items WHERE id = ? AND user_key = ?').bind(body.id || '', key).run();
        return json({ ok: true });
      }

      if (route === 'learn' && request.method === 'POST') {
        const place = P.normalize(body.place || ''), cat = body.cat || 'outros';
        if (place) await db.prepare('INSERT INTO learn (user_key, place, cat) VALUES (?,?,?) ON CONFLICT(user_key, place) DO UPDATE SET cat = excluded.cat').bind(key, place, cat).run();
        return json({ ok: true });
      }

      // Importa lista local (primeira sincronização)
      if (route === 'import' && request.method === 'POST') {
        const list = Array.isArray(body.items) ? body.items.slice(0, 2000) : [];
        const stmt = db.prepare('INSERT OR IGNORE INTO items (id, user_key, value, place, cat, type, date, created) VALUES (?,?,?,?,?,?,?,?)');
        await db.batch(list.filter(x => x.id && x.value > 0 && x.date).map(x => stmt.bind(x.id, key, x.value, x.place || '', x.cat || 'outros', x.type || 'out', x.date, x.created || Date.now())));
        return json({ ok: true, n: list.length });
      }

      // Resumo em texto (para a Siri: "quanto gastei essa semana?")
      if (route === 'resumo') {
        const t = todayIso();
        const q = (cond) => db.prepare("SELECT SUM(CASE WHEN type='out' THEN value ELSE 0 END) AS g, SUM(CASE WHEN type='in' THEN value ELSE 0 END) AS e FROM items WHERE user_key = ? AND " + cond).bind(key, t).first();
        const hoje = await q('date = ?');
        const semana = await q("date >= date(?, 'weekday 0', '-6 days')");
        const mes = await q("date >= date(?, 'start of month')");
        return text(`Hoje: ${P.money(hoje.g)}\nSemana: ${P.money(semana.g)}\nMês: ${P.money(mes.g)}` + (mes.e ? `\nEntradas no mês: ${P.money(mes.e)} · Saldo: ${P.money(mes.e - mes.g)}` : ''));
      }

      return text('Rota não encontrada', 404);
    } catch (e) {
      return text('Erro: ' + e.message, 500);
    }
  }
};

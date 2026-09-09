/* Gastei – app.js */
(function () {
  'use strict';

  // ---------- Categorias ----------
  const CATS = {
    alimentacao: { nome: 'Alimentação', emoji: '🍔', kw: ['mercado', 'supermercado', 'padaria', 'lanche', 'lanchonete', 'restaurante', 'almoço', 'janta', 'jantar', 'café', 'pizza', 'hamburguer', 'hambúrguer', 'ifood', 'comida', 'feira', 'açougue', 'sorvete', 'pastel', 'bar', 'cerveja', 'bebida', 'pão', 'sacolão', 'hortifruti', 'marmita', 'salgado', 'doce', 'chocolate', 'burger', 'sushi', 'mc', 'mcdonalds', 'burguer'] },
    transporte:  { nome: 'Transporte', emoji: '🚗', kw: ['uber', '99', 'taxi', 'táxi', 'gasolina', 'combustível', 'ônibus', 'busão', 'metrô', 'estacionamento', 'pedágio', 'passagem', 'moto', 'carro', 'álcool', 'etanol', 'posto', 'bilhete', 'trem', 'lavagem', 'mecânico', 'oficina', 'pneu'] },
    moradia:     { nome: 'Moradia', emoji: '🏠', kw: ['aluguel', 'luz', 'energia', 'água', 'gás', 'internet', 'condomínio', 'iptu', 'faxina', 'diarista', 'reforma', 'móveis', 'casa', 'wifi'] },
    saude:       { nome: 'Saúde', emoji: '💊', kw: ['farmácia', 'remédio', 'médico', 'consulta', 'dentista', 'exame', 'hospital', 'plano de saúde', 'academia', 'psicólogo', 'terapia', 'drogaria', 'suplemento', 'whey'] },
    lazer:       { nome: 'Lazer', emoji: '🎉', kw: ['cinema', 'show', 'jogo', 'netflix', 'spotify', 'streaming', 'festa', 'balada', 'viagem', 'passeio', 'parque', 'ingresso', 'teatro', 'livro', 'game', 'steam', 'playstation', 'xbox', 'disney', 'hbo', 'prime', 'youtube'] },
    compras:     { nome: 'Compras', emoji: '🛍️', kw: ['roupa', 'roupas', 'tênis', 'sapato', 'loja', 'shopping', 'shein', 'amazon', 'mercado livre', 'shopee', 'presente', 'celular', 'fone', 'eletrônico', 'perfume', 'maquiagem', 'cosmético', 'calçado', 'camisa', 'calça', 'boné'] },
    educacao:    { nome: 'Educação', emoji: '📚', kw: ['curso', 'faculdade', 'escola', 'mensalidade', 'apostila', 'material escolar', 'aula', 'udemy', 'alura'] },
    pets:        { nome: 'Pets', emoji: '🐶', kw: ['ração', 'pet', 'veterinário', 'petshop', 'cachorro', 'gato', 'banho e tosa'] },
    pessoal:     { nome: 'Pessoal', emoji: '💇', kw: ['cabelo', 'cabeleireiro', 'barbeiro', 'barbearia', 'salão', 'manicure', 'unha', 'depilação', 'estética'] },
    outros:      { nome: 'Outros', emoji: '💸', kw: [] }
  };

  // ---------- Armazenamento ----------
  const KEY = 'gastei.items';
  const LEARN_KEY = 'gastei.learn';
  let items = load(KEY, []);
  let learned = load(LEARN_KEY, {}); // { "padaria do joao": "alimentacao" }

  function load(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }
  function save() { localStorage.setItem(KEY, JSON.stringify(items)); }
  function saveLearn() { localStorage.setItem(LEARN_KEY, JSON.stringify(learned)); }

  // ---------- Utilidades ----------
  const $ = s => document.querySelector(s);
  const money = v => 'R$ ' + (Number(v) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const pad = n => String(n).padStart(2, '0');
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const todayIso = () => iso(new Date());
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  function normalize(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function parseIso(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
  function startOfWeek(d) { const x = new Date(d); const day = (x.getDay() + 6) % 7; x.setDate(x.getDate() - day); x.setHours(0, 0, 0, 0); return x; }
  function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
  const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

  // ---------- Números por extenso ----------
  const UNIDADES = { zero: 0, um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9, dez: 10, onze: 11, doze: 12, treze: 13, catorze: 14, quatorze: 14, quinze: 15, dezesseis: 16, dezessete: 17, dezoito: 18, dezenove: 19 };
  const DEZENAS = { vinte: 20, trinta: 30, quarenta: 40, cinquenta: 50, sessenta: 60, setenta: 70, oitenta: 80, noventa: 90 };
  const CENTENAS = { cem: 100, cento: 100, duzentos: 200, trezentos: 300, quatrocentos: 400, quinhentos: 500, seiscentos: 600, setecentos: 700, oitocentos: 800, novecentos: 900 };
  const NUMWORDS = new Set([...Object.keys(UNIDADES), ...Object.keys(DEZENAS), ...Object.keys(CENTENAS), 'mil', 'e']);

  function wordsToNumber(words) {
    let total = 0, cur = 0, any = false;
    for (const w of words) {
      if (w === 'e') continue;
      if (w === 'mil') { cur = (cur || 1) * 1000; total += cur; cur = 0; any = true; continue; }
      const v = UNIDADES[w] !== undefined ? UNIDADES[w] : DEZENAS[w] !== undefined ? DEZENAS[w] : CENTENAS[w];
      if (v === undefined) continue;
      cur += v; any = true;
    }
    return any ? total + cur : null;
  }

  // ---------- Interpretação da frase ----------
  const STOP = new Set(['reais', 'real', 'conto', 'contos', 'pila', 'pau', 'centavo', 'centavos', 'gastei', 'gasto', 'paguei', 'comprei', 'foi', 'de', 'da', 'do', 'no', 'na', 'nos', 'nas', 'em', 'com', 'pra', 'pro', 'para', 'o', 'a', 'os', 'as', 'um', 'uma', 'hoje', 'agora', 'anota', 'anotar', 'grava', 'gravar', 'e', 'r$', 'rs']);
  const NUMRE = /^(\d{1,3}(?:\.\d{3})+|\d+)(?:[,.](\d{1,2}))?$/;

  function parse(textRaw) {
    const raw = String(textRaw).toLowerCase().replace(/r\$\s*/g, '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
    const norm = raw.map(w => normalize(w));
    let value = null, used = new Set();

    // 1) valor em dígitos: "35", "35,50", "1.200"
    for (let i = 0; i < norm.length && value === null; i++) {
      const m = norm[i].match(NUMRE);
      if (m) { value = parseFloat(m[1].replace(/\./g, '') + '.' + (m[2] || '0').padEnd(2, '0')); used.add(i); if (!m[2]) value = withCents(value, i + 1); }
    }
    // 2) valor por extenso: "vinte e cinco"
    for (let i = 0; i < norm.length && value === null; i++) {
      if (!NUMWORDS.has(norm[i]) || norm[i] === 'e') continue;
      let j = i;
      while (j < norm.length && NUMWORDS.has(norm[j])) j++;
      while (j > i && norm[j - 1] === 'e') j--;
      const n = wordsToNumber(norm.slice(i, j));
      if (n !== null) { value = n; for (let k = i; k < j; k++) used.add(k); value = withCents(value, j); }
    }
    // centavos logo após o valor: "[reais] (e|com) 50 [centavos]" ou "... noventa centavos"
    function withCents(v, k) {
      if (norm[k] === 'reais' || norm[k] === 'real' || norm[k] === 'conto') k++;
      if (norm[k] !== 'e' && norm[k] !== 'com') return v;
      let c = null, end = k + 1;
      if (/^\d{1,2}$/.test(norm[end] || '')) { c = parseInt(norm[end], 10); end++; }
      else {
        let j = end;
        while (j < norm.length && NUMWORDS.has(norm[j])) j++;
        while (j > end && norm[j - 1] === 'e') j--;
        const n = j > end ? wordsToNumber(norm.slice(end, j)) : null;
        if (n !== null && n < 100) { c = n; end = j; }
      }
      if (c === null) return v;
      const hasCentavos = /^centavos?$/.test(norm[end] || '');
      if (hasCentavos) end++;
      for (let x = k; x < end; x++) used.add(x);
      return v + c / 100;
    }

    const rest = raw.filter((w, i) => !used.has(i) && !STOP.has(norm[i]));
    const place = rest.length ? rest.join(' ').replace(/^./, c => c.toUpperCase()) : '';
    return { value, place, cat: guessCat(place) };
  }

  function guessCat(place) {
    const p = normalize(place);
    if (!p) return 'outros';
    if (learned[p]) return learned[p];
    for (const [id, c] of Object.entries(CATS)) {
      for (const k of c.kw) if (p.includes(normalize(k))) return id;
    }
    return 'outros';
  }

  // ---------- Consultas ----------
  function inRange(a, b) { return items.filter(x => x.date >= a && x.date <= b); }
  function sum(arr) { return arr.reduce((s, x) => s + x.value, 0); }
  function byCat(arr) {
    const o = {};
    for (const x of arr) o[x.cat] = (o[x.cat] || 0) + x.value;
    return Object.entries(o).sort((a, b) => b[1] - a[1]);
  }

  // ---------- Views ----------
  let tab = 'home';
  const view = $('#view');
  const VIEWS = { home, week, month, history: historyView };

  function render() {
    document.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    VIEWS[tab]();
  }

  function home() {
    const today = new Date(), tIso = todayIso();
    const ws = iso(startOfWeek(today)), we = iso(addDays(startOfWeek(today), 6));
    const ms = iso(new Date(today.getFullYear(), today.getMonth(), 1)), me = iso(new Date(today.getFullYear(), today.getMonth() + 1, 0));
    const recent = [...items].sort((a, b) => (b.date + b.created).localeCompare(a.date + a.created)).slice(0, 5);
    view.innerHTML = `
      <div class="mic-wrap">
        <button class="mic" id="btn-mic" aria-label="Falar gasto">
          <svg viewBox="0 0 24 24"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z"/></svg>
        </button>
        <p class="mic-hint">Toque e fale: "35 no mercado"</p>
        <button class="link" id="btn-type">ou digite</button>
      </div>
      <div class="totals">
        <div class="card"><p class="val">${money(sum(inRange(tIso, tIso)))}</p><p class="lbl">Hoje</p></div>
        <div class="card"><p class="val">${money(sum(inRange(ws, we)))}</p><p class="lbl">Semana</p></div>
        <div class="card"><p class="val">${money(sum(inRange(ms, me)))}</p><p class="lbl">Mês</p></div>
      </div>
      <div class="card"><h3>Últimos gastos</h3>${listHtml(recent, true)}</div>`;
    $('#btn-mic').onclick = startVoice;
    $('#btn-type').onclick = openType;
    bindList();
  }

  function week() {
    const today = new Date(), ws = startOfWeek(today);
    const days = Array.from({ length: 7 }, (_, i) => addDays(ws, i));
    const cur = inRange(iso(ws), iso(addDays(ws, 6)));
    const prev = inRange(iso(addDays(ws, -7)), iso(addDays(ws, -1)));
    const totals = days.map(d => sum(cur.filter(x => x.date === iso(d))));
    const max = Math.max(...totals, 1);
    const tIso = todayIso();
    view.innerHTML = `
      <div class="card"><h3>Esta semana</h3><p class="big">${money(sum(cur))}</p>${deltaHtml(sum(cur), sum(prev), 'semana passada')}
        <div class="bars">${days.map((d, i) => `<div class="bar ${iso(d) === tIso ? 'today' : ''}"><small>${totals[i] ? Math.round(totals[i]) : ''}</small><i style="height:${(totals[i] / max) * 80}%"></i><b>${DIAS[i]}</b></div>`).join('')}</div>
      </div>
      <div class="card"><h3>Por categoria</h3>${catsHtml(cur)}</div>
      <div class="card"><h3>Gastos da semana</h3>${listHtml([...cur].sort((a, b) => (b.date + b.created).localeCompare(a.date + a.created)), true)}</div>`;
    bindList();
  }

  function month() {
    const today = new Date();
    const ms = new Date(today.getFullYear(), today.getMonth(), 1), me = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const pms = new Date(today.getFullYear(), today.getMonth() - 1, 1), pme = new Date(today.getFullYear(), today.getMonth(), 0);
    const cur = inRange(iso(ms), iso(me)), prev = inRange(iso(pms), iso(pme));
    const media = sum(cur) / today.getDate();
    const projecao = media * me.getDate();
    view.innerHTML = `
      <div class="card"><h3>${MESES[today.getMonth()]} de ${today.getFullYear()}</h3><p class="big">${money(sum(cur))}</p>${deltaHtml(sum(cur), sum(prev), 'mês passado')}
        <p class="delta">Média de ${money(media)} por dia · projeção ${money(projecao)}</p></div>
      <div class="card"><h3>Por categoria</h3>${catsHtml(cur)}</div>
      <div class="card"><h3>Maiores gastos</h3>${listHtml([...cur].sort((a, b) => b.value - a.value).slice(0, 5), true)}</div>`;
    bindList();
  }

  function historyView() {
    const sorted = [...items].sort((a, b) => (b.date + b.created).localeCompare(a.date + a.created));
    if (!sorted.length) { view.innerHTML = `<div class="card"><p class="empty">Nenhum gasto ainda. Toque no microfone no Início.</p></div>`; return; }
    let html = '', lastDay = '';
    for (const x of sorted) {
      if (x.date !== lastDay) {
        if (lastDay) html += '</ul>';
        lastDay = x.date;
        html += `<p class="day-head">${dayLabel(x.date)} · ${money(sum(sorted.filter(y => y.date === x.date)))}</p><ul class="list">`;
      }
      html += itemHtml(x, false);
    }
    view.innerHTML = `<div class="card">${html}</ul></div>`;
    bindList();
  }

  function dayLabel(d) {
    const t = todayIso(), y = iso(addDays(new Date(), -1));
    if (d === t) return 'Hoje';
    if (d === y) return 'Ontem';
    const dt = parseIso(d);
    return `${DIAS[(dt.getDay() + 6) % 7]}, ${dt.getDate()} de ${MESES[dt.getMonth()].slice(0, 3)}`;
  }
  function deltaHtml(cur, prev, label) {
    if (!prev) return `<p class="delta">Sem dados de ${label}</p>`;
    const pct = Math.round(((cur - prev) / prev) * 100);
    return `<p class="delta ${pct > 0 ? 'up' : 'down'}">${pct > 0 ? '▲' : '▼'} ${Math.abs(pct)}% vs ${label} (${money(prev)})</p>`;
  }
  function catsHtml(arr) {
    const cats = byCat(arr);
    if (!cats.length) return '<p class="empty">Nada por aqui ainda.</p>';
    const total = sum(arr);
    return `<ul class="cats">${cats.map(([id, v]) => `<li><div class="line"><span>${CATS[id].emoji} ${CATS[id].nome}</span><span>${money(v)} · ${Math.round((v / total) * 100)}%</span></div><div class="track"><div class="fill" style="width:${(v / total) * 100}%"></div></div></li>`).join('')}</ul>`;
  }
  function listHtml(arr, showDate) {
    if (!arr.length) return '<p class="empty">Nada por aqui ainda.</p>';
    return `<ul class="list">${arr.map(x => itemHtml(x, showDate)).join('')}</ul>`;
  }
  function itemHtml(x, showDate) {
    const c = CATS[x.cat] || CATS.outros;
    return `<li data-id="${x.id}"><div class="emoji">${c.emoji}</div><div class="info"><div class="place">${esc(x.place || c.nome)}</div><div class="sub">${c.nome}${showDate ? ' · ' + dayLabel(x.date) : ''}</div></div><div class="amt">${money(x.value)}</div></li>`;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function bindList() { document.querySelectorAll('.list li[data-id]').forEach(li => li.onclick = () => openEdit(items.find(x => x.id === li.dataset.id))); }

  // ---------- Overlays ----------
  function show(s) { $(s).classList.remove('hidden'); }
  function hide(s) { $(s).classList.add('hidden'); }
  let toastTimer;
  function toast(msg, err) {
    const t = $('#toast');
    t.textContent = msg; t.classList.toggle('err', !!err); t.classList.remove('hidden');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.add('hidden'), 2800);
  }

  $('#f-cat').innerHTML = Object.entries(CATS).map(([id, c]) => `<option value="${id}">${c.emoji} ${c.nome}</option>`).join('');

  let editing = null;
  function openConfirm(parsed, title) {
    editing = null;
    $('#confirm-title').textContent = title || 'Confirmar gasto';
    $('#f-value').value = parsed.value != null ? parsed.value : '';
    $('#f-place').value = parsed.place || '';
    $('#f-cat').value = parsed.cat || 'outros';
    $('#f-date').value = parsed.date || todayIso();
    $('#f-delete').classList.add('hidden');
    show('#confirm');
    if (parsed.value == null) setTimeout(() => $('#f-value').focus(), 50);
  }
  function openEdit(x) {
    if (!x) return;
    openConfirm(x, 'Editar gasto');
    editing = x;
    $('#f-delete').classList.remove('hidden');
  }
  $('#f-cancel').onclick = () => hide('#confirm');
  $('#f-delete').onclick = () => { items = items.filter(x => x.id !== editing.id); save(); hide('#confirm'); toast('Apagado'); render(); };
  $('#f-save').onclick = () => {
    const value = parseFloat($('#f-value').value);
    if (!(value > 0)) { toast('Informe um valor', true); return; }
    const place = $('#f-place').value.trim(), cat = $('#f-cat').value, date = $('#f-date').value || todayIso();
    if (place) { learned[normalize(place)] = cat; saveLearn(); }
    if (editing) Object.assign(editing, { value, place, cat, date });
    else items.push({ id: uid(), value, place, cat, date, created: Date.now() });
    save(); hide('#confirm');
    toast(`Anotado: ${money(value)}${place ? ' · ' + place : ''}`);
    render();
  };

  // Entrada rápida: salva direto se entendeu o valor, senão pede confirmação
  function quickAdd(text) {
    const p = parse(text);
    if (p.value > 0) {
      const item = { id: uid(), value: p.value, place: p.place, cat: p.cat, date: todayIso(), created: Date.now() };
      items.push(item); save(); render();
      toast(`Anotado: ${money(p.value)}${p.place ? ' · ' + p.place : ''} · ${CATS[p.cat].nome} (toque para corrigir)`);
      $('#toast').onclick = () => { hide('#toast'); openEdit(item); };
    } else {
      openConfirm({ value: null, place: p.place || text, cat: p.cat }, 'Não entendi o valor');
    }
  }

  function openType() { $('#t-text').value = ''; show('#typein'); setTimeout(() => $('#t-text').focus(), 50); }
  $('#t-cancel').onclick = () => hide('#typein');
  $('#t-ok').onclick = () => { const v = $('#t-text').value.trim(); hide('#typein'); if (v) quickAdd(v); };
  $('#t-text').addEventListener('keydown', e => { if (e.key === 'Enter') $('#t-ok').click(); });

  // ---------- Voz ----------
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null;
  function startVoice() {
    if (!SR) { toast('Voz não disponível aqui. Use o atalho da Siri (veja ?) ou digite.', true); openType(); return; }
    rec = new SR(); rec.lang = 'pt-BR'; rec.interimResults = true; rec.maxAlternatives = 1;
    let finalText = '';
    $('#rec-text').textContent = ''; $('#rec-status').textContent = 'Ouvindo…'; show('#rec');
    rec.onresult = e => {
      let s = '';
      for (const r of e.results) s += r[0].transcript;
      $('#rec-text').textContent = s;
      if (e.results[e.results.length - 1].isFinal) finalText = s;
    };
    rec.onerror = e => { hide('#rec'); if (e.error !== 'aborted' && e.error !== 'no-speech') toast('Erro no microfone: ' + e.error, true); };
    rec.onend = () => { hide('#rec'); const t = finalText || $('#rec-text').textContent; if (t.trim()) quickAdd(t); };
    try { rec.start(); } catch (e) { hide('#rec'); toast('Não consegui iniciar o microfone', true); }
  }
  $('#rec-cancel').onclick = () => { if (rec) { rec.onend = null; rec.abort(); } hide('#rec'); };

  // ---------- Atalhos da Siri (URL ?t=...) ----------
  function handleUrl() {
    const u = new URL(location.href);
    const t = u.searchParams.get('t') || u.searchParams.get('texto');
    if (t) { history.replaceState(null, '', u.pathname); setTimeout(() => quickAdd(t), 100); }
  }

  // ---------- Ajuda / exportação ----------
  $('#btn-help').onclick = () => { $('#help-url').textContent = location.origin + location.pathname + '?t='; show('#help'); };
  $('#help-close').onclick = () => hide('#help');
  $('#btn-export').onclick = () => {
    const rows = [['data', 'valor', 'local', 'categoria'], ...items.map(x => [x.date, x.value.toFixed(2).replace('.', ','), x.place, CATS[x.cat].nome])];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'gastei.csv'; a.click();
  };

  // ---------- Tabs / init ----------
  document.querySelectorAll('.tabs button').forEach(b => b.onclick = () => { tab = b.dataset.tab; render(); });
  document.querySelectorAll('.overlay').forEach(o => o.addEventListener('click', e => { if (e.target === o && o.id !== 'rec') o.classList.add('hidden'); }));
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  render();
  handleUrl();

  window.__gastei = { parse };
})();

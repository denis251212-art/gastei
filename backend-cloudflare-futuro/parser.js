/* Gastei – parser compartilhado (app e worker) */
(function (root) {
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
    outros:      { nome: 'Outros', emoji: '💸', kw: [] },
    renda:       { nome: 'Renda', emoji: '💰', kw: [] }
  };
  const INCOME_WORDS = new Set(['ganhei', 'recebi', 'recebido', 'recebimento', 'entrou', 'entrada', 'caiu', 'salario', 'pagaram', 'receita', 'lucro', 'vendi', 'renda']);

  function normalize(s) { return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
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
  const STOP = new Set(['reais', 'real', 'conto', 'contos', 'pila', 'pau', 'centavo', 'centavos', 'gastei', 'gasto', 'paguei', 'comprei', 'foi', 'ganhei', 'recebi', 'recebido', 'entrou', 'entrada', 'caiu', 'pagaram', 'meu', 'minha', 'me', 'de', 'da', 'do', 'no', 'na', 'nos', 'nas', 'em', 'com', 'pra', 'pro', 'para', 'o', 'a', 'os', 'as', 'um', 'uma', 'hoje', 'agora', 'anota', 'anotar', 'grava', 'gravar', 'e', 'r$', 'rs']);
  const NUMRE = /^(\d{1,3}(?:\.\d{3})+|\d+)(?:[,.](\d{1,2}))?$/;

  function parse(textRaw, learned) {
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
    const type = norm.some(w => INCOME_WORDS.has(w)) ? "in" : "out";
    return { value, place, cat: type === "in" ? "renda" : guessCat(place, learned), type };
  }

  function guessCat(place, learned) {
    const p = normalize(place);
    if (!p) return 'outros';
    if (learned && learned[p]) return learned[p];
    for (const [id, c] of Object.entries(CATS)) {
      for (const k of c.kw) if (p.includes(normalize(k))) return id;
    }
    return 'outros';
  }
  const money = v => 'R$ ' + (Number(v) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  root.GasteiParser = { CATS, parse, guessCat, normalize, money };
})(typeof self !== 'undefined' ? self : globalThis);

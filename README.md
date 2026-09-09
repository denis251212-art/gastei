# Gastei

Fale o que gastou e o app organiza: "35 no mercado", "vinte reais de uber".
Resumo por dia, semana e mês. Funciona offline, sem conta e sem custo.
Os dados ficam só no seu celular.

## Rodar no computador (teste rápido)

```
cd C:\Users\denis\gastei
npx serve .
```

Abra o endereço que aparecer (ex.: http://localhost:3000) no Chrome.

## Colocar no ar de graça (GitHub Pages)

1. Crie uma conta em https://github.com (se ainda não tiver).
2. Crie um repositório chamado `gastei` (público).
3. Nesta pasta, rode:

```
git init
git add .
git commit -m "Gastei v1"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/gastei.git
git push -u origin main
```

4. No GitHub: Settings → Pages → Source: "Deploy from a branch" → Branch: `main` / `/ (root)` → Save.
5. Em 1 ou 2 minutos o app fica em `https://SEU_USUARIO.github.io/gastei/`.

## Instalar no iPhone

1. Abra o endereço acima no **Safari**.
2. Toque em **Compartilhar** → **Adicionar à Tela de Início**.
3. Pronto: ícone "Gastei" na tela inicial, abre em tela cheia.

## Atalho da Siri (falar sem abrir o app)

No app **Atalhos** do iPhone, crie um novo atalho chamado **Gastei** com 3 ações:

1. **Ditar Texto** — idioma Português (Brasil), parar de ouvir: após pausa.
2. **Codificar URL** — entrada: *Texto Ditado*.
3. **Abrir URLs** — `https://SEU_USUARIO.github.io/gastei/?t=` seguido da variável *Texto Codificado*.

Depois é só dizer **"E aí Siri, Gastei"**, falar o gasto e pronto.
O atalho também pode ir para a tela inicial, para um widget ou para o "toque nas costas" (Ajustes → Acessibilidade → Toque → Tocar Atrás).

## Passar para outras pessoas testarem

Mande o link. Cada pessoa instala pelo Safari do mesmo jeito. Os dados de cada uma ficam só no aparelho dela.

## Estrutura

- `index.html` — telas
- `style.css` — visual
- `app.js` — interpretação da frase, cálculos, resumos, voz, atalho
- `sw.js` + `manifest.json` — funcionamento offline e instalação
- `icon-*.png` — ícones

## Próximos passos (se der certo)

- Login e sincronização na nuvem (Supabase, grátis no início)
- Notificações de resumo semanal
- Publicar na App Store com Capacitor (exige conta Apple, US$ 99/ano)
- Plano grátis/pago (RevenueCat)

# Comandos npx Playwright

Referência dos principais comandos do Playwright via `npx`.

---

## Executar testes

| Comando | Descrição |
|--------|-----------|
| `npx playwright test` | Roda todos os testes |
| `npx playwright test tests/e2e/Login.spec.js` | Roda um arquivo específico |
| `npx playwright test -g "nome do teste"` | Roda testes cujo nome contém o texto |
| `npx playwright test --project=chromium` | Roda só no projeto (browser) chromium |
| `npx playwright test --headed` | Roda com o navegador visível |
| `npx playwright test --ui` | Abre a interface gráfica do Playwright |
| `npx playwright test --debug` | Roda em modo debug (passo a passo) |
| `npx playwright test --reporter=line` | Usa reporter em linha |
| `npx playwright test --reporter=line,allure-playwright` | Line + Allure (ex.: CI) |

---

## Relatórios

| Comando | Descrição |
|--------|-----------|
| `npx playwright show-report` | Abre o relatório HTML da última execução |

---

## Instalação de browsers

| Comando | Descrição |
|--------|-----------|
| `npx playwright install` | Instala os browsers usados pelos testes |
| `npx playwright install chromium` | Instala só o Chromium |
| `npx playwright install --with-deps` | Instala browsers + dependências do sistema (útil em Linux/CI) |
| `npx playwright install --with-deps chromium` | Chromium + deps (ex.: GitHub Actions) |

---

## Ferramentas

| Comando | Descrição |
|--------|-----------|
| `npx playwright codegen [url]` | Abre o Codegen para gravar ações e gerar código |

---

## Resumo rápido (npm scripts do projeto)

No `package.json` você já tem:

- `npm test` ou `npm run test` → `playwright test`
- `npm run test:allure` → `playwright test` (com Allure)
- `npm run allure:generate` → gera relatório Allure
- `npm run allure:open` → abre relatório Allure no navegador

Para usar os comandos acima com `npx`, troque `playwright test` por `npx playwright test` quando rodar direto no terminal.

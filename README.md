# Automação E2E BDD com Cucumber e Allure Report

Projeto de automação de testes E2E em **BDD (Behavior Driven Development)** estruturado em **português**, com integração total ao **Allure Report**, usando **Playwright** e **Page Objects**.

> **Documentação completa:** [docs/DOCUMENTACAO-PROJETO.md](docs/DOCUMENTACAO-PROJETO.md) — visão do projeto inteiro, arquitetura e como cada parte foi aplicada.

## Estrutura do projeto

```
├── features/                    # Cenários BDD (Gherkin em português)
│   ├── autenticacao.feature    # Login, logout, cadastro de usuário
│   ├── produtos.feature        # CRUD de produtos
│   ├── support/                # Hooks e World (isolamento por cenário)
│   │   ├── hooks.js            # Before, After, AfterStep (screenshot + Allure)
│   │   └── world.js            # World com Playwright (page por cenário)
│   └── step_definitions/       # Steps reutilizáveis
│       ├── login.steps.js
│       └── produtos.steps.js
├── pages/                      # Page Objects
│   ├── LoginPage.js
│   └── ProdutoPage.js
├── helpers/                    # Helpers compartilhados (Allure, dados, arquivos)
│   ├── allureScreenshot.js     # Screenshot + anexo Allure padronizado
│   ├── dataGenerator.js       # Geração de usuário (Faker)
│   └── fileManager.js         # Salvar/ler usuário (test-data/createdUser.json)
├── cucumber.mjs                # Configuração do Cucumber + Allure
└── playwright.config.js       # Config Playwright (specs legados, se mantidos)
```

## Requisitos

- Node.js 18+
- npm (ou yarn/pnpm)
- Java (para Allure CLI, ao gerar/abrir relatório)

## Instalação

```bash
npm ci
npx playwright install chromium
```

## Executar testes BDD

O relatório Allure **oficial** considera apenas os **14 cenários BDD** (Cucumber). Os resultados do Cucumber vão para `allure-results/`. Os specs Playwright (`npm run test`) gravam em `allure-results-playwright/` para não misturar com o relatório BDD.

```bash
# Rodar todos os cenários BDD (gera allure-results/)
npm run test:bdd

# Gerar e abrir relatório Allure (apenas cenários BDD)
npm run allure:generate
npm run allure:open

# Ou em um comando (serve + abre no navegador)
npm run allure:serve
```

> **Dica:** Se o relatório mostrar mais de 14 cenários, apague a pasta `allure-results/` e rode de novo só `npm run test:bdd` antes de `npm run allure:generate`.

## Comportamento por step

- **Cada step** gera:
  - Screenshot (full page)
  - Anexo no Allure com nome padronizado: `Evidência - <texto do step>`
  - Arquivo salvo em `screenshots/` com nome único

- **Em caso de falha**:
  - Screenshot automático com nome `Evidência - Falha - <nome do cenário>`
  - Anexado ao Allure no relatório

- **Isolamento de cenário**:
  - Um novo browser/context/page por cenário (World do Cucumber)
  - Nenhum estado compartilhado entre cenários

## Page Objects

Os steps utilizam apenas os Page Objects em `pages/`, sem lógica de tela nos steps:

- **LoginPage** (`pages/LoginPage.js`): login, cadastro de usuário, validações de login, logout.
- **ProdutoPage** (`pages/ProdutoPage.js`): listagem, cadastro, edição, exclusão de produtos.

### Cobertura BDD vs specs legados

| Spec legado | Feature BDD | Cenários |
|-------------|-------------|----------|
| `tests/e2e/Login.spec.js` | `features/autenticacao.feature` | 6 cenários (criar usuário, login com usuário salvo, credenciais inválidas, campos obrigatórios, e-mail inválido, logout e bloqueio) |
| `tests/e2e/produtos.spec.js` | `features/produtos.feature` | Cadastro, listagem, edição, exclusão e validações |

A execução principal do projeto é **BDD** (`npm run test:bdd`). Os specs em `tests/e2e/` são legado e mantidos para referência ou `npm run test`.

## Ordem recomendada na primeira execução

1. **Criar usuário**: o cenário *Criar usuário com sucesso* grava credenciais em `test-data/createdUser.json`.
2. **Cenários de login** e **produtos** que usam “usuário salvo” ou “listagem com produtos” dependem desse passo (ou de execuções anteriores que criaram usuário/produto).

Para cenários *Editar* e *Excluir* produto, é necessário haver pelo menos um produto na lista (por exemplo, rodar antes o cenário *Cadastrar produto com sucesso*).

## Scripts npm

| Script            | Descrição                                      |
|-------------------|-------------------------------------------------|
| `npm run test:bdd`| Executa Cucumber (BDD) e gera `allure-results/` |
| `npm run allure:generate` | Gera HTML do Allure em `allure-report/`  |
| `npm run allure:open`     | Abre o relatório Allure no navegador     |
| `npm run allure:serve`   | Gera e abre o relatório em um passo      |
| `npm run test`            | Playwright (specs em `tests/e2e/`, modo legado)|

## CI/CD

O workflow em `.github/workflows/playwright.yml` executa os testes BDD com Cucumber, gera o Allure Report e publica em GitHub Pages. Os resultados ficam em `allure-results/` e o relatório é gerado com `allure generate`.

## Boas práticas aplicadas

- **BDD real**: Gherkin em português, steps reutilizáveis, sem duplicação.
- **Evidência por step**: screenshot + anexo Allure com nome padronizado.
- **Falha**: screenshot automático em caso de erro.
- **Isolamento**: um browser/page por cenário.
- **Page Object**: toda interação com a UI nos pages; steps apenas orquestram.
- **Código desacoplado**: helpers em `helpers/`, steps por domínio, Page Objects em `pages/`.

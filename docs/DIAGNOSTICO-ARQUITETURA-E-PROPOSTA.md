# Diagnóstico de Arquitetura e Proposta de Reestruturação

**Papel:** Arquiteto de automação de testes sênior  
**Escopo:** Varredura completa da estrutura atual, problemas, boas práticas e proposta enterprise sem alteração de código.

---

## 1. Estrutura atual mapeada

```
new_automation/
├── .cursor/                    # Configuração do editor (worktrees.json)
├── .git/
├── .github/workflows/
│   └── playwright.yml
├── allure-report/              # Relatório Allure gerado (HTML)
├── allure-results/             # Resultados Cucumber → Allure
├── docs/                       # 6 arquivos .md
├── Evidencia do git/           # Pasta local (allure-report copiado + zip)
├── features/
│   ├── autenticacao.feature
│   ├── produtos.feature
│   ├── step_definitions/
│   │   ├── login.steps.js
│   │   └── produtos.steps.js
│   └── support/
│       ├── hooks.js
│       └── world.js
├── fixtures/                   # VAZIA (raiz)
├── node_modules/
├── pages/
│   ├── LoginPage.js
│   └── produtoPage.js
├── playwright-report/          # Relatório HTML Playwright
├── screenshots/                # Screenshots por step (gerados)
├── support/                    # Raiz – apenas allureScreenshot.js
│   └── allureScreenshot.js
├── test-data/
│   ├── createdUser.json        # Gerado em runtime
│   ├── invalid-upload.txt      # Asset de teste (deveria ser versionado?)
│   └── fixtures/               # Esperado por produtos.spec.js (sample.png)
├── test-results/               # Resultados Playwright
├── tests/
│   └── e2e/
│       ├── Login.spec.js
│       └── produtos.spec.js
├── utils/
│   ├── dataGenerator.js
│   └── fileManager.js
├── .gitignore
├── cucumber.mjs
├── jsconfig.json
├── package.json
├── package-lock.json
├── playwright.config.js
└── README.md
```

---

## 2. Análise por dimensão

### 2.1 Organização de pastas

| Aspecto | Situação | Problema |
|--------|----------|----------|
| **Raiz** | Muitas pastas no mesmo nível (features, tests, support, pages, utils, fixtures, test-data, docs, allure-*, playwright-*, screenshots, test-results) | Mistura de código-fonte, artefatos gerados e config; difícil onboarding. |
| **BDD** | `features/` com features + step_definitions + support | Padrão Cucumber aceitável; porém `support` do Cucumber convive com `support/` na raiz com papel diferente. |
| **Page Objects** | `pages/` na raiz | OK; mas apenas 2 arquivos e um com nome inconsistente (`produtoPage.js` vs convenção PascalCase para classe). |
| **Helpers** | `support/allureScreenshot.js` na raiz; `utils/` para dados e arquivos | Dois conceitos (support vs utils) sem critério claro: “suporte de framework/relatório” vs “utilitários de domínio”. |
| **Dados de teste** | `test-data/` na raiz com arquivo gerado e asset; `test-data/fixtures` referenciado no spec | test-data mistura runtime (createdUser.json) com fixtures (invalid-upload.txt, sample.png); pasta `fixtures/` na raiz vazia e não usada. |
| **Relatórios** | `allure-results/`, `allure-report/`, `playwright-report/`, `test-results/`, `screenshots/` na raiz | Todos artefatos de execução na raiz poluem o repositório visual e podem ser commitados por engano se .gitignore falhar. |

**Conclusão:** Falta hierarquia clara (ex.: tudo que é “código de automação” dentro de um prefixo comum) e separação explícita entre **código**, **dados de teste versionados**, **fixtures** e **artefatos gerados**.

---

### 2.2 Separação de responsabilidades

| Camada | Onde está | Responsabilidade | Avaliação |
|--------|-----------|------------------|-----------|
| **Gherkin** | features/*.feature | Especificação de comportamento | OK. |
| **Steps** | features/step_definitions/*.steps.js | Ponte Gherkin → Page Objects / helpers | OK; steps importam pages e utils diretamente com caminhos relativos `../../`. |
| **Hooks / World** | features/support/hooks.js, world.js | Ciclo de vida Cucumber, browser por cenário, Allure | OK; porém hooks dependem de `../../support/allureScreenshot.js` (acoplamento a pasta raiz). |
| **Allure (helper)** | support/allureScreenshot.js | Screenshot + anexo Allure | Responsabilidade única; mas “support” na raiz é ambíguo (Cucumber vs projeto). |
| **Page Objects** | pages/ | Interação com a UI | OK; reutilizados por BDD e specs. |
| **Dados / arquivos** | utils/fileManager.js, dataGenerator.js | Usuário fake, salvar/ler createdUser | fileManager usa caminho relativo `./test-data` (depende de CWD). |
| **Specs Playwright** | tests/e2e/*.spec.js | Testes em código (legado) | Duplicam cenários das features; têm helper local (takeScreenshotAndAttach, loginAndGoToAdmin) não reutilizado. |

**Problemas:**  
- **Acoplamento de caminhos:** `features/support/hooks.js` → `../../support/`; `fileManager` → `./test-data`; steps → `../../pages/`, `../../utils/`. Qualquer movimentação de pastas exige atualização em vários arquivos.  
- **Duplicação de lógica:** Screenshot/attach nos specs vs Allure nos steps; login “com usuário salvo” repetido nos specs.  
- **Convenção de nome do Page:** Arquivo `produtoPage.js` (camelCase) exporta `ProdutoPage`; em ambientes case-sensitive (CI Linux) o import `ProdutoPage.js` em `produtos.spec.js` pode falhar.

---

### 2.3 Duplicidade de diretórios (support, fixtures, tests)

- **support (2 pastas)**  
  - **features/support/** – World + hooks do Cucumber (carregados pelo cucumber.mjs). Papel: ciclo de vida e contexto do BDD.  
  - **support/** (raiz) – apenas `allureScreenshot.js`. Papel: helper de relatório usado pelos hooks.  
  **Problema:** Dois “support” com significados diferentes gera confusão; quem lê “support” não sabe se é do Cucumber ou do projeto. Boa prática: um único conceito de “suporte” ou nomes distintos (ex.: `features/support` para Cucumber e `lib/` ou `helpers/` para o resto).

- **fixtures**  
  - **fixtures/** na raiz: vazia, não referenciada em nenhum import.  
  - **test-data/fixtures/** (ou path `test-data/fixtures/sample.png`): referenciado em `produtos.spec.js` para imagem válida.  
  **Problema:** Pasta `fixtures/` na raiz é morta; fixtures reais estão em `test-data` ou no path esperado pelo spec. Padrão enterprise costuma ter uma única pasta de fixtures (ou `test-data/fixtures` ou `fixtures/`) com assets versionados, e outra para dados gerados (ex.: `test-data/output` ou não versionada).

- **tests**  
  - **tests/e2e/** – apenas specs Playwright. Cucumber não usa `tests/`; usa `features/`.  
  **Problema:** Dois “tipos” de teste (BDD por features, Playwright por specs) sem pasta comum que deixe explícito: “tudo que é execução E2E está aqui”. Opções: manter `tests/e2e` para specs e considerar `features` como “testes BDD” com documentação clara, ou unificar sob algo como `e2e/features` e `e2e/specs` (depende da proposta).

---

### 2.4 Convivência Playwright puro x Cucumber

| Aspecto | Situação |
|---------|----------|
| **Execução** | BDD: `cucumber-js` (cucumber.mjs). Playwright: `playwright test` (playwright.config.js, testDir: `./tests`). |
| **Relatório** | Cucumber → allure-results (allure-cucumberjs). Playwright → allure-results-playwright (allure-playwright). Pasta única de resultados do BDD evita mistura (já corrigido). |
| **Reuso** | Page Objects e utils são compartilhados. Hooks/Allure só no BDD; specs têm lógica própria de screenshot/attach. |
| **Dados** | Ambos usam test-data (createdUser, invalid-upload.txt); spec ainda espera test-data/fixtures/sample.png. |
| **Config** | baseURL e browser apenas em playwright.config (Playwright); World do Cucumber usa variável de ambiente HEADLESS e BASE_URL. Duplicação de base URL (config vs World). |

**Problemas:**  
- Duplicação de cenários (mesmo fluxo em .feature e em .spec) aumenta manutenção e risco de divergência.  
- Dois runners, dois relatórios (Allure BDD vs Allure Playwright), duas formas de ver evidência.  
- Sem convenção clara de “fonte da verdade”: BDD ou specs. Documentação diz que BDD é principal e specs são legado, mas estrutura não deixa isso óbvio (ex.: não há `e2e/bdd` vs `e2e/specs`).

**Recomendação de princípio:** Definir uma única “fonte da verdade” (recomendado: BDD). Specs podem ser mantidos para smoke rápido ou migração gradual, mas com estrutura e docs que deixem explícito que são secundários.

---

### 2.5 Estrutura do Allure

- **Geração:** Cucumber grava em `allure-results/`; `allure generate ./allure-results --clean -o allure-report`.  
- **Playwright** grava em `allure-results-playwright/` (já separado).  
- **Conteúdo:** allure-results contém *-result.json e *-attachment; allure-report é HTML gerado.

**Problemas:**  
- Pastas na raiz; em padrão enterprise é comum concentrar relatórios em um único diretório, por exemplo `reports/allure-results` e `reports/allure-report`, para manter a raiz limpa e facilitar CI (upload de `reports/`).  
- Nenhum arquivo de config do Allure (categories, environment) foi encontrado; pode ser desejável para categorizar falhas e exibir ambiente no relatório.

---

### 2.6 Pastas/arquivos que não deveriam estar versionados

Conferência com `.gitignore` atual:

| Item | No .gitignore? | Deve ser ignorado? |
|------|----------------|--------------------|
| node_modules/ | Sim | Sim. |
| test-results/ | Sim (/test-results/) | Sim. |
| playwright-report/ | Sim | Sim. |
| blob-report/ | Sim | Sim. |
| playwright/.cache/, .auth/ | Sim | Sim. |
| screenshots/ | Sim | Sim (gerados). |
| test-data/ | Sim | **Parcial:** createdUser.json não deve ir; invalid-upload.txt e test-data/fixtures/sample.png são assets e **deveriam** ser versionados. Ignorar toda a pasta impede versionar fixtures. |
| allure-results/ | Sim | Sim. |
| allure-results-playwright/ | Sim | Sim. |
| allure-report/ | Sim | Sim. |
| comandos-playwright/, como-ver-relatorio-github/ | Sim | Sim (se forem pastas locais). |
| .cursor/ | **Não** | Recomendado ignorar em contexto enterprise (preferências de IDE). |
| Evidencia do git/ | **Não** | Deve ser ignorada (evidência local). |
| fixtures/ (raiz, vazia) | Não | Pode ser ignorada ou removida; se for preenchida com gerados, ignorar. |
| playwright-report/ | Sim | Sim. |

**Problema crítico:** `test-data/` está totalmente no .gitignore. Assim, `invalid-upload.txt` e `test-data/fixtures/sample.png` não são versionados; em clone novo o cenário de “imagem inválida” e “imagem válida” pode quebrar. Boa prática: ignorar apenas arquivos gerados (ex.: `test-data/createdUser.json` ou `test-data/**/createdUser.json`) e versionar o resto de test-data.

---

### 2.7 Arquivos temporários ou gerados automaticamente

- **Gerados em execução:** allure-results/*, allure-report/*, allure-results-playwright/*, playwright-report/*, test-results/*, screenshots/*, test-data/createdUser.json.  
- **Locais/evidência:** Evidencia do git/.  
- **Vazios/órfãos:** fixtures/ (raiz).

Todos os gerados já estão (ou devem estar) no .gitignore; a raiz não deveria conter pastas de evidência local (Evidencia do git) versionadas.

---

## 3. Violações de boas práticas (resumo)

1. **Dois “support”** com significados diferentes (Cucumber vs helper de relatório).  
2. **Fixtures fragmentados:** pasta `fixtures/` vazia; uso em `test-data/fixtures` e path em spec; test-data inteiro no .gitignore impede versionar assets.  
3. **Caminhos relativos frágeis:** `../../support`, `./test-data`, `../../pages`; qualquer reestruturação quebra imports.  
4. **Inconsistência de nome do Page:** `produtoPage.js` vs import `ProdutoPage.js` (risco em CI case-sensitive).  
5. **Base URL e config duplicados** entre playwright.config e World (env BASE_URL).  
6. **Artefatos e relatórios na raiz** em vez de um diretório único (ex.: reports/).  
7. **Duplicação de cenários e helpers** entre BDD e specs (screenshot, login com usuário salvo).  
8. **.gitignore amplo em test-data** impedindo versionar fixtures necessários aos testes.

---

## 4. Proposta de nova arquitetura (enterprise)

Objetivos:  
- Uma hierarquia clara: código de automação, dados versionados, fixtures, relatórios/artefatos.  
- Separação explícita: BDD (features/steps/hooks), Page Objects, helpers, relatórios, dados de teste.  
- Eliminar duplicidade de conceito (support, fixtures).  
- Facilitar CI e onboarding.

### 4.1 Árvore proposta

```
new_automation/
├── .github/
│   └── workflows/
│       └── playwright.yml
├── docs/
│   └── (todos os .md)
├── project/
│   ├── config/
│   │   ├── cucumber.mjs
│   │   ├── playwright.config.js
│   │   └── jsconfig.json          # ou na raiz, conforme convenção
│   └── package.json / package-lock.json  # ou manter na raiz (padrão npm)
├── src/                           # Código de automação (fonte)
│   ├── bdd/
│   │   ├── features/
│   │   │   ├── autenticacao.feature
│   │   │   ├── produtos.feature
│   │   │   ├── step_definitions/
│   │   │   │   ├── login.steps.js
│   │   │   │   └── produtos.steps.js
│   │   │   └── support/
│   │   │       ├── hooks.js
│   │   │       └── world.js
│   │   └── (cucumber carrega de src/bdd/features)
│   ├── pages/
│   │   ├── LoginPage.js
│   │   └── ProdutoPage.js         # Renomear para PascalCase
│   ├── helpers/
│   │   ├── allureScreenshot.js
│   │   ├── fileManager.js
│   │   └── dataGenerator.js
│   └── e2e/                       # Specs Playwright (legado/opcional)
│       ├── Login.spec.js
│       └── produtos.spec.js
├── test-data/                     # Dados e assets de teste (versionados)
│   ├── fixtures/
│   │   ├── invalid-upload.txt
│   │   └── sample.png
│   └── .gitkeep                  # (opcional; ou manter pasta vazia versionada)
├── reports/                       # Todos os artefatos de execução (não versionados)
│   ├── allure-results/
│   ├── allure-report/
│   ├── allure-results-playwright/
│   ├── playwright-report/
│   ├── test-results/
│   └── screenshots/
├── .gitignore
└── README.md
```

**Alternativa mais conservadora (menos mudança de pasta):**  
Manter features, pages, tests na raiz; apenas:  
- Unificar “support” em um único conceito: por exemplo renomear `support/` (raiz) para `helpers/` e mover `utils/` para dentro de `helpers/` (ou manter `utils` e deixar apenas `support` = helpers de framework).  
- Remover pasta `fixtures/` vazia; adotar `test-data/fixtures/` como único lugar para assets.  
- Criar `reports/` e redirecionar todos os outputs (allure, playwright-report, test-results, screenshots) para dentro de `reports/`.  
- Ajustar .gitignore para não ignorar `test-data/` inteiro; ignorar apenas `test-data/createdUser.json` (e equivalentes gerados).  
- Renomear `produtoPage.js` → `ProdutoPage.js` e padronizar imports.

Decisão entre “árvore completa em src/” vs “ajustes pontuais” depende do apetite a refatoração e de convenções da empresa.

### 4.2 Separação clara de responsabilidades

| Responsabilidade | Localização proposta | Motivo |
|------------------|----------------------|--------|
| BDD (features + steps + hooks + world) | src/bdd/features/ (ou manter features/) | Cucumber espera paths em config; manter tudo sob features/ ou sob src/bdd/features. |
| Page Objects | src/pages/ | Única camada de UI; reutilizada por BDD e specs. |
| Hooks (Cucumber) | src/bdd/features/support/ (ou features/support/) | Carregados pelo cucumber.mjs; não misturar com helpers gerais. |
| Helpers (Allure, arquivo, dados) | src/helpers/ (ex.: allureScreenshot, fileManager, dataGenerator) | Um único lugar para “código de suporte” que não é Page nem step. |
| Relatórios e artefatos | reports/* | Um único ponto de saída; .gitignore em reports/ ou em cada subpasta. |
| Dados de teste versionados | test-data/fixtures/ | Assets (sample.png, invalid-upload.txt) versionados; createdUser.json gerado e ignorado. |
| Configuração | Raiz ou project/config/ | cucumber.mjs, playwright.config.js; paths atualizados para a nova estrutura. |

### 4.3 O que deve ir para .gitignore (recomendado)

```
# Dependências e cache
node_modules/

# Relatórios e artefatos (todos sob reports/ na proposta)
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/
/playwright/.auth/
reports/
# Ou, se manter na raiz:
# allure-results/
# allure-results-playwright/
# allure-report/
# screenshots/

# Dados gerados em runtime (não fixtures)
test-data/createdUser.json

# Opcional: IDE / evidência local
.cursor/
Evidencia do git/
/comandos-playwright/
/como-ver-relatorio-github/
```

Não ignorar: `test-data/` inteiro; ignorar apenas arquivos gerados dentro de test-data para permitir versionar fixtures.

---

## 5. Plano de migração (sem quebrar testes)

Ordem sugerida, com validação após cada passo.

### Fase 1 – Baixo risco (config e artefatos)

1. **Criar `reports/` e redirecionar saídas**  
   - Em `cucumber.mjs`: `formatOptions.resultsDir: 'reports/allure-results'`.  
   - Em `playwright.config.js`: `outputFolder: 'reports/allure-results-playwright'`; `reporter: ['html', { outputFolder: 'reports/playwright-report' }]` se suportado; ou variável de ambiente para test-results/screenshots.  
   - Atualizar scripts npm e CI: `allure generate ./reports/allure-results --clean -o reports/allure-report`, etc.  
   - **Validar:** Rodar `npm run test:bdd` e `npm run allure:serve` (apontando para reports/); conferir relatório.

2. **Ajustar .gitignore**  
   - Remover `test-data/` da lista; adicionar `test-data/createdUser.json`.  
   - Adicionar `reports/` (e remover entradas antigas de allure-results, playwright-report, etc., se tudo estiver em reports/).  
   - Adicionar `.cursor/` e `Evidencia do git/` se desejado.  
   - **Validar:** Garantir que test-data/fixtures (e invalid-upload.txt) possam ser commitados; createdUser.json não aparece no git.

3. **Remover pasta `fixtures/` vazia** (raiz)  
   - Ou adicionar ao .gitignore se for mantida para uso futuro.  
   - **Validar:** Nenhum import referencia `fixtures/` na raiz.

### Fase 2 – Naming e dados

4. **Padronizar Page Object**  
   - Renomear `pages/produtoPage.js` → `pages/ProdutoPage.js`.  
   - Atualizar todos os imports para `ProdutoPage.js` (steps e specs).  
   - **Validar:** `npm run test:bdd` e `npm run test` (Playwright) em ambiente case-sensitive se possível (CI).

5. **Organizar test-data**  
   - Garantir que `test-data/fixtures/` exista com `invalid-upload.txt` e `sample.png` (ou criar sample.png mínimo se necessário).  
   - Atualizar `utils/fileManager.js` para usar path absoluto baseado em `process.cwd()` ou `import.meta.url` para `test-data/createdUser.json`.  
   - **Validar:** Cenário de cadastro com imagem e cenário de arquivo inválido (BDD e spec) passando.

### Fase 3 – Estrutura de código (opcional)

6. **Unificar helpers**  
   - Criar `helpers/` na raiz (ou sob `src/helpers/` na proposta completa).  
   - Mover `support/allureScreenshot.js` → `helpers/allureScreenshot.js`.  
   - Mover `utils/fileManager.js` e `utils/dataGenerator.js` → `helpers/` (ou manter utils e só renomear support → helpers).  
   - Atualizar imports em `features/support/hooks.js` e em step_definitions (fileManager, dataGenerator).  
   - **Validar:** `npm run test:bdd` e relatório Allure com evidências.

7. **(Opcional) Reestruturação em src/**  
   - Se for adotada a árvore com `src/bdd`, `src/pages`, `src/helpers`, `src/e2e`:  
     - Mover features, pages, helpers, specs para src conforme proposta.  
     - Atualizar `cucumber.mjs`: paths e import para `src/bdd/features/**/*.feature`, `src/bdd/features/support/*.js`, `src/bdd/features/step_definitions/**/*.js`.  
     - Atualizar `playwright.config.js`: testDir para `src/e2e` (ou equivalente).  
     - Ajustar todos os imports relativos (ex.: steps → `../../../pages/`, `../../../helpers/`).  
   - **Validar:** BDD e Playwright rodando; relatório Allure e artefatos em reports/.

### Fase 4 – CI e documentação

8. **Atualizar CI**  
   - Workflow usar paths de reports/ e comandos allure generate/open conforme nova estrutura.  
   - **Validar:** Pipeline verde e artefato de relatório publicado.

9. **Atualizar documentação**  
   - README e docs em docs/ com nova árvore, comandos e convenções (BDD como fonte da verdade, specs como legado, onde ficam relatórios e test-data).

---

## 6. Decisões técnicas resumidas

| Decisão | Motivo |
|---------|--------|
| Diretório único `reports/` para todos os artefatos | Raiz limpa; CI faz upload de uma pasta; .gitignore simples. |
| Não ignorar `test-data/` inteiro; ignorar só arquivos gerados | Fixtures (invalid-upload.txt, sample.png) devem ser versionados para reprodutibilidade. |
| Renomear `produtoPage.js` → `ProdutoPage.js` | Consistência com nome da classe e compatibilidade com sistemas de arquivo case-sensitive. |
| Unificar “support” em um único conceito (ex.: helpers para relatório e utils) | Reduz confusão entre “support do Cucumber” e “support do projeto”. |
| Manter BDD como fonte da verdade e specs como legado | Reduz duplicação de cenários e alinha com documentação atual; evolução futura pode deprecar specs ou gerá-los a partir das features. |
| Config de Allure (resultsDir) e Playwright (outputFolder) apontando para reports/ | Centraliza saída e facilita limpeza e publicação no CI. |
| Plano de migração em fases com validação após cada passo | Permite reverter com pouco custo e não quebrar testes atuais durante a transição. |

---

**Fim do diagnóstico e proposta.** Nenhuma alteração de código foi feita; este documento serve como base para aprovação e, em seguida, implementação do plano de migração faseado.

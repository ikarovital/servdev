# Documentação do Projeto – Automação E2E BDD

Este documento descreve o **projeto inteiro** de automação de testes E2E, a **arquitetura** escolhida e **como cada parte foi aplicada** na prática.

---

## 1. Visão geral

O projeto é uma suíte de **testes end-to-end (E2E)** para o front do **Serverest** (e-commerce/admin), com os seguintes pilares:

| Pilar | Aplicação no projeto |
|-------|----------------------|
| **BDD real** | Cenários em Gherkin (português), executados pelo Cucumber; steps reutilizáveis e sem duplicação. |
| **Allure Report** | Integração total: cada step gera screenshot + anexo com nome padronizado; falhas geram screenshot extra. |
| **Page Object** | Toda interação com a UI está em `pages/`; os steps apenas orquestram chamadas aos Page Objects. |
| **Isolamento** | Um browser/context/page por cenário (World do Cucumber), sem estado compartilhado. |
| **Código limpo** | Suporte centralizado em `support/`, steps por domínio, helpers reutilizáveis. |

**Stack:** Node.js (ESM), Cucumber.js, Playwright, Allure (allure-cucumberjs + allure-js-commons).

**Aplicação alvo:** `https://front.serverest.dev` (Serverest).

---

## 2. Estrutura do projeto

```
new_automation/
├── features/                          # BDD – cenários e suporte
│   ├── autenticacao.feature           # Cenários de login, cadastro, logout
│   ├── produtos.feature               # Cenários de CRUD de produtos
│   ├── support/                       # Configuração do Cucumber (World + hooks)
│   │   ├── world.js                   # World com Playwright (isolamento)
│   │   └── hooks.js                   # Before, After, AfterStep (screenshot + Allure)
│   └── step_definitions/              # Implementação dos steps
│       ├── login.steps.js
│       └── produtos.steps.js
├── pages/                             # Page Objects
│   ├── LoginPage.js
│   └── produtoPage.js
├── support/                           # Utilitários compartilhados (fora do Cucumber)
│   └── allureScreenshot.js           # Screenshot + anexo Allure padronizado
├── utils/                             # Dados e arquivos de teste
│   ├── dataGenerator.js              # Geração de usuário (Faker)
│   └── fileManager.js                 # Salvar/ler usuário (test-data/createdUser.json)
├── tests/e2e/                         # Specs Playwright (legado, opcional)
│   ├── Login.spec.js
│   └── produtos.spec.js
├── docs/                              # Documentação
├── .github/workflows/                 # CI (Cucumber + Allure)
├── cucumber.mjs                       # Configuração do Cucumber
├── playwright.config.js               # Config Playwright (specs legados)
└── package.json
```

---

## 3. Como o BDD foi aplicado

### 3.1 Gherkin em português

- Todas as features usam `# language: pt` no topo do arquivo.
- Palavras-chave: **Dado**, **Quando**, **Então**, **E**.
- Cenários descrevem comportamento do ponto de vista do usuário, sem detalhes de implementação.

**Exemplo** (`features/autenticacao.feature`):

```gherkin
# language: pt
Funcionalidade: Regressão - Autenticação - Login e Logout
  Como usuário do sistema
  Eu quero fazer login e logout
  Para acessar a área administrativa de forma segura

  Cenário: Login com usuário salvo
    Dado que estou na página de login
    Quando faço login com o usuário salvo
    Então devo ver a mensagem de boas-vindas do admin
    E estou na área administrativa
```

### 3.2 Step definitions

- Cada linha do Gherkin é ligada a uma função em `features/step_definitions/`.
- Os steps recebem o **World** via `this` (ex.: `this.page`, `this.scenarioName`).
- **Regra:** steps não contêm seletores nem lógica de tela; delegam aos **Page Objects** e a `utils/`.

**Exemplo** (`login.steps.js`):

```javascript
Given('que estou na página de login', async function () {
  const loginPage = new LoginPage(this.page);
  await loginPage.goto();
  await loginPage.expectOnLoginPage();
});

When('faço login com o usuário salvo', async function () {
  const loginPage = new LoginPage(this.page);
  await loginPage.loginWithSavedUser();
});
```

### 3.3 Reutilização e parâmetros

- Um mesmo step pode ser usado em vários cenários (ex.: “que estou na página de login”, “devo ver a mensagem {string}”).
- Parâmetros do Gherkin são capturados com **{string}** ou **{int}** e passados para a função.

**Exemplo:**

```gherkin
Quando faço login com o e-mail "invalido@example.com" e senha "senhaerrada"
Então devo ver a mensagem "Email e/ou senha inválidos"
```

```javascript
When('faço login com o e-mail {string} e senha {string}', async function (email, senha) {
  const loginPage = new LoginPage(this.page);
  await loginPage.login(email, senha);
});

Then('devo ver a mensagem {string}', async function (mensagem) {
  await expect(this.page.getByText(mensagem)).toBeVisible();
});
```

---

## 4. Como o isolamento foi aplicado (World)

### 4.1 World do Cucumber

- O **World** é o objeto `this` dentro dos steps; nele ficam `page`, `context`, `browser` e dados do cenário.
- Foi criada uma **classe World** em `features/support/world.js` e registrada com `setWorldConstructor(World)` em `hooks.js`.

### 4.2 Ciclo de vida por cenário

| Hook | Arquivo | O que faz |
|------|---------|-----------|
| **Before** | `hooks.js` | Guarda o nome do cenário em `this.scenarioName` e chama `this.init()`. |
| **init()** | `world.js` | Abre browser (Chromium), cria context (baseURL, viewport), cria **uma nova page**. |
| **After** | `hooks.js` | Em falha, tira screenshot de falha; em seguida chama `this.destroy()`. |
| **destroy()** | `world.js` | Fecha page, context e browser. |

Assim, **cada cenário** roda em uma **page nova**, sem compartilhar estado com outros cenários.

### 4.3 Configuração do browser

- **Browser:** Chromium (Playwright).
- **baseURL:** `https://front.serverest.dev` (ou `process.env.BASE_URL`).
- **Headless:** controlado por `process.env.HEADLESS` (default: headless).
- **Viewport:** 1280x720.

Tudo centralizado em `world.js` para um único ponto de configuração.

---

## 5. Como o Allure foi aplicado

### 5.1 Relatório e resultados

- **Formato:** `allure-cucumberjs/reporter` no `cucumber.mjs`.
- **Saída:** arquivos em `allure-results/` (gerados durante a execução).
- **Geração do HTML:** `allure generate ./allure-results --clean -o allure-report`.
- **Visualização:** `allure open ./allure-report` ou `allure serve ./allure-results`.

### 5.2 Evidência por step (screenshot + anexo)

- **Hook AfterStep** em `hooks.js` chama `takeScreenshotAndAttachToAllure(this.page, stepText)`.
- O helper em `support/allureScreenshot.js`:
  1. Tira screenshot **full page** com Playwright.
  2. Gera um **nome padronizado**: `Evidência - <texto do step>` (até 80 caracteres).
  3. Salva o PNG em `screenshots/` com nome único (prefixo + texto + timestamp).
  4. Anexa no Allure com `allure.attachment(nome, buffer, 'image/png')`.

Assim, **cada step** gera um screenshot e um anexo no Allure com nome padronizado.

### 5.3 Evidência em caso de falha

- No **After**, se o cenário falhou (`result.result.status === 'failed'` ou `'undefined'`), é chamado `takeFailureScreenshot(this.page, this.scenarioName)`.
- O helper tira um screenshot e anexa com o nome: **`Evidência - Falha - <nome do cenário>`**.

Resumo:

| Momento | Nome do anexo no Allure |
|---------|-------------------------|
| A cada step | `Evidência - <texto do step>` |
| Em falha | `Evidência - Falha - <nome do cenário>` |

---

## 6. Como o Page Object foi aplicado

### 6.1 Responsabilidade

- **Pages** em `pages/`: únicos responsáveis por **localizar elementos** e **expor ações/asserções** da tela.
- **Steps**: apenas instanciam o Page, chamam métodos e eventualmente usam `expect` para asserções simples quando não há método no Page.

### 6.2 LoginPage

- **Arquivo:** `pages/LoginPage.js`.
- **Métodos principais:** `goto()`, `login(email, senha)`, `loginWithSavedUser()`, `expectOnLoginPage()`, `expectLoginError()`.
- **Elementos:** `emailInput`, `passwordInput`, `submitButton` (getByTestId).

### 6.3 ProdutoPage

- **Arquivo:** `pages/produtoPage.js`.
- **Métodos principais:** `gotoListagem()`, `gotoCadastro()`, `fillProduct()`, `submitProduct()`, `clickEditar()`, `clickExcluir()`, `expectOnListagemPage()`, `expectOnCadastroPage()`.
- **Elementos:** inputs e botões identificados por testId ou role.

Nenhum seletor ou lógica de tela fica nos steps; tudo passa pelos Page Objects.

---

## 7. Configuração do Cucumber

**Arquivo:** `cucumber.mjs` (raiz do projeto).

| Opção | Valor | Significado |
|-------|--------|-------------|
| `format` | `['allure-cucumberjs/reporter', 'progress']` | Gera Allure em `allure-results/` e imprime progresso no terminal. |
| `formatOptions.resultsDir` | `'allure-results'` | Pasta onde o reporter do Allure grava os resultados. |
| `paths` | `['features/**/*.feature']` | Onde estão os arquivos .feature. |
| `import` | `['features/support/*.js', 'features/step_definitions/**/*.js']` | Ordem: support (World + hooks) primeiro, depois steps. |
| `timeout` | `30_000` | Timeout por step (30 s). |
| `parallel` | `1` | Execução sequencial (um cenário por vez), garantindo isolamento e ordem estável. |

O Cucumber é executado com:

```bash
npx cucumber-js
```

O binário usa o `cucumber.mjs` automaticamente em projeto ESM.

---

## 8. Fluxo de execução (do Gherkin ao Allure)

1. **Cucumber** lê os `.feature` e carrega support e step definitions.
2. Para **cada cenário**:
   - **Before:** cria World, chama `init()` → novo browser/context/page.
   - Para **cada step**:
     - Executa a função do step (Page Objects + expect).
     - **AfterStep:** screenshot + anexo Allure com nome padronizado.
   - **After:** se falhou → screenshot de falha; depois `destroy()` (fecha browser).
3. O **allure-cucumberjs** escreve em `allure-results/`.
4. **allure generate** lê `allure-results/` e gera o HTML em `allure-report/`.

---

## 9. Utilitários e dados de teste

### 9.1 `utils/dataGenerator.js`

- Gera usuário com **Faker**: nome, e-mail (derivado do nome) e senha fixa.
- Usado no cenário “Criar usuário com sucesso” e em qualquer step que precise de dados novos.

### 9.2 `utils/fileManager.js`

- **saveUserCredentials(user):** grava `test-data/createdUser.json`.
- **getSavedUser():** lê o usuário salvo (usado em “login com usuário salvo”).

O cenário “Criar usuário com sucesso” é a origem do usuário usado em vários outros cenários; a ordem recomendada é rodar a suíte inteira ou ao menos esse cenário antes dos que dependem de “usuário salvo”.

### 9.3 Produtos e imagens

- Cenários de produto podem usar `test-data/fixtures/sample.png` (imagem válida) e `test-data/invalid-upload.txt` (arquivo inválido).
- Steps verificam existência do arquivo antes de anexar; se não existir, o step não falha por isso.

---

## 10. Scripts npm e uso no dia a dia

| Script | Comando | Uso |
|--------|---------|-----|
| **test:bdd** | `cucumber-js` | Executa todos os cenários BDD e gera `allure-results/`. |
| **allure:generate** | `allure generate ./allure-results --clean -o allure-report` | Gera o relatório HTML. |
| **allure:open** | `allure open ./allure-report` | Abre o relatório no navegador. |
| **allure:serve** | `allure serve ./allure-results` | Gera e abre o relatório em um passo. |
| **test** | `playwright test` | Roda os specs Playwright em `tests/e2e/` (legado). |

Uso típico:

```bash
npm run test:bdd
npm run allure:serve
```

---

## 11. CI/CD (GitHub Actions)

**Workflow:** `.github/workflows/playwright.yml`.

- **Trigger:** push em `main` ou execução manual.
- **Job test:**
  - Checkout, Node 20, `npm ci`, instalação do Chromium (Playwright).
  - Execução: **`npx cucumber-js --config cucumber.mjs`** (testes BDD).
  - Geração do Allure: `npx allure generate ./allure-results --clean -o allure-report`.
  - Upload do artifact `allure-report` para publicação no GitHub Pages.
- **Jobs publish-report e deploy:** publicam o relatório no GitHub Pages.

Assim, o **projeto inteiro** em produção de relatório usa BDD (Cucumber) + Allure; os specs Playwright em `tests/e2e/` ficam como legado local (`npm run test`).

---

## 12. Resumo: onde cada requisito foi aplicado

| Requisito | Onde foi aplicado |
|-----------|--------------------|
| BDD real | `features/*.feature` (Gherkin PT), `step_definitions/`, `cucumber.mjs`. |
| Screenshot por step | `support/allureScreenshot.js` + `hooks.js` (AfterStep). |
| Anexo no Allure por step | `takeScreenshotAndAttachToAllure()` + `allure.attachment()`. |
| Nome padronizado | `getAttachmentName(stepText)` → `Evidência - <texto>`. |
| Isolamento de cenário | `world.js` (novo browser/context/page por cenário) + Before/After. |
| Screenshot em falha | `hooks.js` (After) + `takeFailureScreenshot()`. |
| Page Object | `pages/LoginPage.js`, `pages/produtoPage.js`; steps só orquestram. |
| Código limpo e reutilizável | Steps reutilizáveis, support centralizado, sem duplicação de lógica de tela. |

---

## 13. Referência rápida de arquivos

| Arquivo | Função |
|---------|--------|
| `features/*.feature` | Cenários BDD (Gherkin). |
| `features/support/world.js` | World com Playwright (init/destroy). |
| `features/support/hooks.js` | Before, AfterStep, After + setWorldConstructor. |
| `support/allureScreenshot.js` | Screenshot + anexo Allure (nome padronizado). |
| `features/step_definitions/*.js` | Implementação dos steps (Page Objects + expect). |
| `pages/*.js` | Page Objects (elementos e ações de tela). |
| `cucumber.mjs` | Configuração do Cucumber e do reporter Allure. |
| `utils/*.js` | Geração de dados e persistência (usuário). |

Esta documentação descreve o **projeto inteiro** e **como cada decisão foi aplicada** na estrutura, nos arquivos e no fluxo de execução.

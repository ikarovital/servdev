# Fase 1 – Migração concluída: artefatos em `reports/`

## Objetivo

Centralizar todos os artefatos de execução no diretório **`reports/`** na raiz, sem alterar a estrutura de código (features, pages, utils).

---

## Diff conceitual das alterações

| Antes | Depois |
|-------|--------|
| `allure-results/` (raiz) | `reports/allure-results/` |
| `allure-results-playwright/` (raiz) | `reports/allure-results-playwright/` |
| `allure-report/` (raiz) | `reports/allure-report/` |
| `playwright-report/` (raiz) | `reports/playwright-report/` |
| `test-results/` (raiz) | `reports/test-results/` |
| `screenshots/` (raiz) | `reports/screenshots/` |
| Várias entradas no .gitignore | Uma única entrada: `reports/` |

---

## Arquivos modificados

| Arquivo | Alteração |
|---------|-----------|
| **cucumber.mjs** | `formatOptions.resultsDir` → `'reports/allure-results'` |
| **playwright.config.js** | `outputDir: 'reports/test-results'`; reporter `html` com `outputFolder: 'reports/playwright-report'`; allure-playwright `outputFolder: 'reports/allure-results-playwright'` |
| **support/allureScreenshot.js** | `SCREENSHOTS_DIR` → `'reports/screenshots'` |
| **package.json** | Scripts `allure:generate`, `allure:open`, `allure:serve` passando a usar paths `reports/...` |
| **.gitignore** | Inclusão de `reports/`; remoção de `test-results/`, `playwright-report/`, `screenshots/`, `allure-results/`, `allure-results-playwright/`, `allure-report/` |
| **.github/workflows/playwright.yml** | Comando `allure generate` e `path` do artifact apontando para `reports/allure-results` e `reports/allure-report/` |
| **tests/e2e/Login.spec.js** | `screenshots` → `reports/screenshots` (mkdir e paths de anexo) |
| **tests/e2e/produtos.spec.js** | `screenshots` → `reports/screenshots` (mkdir e paths de anexo) |

**Criado:** diretório **reports/** na raiz (vazio; conteúdo gerado na execução).

---

## Trechos alterados

### cucumber.mjs
```diff
  formatOptions: {
-   resultsDir: 'allure-results',
+   resultsDir: 'reports/allure-results',
  },
```

### playwright.config.js
```diff
 export default defineConfig({
   testDir: './tests',

+  outputDir: 'reports/test-results',
+
   timeout: 30 * 1000,
   ...
   reporter: [
-    ['html'],
+    ['html', { outputFolder: 'reports/playwright-report' }],
     ['list'],
-    ['allure-playwright', { outputFolder: 'allure-results-playwright' }]
+    ['allure-playwright', { outputFolder: 'reports/allure-results-playwright' }]
   ],
```

### support/allureScreenshot.js
```diff
- const SCREENSHOTS_DIR = 'screenshots';
+ const SCREENSHOTS_DIR = 'reports/screenshots';
```

### package.json
```diff
-    "allure:generate": "allure generate ./allure-results --clean -o allure-report",
-    "allure:open": "allure open ./allure-report",
-    "allure:serve": "allure serve ./allure-results"
+    "allure:generate": "allure generate ./reports/allure-results --clean -o reports/allure-report",
+    "allure:open": "allure open ./reports/allure-report",
+    "allure:serve": "allure serve ./reports/allure-results"
```

### .gitignore
- Adicionado: `reports/`
- Removidas entradas redundantes: `/test-results/`, `/playwright-report/`, `screenshots/`, `allure-results/`, `allure-results-playwright/`, `allure-report/`

### .github/workflows/playwright.yml
- `allure generate ./reports/allure-results --clean -o reports/allure-report`
- `path: reports/allure-report/`

### tests/e2e (Login e produtos)
- `mkdirSync('screenshots', ...)` → `mkdirSync('reports/screenshots', ...)`
- Strings `'screenshots/...'` → `'reports/screenshots/...'`

---

## Como validar localmente

1. **Limpar artefatos antigos (opcional)**  
   Remova pastas antigas na raiz se ainda existirem:  
   `allure-results`, `allure-report`, `allure-results-playwright`, `playwright-report`, `test-results`, `screenshots`.

2. **Rodar BDD (Cucumber + Allure)**  
   ```bash
   npm run test:bdd
   ```  
   - Deve criar `reports/allure-results/` com arquivos `*-result.json`.  
   - Screenshots em `reports/screenshots/`.

3. **Gerar e abrir relatório Allure (BDD)**  
   ```bash
   npm run allure:generate
   npm run allure:open
   ```  
   - Deve gerar `reports/allure-report/` e abrir no navegador com os cenários BDD.

4. **Alternativa: serve (gera e abre)**  
   ```bash
   npm run allure:serve
   ```  
   - Lê `reports/allure-results` e abre o relatório.

5. **Rodar specs Playwright (opcional)**  
   ```bash
   npm run test
   ```  
   - Deve criar `reports/test-results/`, `reports/playwright-report/`, `reports/allure-results-playwright/`.  
   - Screenshots dos specs em `reports/screenshots/`.

6. **Conferir estrutura**  
   Após BDD + Playwright, a raiz deve ter apenas a pasta `reports/` com subpastas; nenhum artefato solto na raiz.

---

## Consistência de paths

- **Cucumber:** grava em `reports/allure-results`; hooks salvam screenshots em `reports/screenshots`.  
- **Playwright:** test-results em `reports/test-results`, HTML em `reports/playwright-report`, Allure em `reports/allure-results-playwright`; specs escrevem screenshots em `reports/screenshots`.  
- **Scripts npm:** Allure generate/open/serve usam apenas paths sob `reports/`.  
- **CI:** gera e faz upload de `reports/allure-report/`.

Nenhuma pasta de código (features, pages, utils, support, tests) foi movida ou renomeada.

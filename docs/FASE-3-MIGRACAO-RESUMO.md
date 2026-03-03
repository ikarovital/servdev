# Fase 3 – Migração concluída: helpers/

## Objetivo

Criar o diretório **helpers/** na raiz, mover para ele o suporte de Allure e os utilitários de dados/arquivo, atualizar todos os imports e garantir que os hooks do Cucumber continuem funcionando sem alterar o comportamento dos testes.

---

## 1. Estrutura antes e depois

### Antes
```
support/
  allureScreenshot.js
utils/
  dataGenerator.js
  fileManager.js
```

### Depois
```
helpers/
  allureScreenshot.js
  dataGenerator.js
  fileManager.js
```

Pastas **support/** (raiz) e **utils/** foram removidas após a migração.

---

## 2. Movimentos realizados

| Origem | Destino |
|--------|---------|
| `support/allureScreenshot.js` | `helpers/allureScreenshot.js` |
| `utils/fileManager.js` | `helpers/fileManager.js` |
| `utils/dataGenerator.js` | `helpers/dataGenerator.js` |

Conteúdo dos arquivos mantido; apenas a localização foi alterada.

---

## 3. Diff das alterações

### 3.1 Novo diretório e arquivos

- **Criado:** `helpers/allureScreenshot.js` (conteúdo idêntico ao antigo `support/allureScreenshot.js`)
- **Criado:** `helpers/fileManager.js` (idêntico ao antigo `utils/fileManager.js`)
- **Criado:** `helpers/dataGenerator.js` (idêntico ao antigo `utils/dataGenerator.js`)

### 3.2 Imports atualizados

**features/support/hooks.js**
```diff
 } from '../../support/allureScreenshot.js';
 } from '../../helpers/allureScreenshot.js';
```

**features/step_definitions/login.steps.js**
```diff
-import { generateUser } from '../../utils/dataGenerator.js';
-import { saveUserCredentials } from '../../utils/fileManager.js';
+import { generateUser } from '../../helpers/dataGenerator.js';
+import { saveUserCredentials } from '../../helpers/fileManager.js';
```

**tests/e2e/Login.spec.js**
```diff
-import { generateUser } from '../../utils/dataGenerator.js';
-import { saveUserCredentials } from '../../utils/fileManager.js';
+import { generateUser } from '../../helpers/dataGenerator.js';
+import { saveUserCredentials } from '../../helpers/fileManager.js';
```

**pages/LoginPage.js**
```diff
-import { getSavedUser } from '../utils/fileManager.js';
+import { getSavedUser } from '../helpers/fileManager.js';
```

### 3.3 Arquivos e pastas removidos

- **Removido:** `support/allureScreenshot.js`
- **Removido:** `utils/fileManager.js`
- **Removido:** `utils/dataGenerator.js`
- **Removido:** pasta `support/` (raiz, vazia)
- **Removido:** pasta `utils/` (vazia)

---

## 4. Validação

| Verificação | Resultado |
|------------|-----------|
| Cucumber dry-run (`npx cucumber-js --config cucumber.mjs --dry-run`) | 14 cenários, 82 steps carregados |
| Imports em hooks (allureScreenshot) | Resolvem para `helpers/allureScreenshot.js` |
| Imports em steps/specs/pages (fileManager, dataGenerator) | Resolvem para `helpers/` |
| Linter (helpers, hooks, steps, specs, LoginPage) | Sem erros |

Os hooks do Cucumber (`Before`, `After`, `AfterStep`) continuam em `features/support/hooks.js` e passam a depender apenas de `helpers/allureScreenshot.js`; o comportamento de screenshot e anexo ao Allure permanece o mesmo.

---

## 5. Resumo de arquivos modificados

| Ação | Arquivo |
|------|---------|
| Criado | `helpers/allureScreenshot.js` |
| Criado | `helpers/fileManager.js` |
| Criado | `helpers/dataGenerator.js` |
| Modificado | `features/support/hooks.js` |
| Modificado | `features/step_definitions/login.steps.js` |
| Modificado | `tests/e2e/Login.spec.js` |
| Modificado | `pages/LoginPage.js` |
| Removido | `support/allureScreenshot.js` |
| Removido | `utils/fileManager.js` |
| Removido | `utils/dataGenerator.js` |
| Removido | pasta `support/` |
| Removido | pasta `utils/` |

---

## 6. Como validar localmente

```bash
# Carregamento e steps (sem rodar contra a aplicação)
npx cucumber-js --config cucumber.mjs --dry-run

# Execução BDD completa (hooks + Allure)
npm run test:bdd

# Specs Playwright (Login usa helpers)
npm run test
```

Nenhum comportamento de teste foi alterado; apenas a localização dos helpers e os caminhos de import.

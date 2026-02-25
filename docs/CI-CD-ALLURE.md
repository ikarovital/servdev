# Pipeline CI/CD – Playwright + Allure + GitHub Pages

## 1. Workflow (`.github/workflows/playwright.yml`)

O pipeline contém três jobs:

| Job              | Função                                                                 |
|------------------|------------------------------------------------------------------------|
| **test**         | Checkout, instala dependências e browsers, executa testes, gera Allure e faz upload do artefato. |
| **publish-report** | Baixa o artefato do relatório e envia para o GitHub Pages.         |
| **deploy**       | Publica o conteúdo no GitHub Pages.                                    |

- **Gatilhos:** `push` na branch `main` e `workflow_dispatch` (execução manual).
- **Concurrency:** uma execução por vez por branch (evita deploys concorrentes).
- **Resiliência:** relatório é gerado e publicado mesmo com falha de testes (`if: always()`).
- **Artefato:** relatório disponível para download por 30 dias.

---

## 2. Configuração do Playwright (`playwright.config.js`)

O reporter do Allure já está configurado:

```javascript
reporter: [
  ['html'],
  ['list'],
  ['allure-playwright', { outputFolder: 'allure-results' }]
],
```

- **allure-results:** pasta gerada durante os testes (entrada do `allure generate`).
- **allure-report:** pasta gerada pelo `allure generate` (HTML final publicado no Pages).

Não é necessário alterar mais nada no `playwright.config.js` para o pipeline.

---

## 3. Dependências (`package.json`)

Devem estar nas `devDependencies`:

| Pacote              | Uso                                      |
|---------------------|------------------------------------------|
| `@playwright/test`  | Execução dos testes.                     |
| `allure-playwright` | Reporter que gera `allure-results`.      |
| `allure-commandline`| CLI para `allure generate` no workflow.  |

O `npm ci` no workflow instala tudo; não é preciso instalar nada extra no runner.

---

## 4. Habilitar GitHub Pages no repositório

1. No GitHub, abra o repositório e vá em **Settings**.
2. No menu lateral, clique em **Pages**.
3. Em **Build and deployment**:
   - **Source:** selecione **GitHub Actions**.
4. Salve (não é necessário escolher branch nem pasta).

Na primeira execução do workflow que rode o job **deploy**, o GitHub pode pedir para criar o **environment** `github-pages`. Aceite; não é preciso configurar variáveis.

Após o deploy, o relatório ficará em:

**`https://<seu-usuario>.github.io/<nome-do-repo>/`**

Exemplo: `https://ikarovital.github.io/servdev/`

---

## 5. Execução

- **Automática:** a cada `push` na `main`.
- **Manual:** **Actions** → **Playwright E2E + Allure Report** → **Run workflow**.

O relatório no GitHub Pages é atualizado a cada execução bem-sucedida dos jobs **publish-report** e **deploy**.

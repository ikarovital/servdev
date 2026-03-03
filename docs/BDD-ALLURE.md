# BDD e Allure Report – Visão geral

O projeto foi refatorado para **BDD real** com Gherkin em português e integração total ao **Allure Report**.

## Padrão BDD

- **Features**: `features/*.feature` (Gherkin em português).
- **Steps**: `features/step_definitions/*.js` – cada step delega aos **Page Objects** em `pages/`.
- **Suporte**: `features/support/` – World (Playwright) e hooks (Before/After/AfterStep).

## Allure – O que é gerado

| Momento        | Comportamento |
|----------------|----------------|
| **A cada step**| Screenshot full page + anexo no Allure com nome padronizado: `Evidência - <texto do step>`. |
| **Em falha**   | Screenshot adicional: `Evidência - Falha - <nome do cenário>`. |
| **Arquivos**   | Screenshots em `screenshots/`; resultados Allure em `allure-results/`. |

## Isolamento

- Um **novo browser/context/page** por cenário (World do Cucumber).
- Nenhum estado compartilhado entre cenários.

## Comandos

```bash
npm run test:bdd          # Executa Cucumber, gera allure-results
npm run allure:generate   # Gera HTML do relatório
npm run allure:open       # Abre o relatório
npm run allure:serve      # Gera e abre
```

Ver também: [CI-CD-ALLURE.md](./CI-CD-ALLURE.md) para pipeline e publicação do relatório.

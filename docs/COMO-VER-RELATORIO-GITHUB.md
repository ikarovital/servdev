# Onde pegar o relatório Allure no GitHub – Passo a passo

Você pode ver o relatório de **duas formas**: no **GitHub Pages** (no navegador) ou **baixando o artefato**.

---

## Opção 1: Ver no navegador (GitHub Pages)

Depois de habilitar o GitHub Pages no repositório (Settings → Pages → Source: **GitHub Actions**):

1. Abra o repositório no GitHub: **https://github.com/ikarovital/servdev**
2. O relatório fica na URL do Pages:
   - **https://ikarovital.github.io/servdev/**
3. Acesse esse link no navegador.
4. A página que abrir **é** o relatório Allure (com gráficos, testes e evidências).

**Observação:** A URL é sempre `https://<seu-usuario>.github.io/<nome-do-repo>/`. O conteúdo é atualizado a cada execução do workflow que faz o deploy.

---

## Opção 2: Baixar o relatório (artefato)

1. Abra o repositório no GitHub: **https://github.com/ikarovital/servdev**
2. Clique na aba **Actions** (menu superior).
3. No menu à esquerda, clique no workflow **"Playwright E2E + Allure Report"**.
4. Clique na **execução** que você quer (a mais recente fica no topo).
5. Na página da execução, role até o final.
6. Na seção **"Artifacts"**, aparecerá **"allure-report"**.
7. Clique em **"allure-report"** para baixar o arquivo ZIP.
8. No seu computador, **descompacte o ZIP**.
9. Para as imagens/evidências carregarem, **não** abra o `index.html` com duplo clique. No terminal, entre na pasta descompactada e rode:
   ```bash
   npx serve .
   ```
   ou
   ```bash
   npx allure open .
   ```
10. Abra no navegador o endereço que aparecer (ex.: **http://localhost:3000**).

---

## Resumo rápido

| Onde quero ver | O que fazer |
|----------------|-------------|
| **Direto no navegador, sem baixar** | Acessar **https://ikarovital.github.io/servdev/** (precisa ter GitHub Pages habilitado). |
| **Arquivo no PC** | Actions → workflow → execução → no final da página, em **Artifacts** → baixar **allure-report** → descompactar → rodar `npx serve .` na pasta e abrir o link no navegador. |

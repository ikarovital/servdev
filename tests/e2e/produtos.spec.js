// @ts-nocheck - Arquivo JavaScript; evita erros do analisador TypeScript no IDE
import fs from 'fs';
import path from 'path';
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage.js';
import { ProdutoPage } from '../../pages/ProdutoPage.js';

/** Caminho para imagem válida (PNG 1x1) e arquivo inválido para upload. */
const IMAGEM_VALIDA = path.join(process.cwd(), 'test-data', 'fixtures', 'sample.png');
const IMAGEM_INVALIDA = path.join(process.cwd(), 'test-data', 'invalid-upload.txt');

async function takeScreenshotAndAttach(page, testInfo, filePath, attachName) {
  const buffer = await page.screenshot({ fullPage: true });
  fs.mkdirSync('reports/screenshots', { recursive: true });
  fs.writeFileSync(filePath, buffer);
  await testInfo.attach(attachName, { body: buffer, contentType: 'image/png' });
}

/** Faz login com usuário salvo e deixa a página na área admin (listagem). */
async function loginAndGoToAdmin(page) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.loginWithSavedUser();
  await expect(
    page.getByText('Este é seu sistema para administrar seu ecommerce.')
  ).toBeVisible();
}

test.describe('Regressão - Produtos (Cadastro e Listagem)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndGoToAdmin(page);
  });

  test.describe('Cadastro de produto', () => {
    test('deve cadastrar produto com sucesso e permanecer na listagem', async ({ page }, testInfo) => {
      const produtoPage = new ProdutoPage(page);
      await produtoPage.gotoListagem();
      await produtoPage.gotoCadastro();

      const nome = `Produto regressão ${Date.now()}`;
      await produtoPage.fillProduct({
        nome,
        preco: '1999',
        descricao: 'Descrição do produto para regressão',
        quantidade: '10',
      });
      if (fs.existsSync(IMAGEM_VALIDA)) {
        await produtoPage.inputImagem.setInputFiles(IMAGEM_VALIDA);
      }
      await produtoPage.submitProduct();

      await produtoPage.expectOnListagemPage();
      await expect(page.getByText(nome)).toBeVisible();

      await takeScreenshotAndAttach(
        page,
        testInfo,
        'reports/screenshots/produto-cadastro-sucesso.png',
        'Evidência - Cadastro de produto com sucesso'
      );
    });

    test('deve permanecer na tela de cadastro e exibir validação quando campos obrigatórios estão vazios', async ({ page }, testInfo) => {
      const produtoPage = new ProdutoPage(page);
      await produtoPage.gotoListagem();
      await produtoPage.gotoCadastro();

      await produtoPage.submitProduct();

      await produtoPage.expectOnCadastroPage();
      const form = page.locator('form');
      await expect(form).toBeVisible();

      await takeScreenshotAndAttach(
        page,
        testInfo,
        'reports/screenshots/produto-campos-obrigatorios.png',
        'Evidência - Validação campos obrigatórios'
      );
    });

    test('deve validar preço negativo e não cadastrar', async ({ page }, testInfo) => {
      const produtoPage = new ProdutoPage(page);
      await produtoPage.gotoListagem();
      await produtoPage.gotoCadastro();

      await produtoPage.fillProduct({
        nome: 'Produto preço negativo',
        preco: '-100',
        descricao: 'Descrição',
        quantidade: '5',
      });
      await produtoPage.submitProduct();

      await produtoPage.expectOnCadastroPage();
      await takeScreenshotAndAttach(
        page,
        testInfo,
        'reports/screenshots/produto-preco-negativo.png',
        'Evidência - Preço negativo'
      );
    });

    test('deve validar quantidade inválida (zero) e não cadastrar', async ({ page }, testInfo) => {
      const produtoPage = new ProdutoPage(page);
      await produtoPage.gotoListagem();
      await produtoPage.gotoCadastro();

      await produtoPage.fillProduct({
        nome: 'Produto quantidade zero',
        preco: '50',
        descricao: 'Descrição',
        quantidade: '0',
      });
      await produtoPage.submitProduct();

      await produtoPage.expectOnCadastroPage();
      await takeScreenshotAndAttach(
        page,
        testInfo,
        'reports/screenshots/produto-quantidade-zero.png',
        'Evidência - Quantidade zero'
      );
    });

    test('deve rejeitar upload de arquivo que não é imagem válida', async ({ page }, testInfo) => {
      const produtoPage = new ProdutoPage(page);
      await produtoPage.gotoListagem();
      await produtoPage.gotoCadastro();

      await produtoPage.fillProduct({
        nome: 'Produto imagem inválida',
        preco: '100',
        descricao: 'Descrição',
        quantidade: '1',
      });
      if (fs.existsSync(IMAGEM_INVALIDA)) {
        await produtoPage.inputImagem.setInputFiles(IMAGEM_INVALIDA);
      }
      await produtoPage.submitProduct();

      await produtoPage.expectOnCadastroPage();
      await takeScreenshotAndAttach(
        page,
        testInfo,
        'reports/screenshots/produto-imagem-invalida.png',
        'Evidência - Imagem inválida'
      );
    });
  });

  test.describe('Listagem de produtos', () => {
    test('deve exibir a área de listagem de produtos', async ({ page }) => {
      const produtoPage = new ProdutoPage(page);
      await produtoPage.gotoListagem();

      await produtoPage.expectOnListagemPage();
      await expect(produtoPage.linkCadastrarProdutos).toBeVisible();
    });

    test('deve abrir tela de cadastro ao clicar em Cadastrar produtos', async ({ page }) => {
      const produtoPage = new ProdutoPage(page);
      await produtoPage.gotoListagem();
      await produtoPage.gotoCadastro();

      await produtoPage.expectOnCadastroPage();
      await expect(produtoPage.headingCadastroProdutos).toContainText(
        'Cadastro de Produtos'
      );
    });

    /*test('deve redirecionar para edição ao clicar em Editar na listagem', async ({ page }, testInfo) => {
      const produtoPage = new ProdutoPage(page);
      await produtoPage.gotoListagem();

      const btnEditar = page.getByRole('button', { name: 'Editar' }).first();
      const count = await btnEditar.count();
      if (count === 0) {
        testInfo.skip(true, 'Nenhum produto na lista para editar');
        return;
      }

      await produtoPage.clickEditar(0);
      await produtoPage.expectOnCadastroPage();
      await expect(produtoPage.inputNome).toBeVisible();
      await expect(produtoPage.inputPreco).toBeVisible();

      await takeScreenshotAndAttach(
        page,
        testInfo,
        'reports/screenshots/produto-editar-listagem.png',
        'Evidência - Edição pela listagem'
      );
    });*/

    test('deve excluir produto pela listagem quando há produtos', async ({ page }, testInfo) => {
      const produtoPage = new ProdutoPage(page);
      await produtoPage.gotoListagem();

      const botoesExcluir = page.getByRole('button', { name: 'Excluir' });
      const count = await botoesExcluir.count();
      if (count === 0) {
        testInfo.skip(true, 'Nenhum produto na lista para excluir');
        return;
      }

      page.once('dialog', (dialog) => dialog.accept());
      await produtoPage.clickExcluir(0);
      await produtoPage.expectOnListagemPage();

      await takeScreenshotAndAttach(
        page,
        testInfo,
        'reports/screenshots/produto-exclusao-listagem.png',
        'Evidência - Exclusão pela listagem'
      );
    });
  });
});

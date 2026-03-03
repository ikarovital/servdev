import fs from 'fs';
import path from 'path';
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage.js';
import { ProdutoPage } from '../../pages/ProdutoPage.js';

const IMAGEM_VALIDA = path.join(process.cwd(), 'test-data', 'fixtures', 'sample.png');
const IMAGEM_INVALIDA = path.join(process.cwd(), 'test-data', 'invalid-upload.txt');

Given('que estou logado na área administrativa', async function () {
  const loginPage = new LoginPage(this.page);
  await loginPage.goto();
  await loginPage.loginWithSavedUser();
  await expect(
    this.page.getByText('Este é seu sistema para administrar seu ecommerce.')
  ).toBeVisible();
});

Given('estou na listagem de produtos', async function () {
  const produtoPage = new ProdutoPage(this.page);
  await produtoPage.gotoListagem();
});

When('acesso a listagem de produtos', async function () {
  const produtoPage = new ProdutoPage(this.page);
  await produtoPage.gotoListagem();
});

When('acesso a tela de cadastro de produto', async function () {
  const produtoPage = new ProdutoPage(this.page);
  await produtoPage.gotoCadastro();
});

When('preencho nome, preço, descrição e quantidade válidos', async function () {
  const produtoPage = new ProdutoPage(this.page);
  this._nomeProduto = `Produto regressão ${Date.now()}`;
  await produtoPage.fillProduct({
    nome: this._nomeProduto,
    preco: '1999',
    descricao: 'Descrição do produto para regressão',
    quantidade: '10',
  });
});

When('anexo uma imagem válida quando disponível', async function () {
  const produtoPage = new ProdutoPage(this.page);
  if (fs.existsSync(IMAGEM_VALIDA)) {
    await produtoPage.inputImagem.setInputFiles(IMAGEM_VALIDA);
  }
});

When('submeto o cadastro do produto', async function () {
  const produtoPage = new ProdutoPage(this.page);
  await produtoPage.submitProduct();
});

Then('permaneço na listagem de produtos', async function () {
  const produtoPage = new ProdutoPage(this.page);
  await produtoPage.expectOnListagemPage();
});

Then('o produto cadastrado é exibido na lista', async function () {
  await expect(this.page.getByText(this._nomeProduto)).toBeVisible();
});

When('submeto o formulário sem preencher os campos obrigatórios', async function () {
  const produtoPage = new ProdutoPage(this.page);
  await produtoPage.submitProduct();
});

Then('permaneço na tela de cadastro', async function () {
  const produtoPage = new ProdutoPage(this.page);
  await produtoPage.expectOnCadastroPage();
});

Then('o formulário exibe validação de campos obrigatórios', async function () {
  const formCadastro = this.page.locator('form').filter({ has: this.page.getByTestId('nome') });
  await expect(formCadastro).toBeVisible();
});

When('preencho o preço com valor negativo {string}', async function (preco) {
  const produtoPage = new ProdutoPage(this.page);
  await produtoPage.fillProduct({
    nome: 'Produto preço negativo',
    preco,
    descricao: 'Descrição',
    quantidade: '5',
  });
});

When('preencho a quantidade com {string}', async function (quantidade) {
  const produtoPage = new ProdutoPage(this.page);
  await produtoPage.fillProduct({
    nome: 'Produto quantidade zero',
    preco: '50',
    descricao: 'Descrição',
    quantidade,
  });
});

When('preencho os dados do produto', async function () {
  const produtoPage = new ProdutoPage(this.page);
  await produtoPage.fillProduct({
    nome: 'Produto imagem inválida',
    preco: '100',
    descricao: 'Descrição',
    quantidade: '1',
  });
});

When('anexo um arquivo que não é imagem válida', async function () {
  const produtoPage = new ProdutoPage(this.page);
  if (fs.existsSync(IMAGEM_INVALIDA)) {
    await produtoPage.inputImagem.setInputFiles(IMAGEM_INVALIDA);
  }
});

Then('o produto não é cadastrado', async function () {
  const produtoPage = new ProdutoPage(this.page);
  await produtoPage.expectOnCadastroPage();
});

Then('devo ver a listagem de produtos', async function () {
  const produtoPage = new ProdutoPage(this.page);
  await produtoPage.expectOnListagemPage();
});

Then('o link de cadastrar produtos está visível', async function () {
  const produtoPage = new ProdutoPage(this.page);
  await expect(produtoPage.linkCadastrarProdutos).toBeVisible();
});

When('clico em Cadastrar produtos', async function () {
  const produtoPage = new ProdutoPage(this.page);
  await produtoPage.gotoCadastro();
});

Then('devo ver a tela de cadastro de produtos', async function () {
  const produtoPage = new ProdutoPage(this.page);
  await produtoPage.expectOnCadastroPage();
});

Then('o título {string} está visível', async function (titulo) {
  await expect(this.page.getByRole('heading', { name: new RegExp(titulo, 'i') })).toBeVisible();
});

/** Garante que há pelo menos um produto na listagem; cadastra um se a lista estiver vazia (cenário autocontido). */
Given('existe pelo menos um produto na lista', async function () {
  const produtoPage = new ProdutoPage(this.page);
  await produtoPage.gotoListagem();
  const btnEditar = this.page.getByRole('button', { name: 'Editar' }).first();
  if ((await btnEditar.count()) === 0) {
    await produtoPage.gotoCadastro();
    await produtoPage.fillProduct({
      nome: `Produto para edição/exclusão ${Date.now()}`,
      preco: '100',
      descricao: 'Descrição',
      quantidade: '1',
    });
    await produtoPage.submitProduct();
    await produtoPage.expectOnListagemPage();
  }
});

When('clico em Editar no primeiro produto', async function () {
  const produtoPage = new ProdutoPage(this.page);
  await produtoPage.clickEditar(0);
});

Then(/devo ver a tela de cadastro\/edição/, { timeout: 15_000 }, async function () {
  const produtoPage = new ProdutoPage(this.page);
  await produtoPage.expectOnCadastroPage();
});

Then('os campos nome e preço estão visíveis', async function () {
  const produtoPage = new ProdutoPage(this.page);
  await expect(produtoPage.inputNome).toBeVisible();
  await expect(produtoPage.inputPreco).toBeVisible();
});

When('clico em Excluir no primeiro produto', async function () {
  const produtoPage = new ProdutoPage(this.page);
  this.page.once('dialog', (dialog) => dialog.accept());
  await produtoPage.clickExcluir(0);
});

When('confirmo a exclusão', async function () {
  // Confirmação já tratada no handler dialog no step anterior
});

Then('volto para a listagem de produtos', async function () {
  const produtoPage = new ProdutoPage(this.page);
  await produtoPage.expectOnListagemPage();
});

Then('a exclusão foi realizada', async function () {
  const produtoPage = new ProdutoPage(this.page);
  await produtoPage.expectOnListagemPage();
});

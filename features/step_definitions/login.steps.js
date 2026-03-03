import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage.js';
import { generateUser } from '../../helpers/dataGenerator.js';
import { saveUserCredentials } from '../../helpers/fileManager.js';

Given('que estou na página de login', async function () {
  const loginPage = new LoginPage(this.page);
  await loginPage.goto();
  await loginPage.expectOnLoginPage();
});

When('acesso o formulário de cadastro de usuário', async function () {
  await this.page.getByTestId('cadastrar').click();
});

When('preencho nome, e-mail e senha válidos', async function () {
  this._user = generateUser();
  await this.page.getByTestId('nome').fill(this._user.nome);
  await this.page.getByTestId('email').fill(this._user.email);
  await this.page.getByTestId('password').fill(this._user.password);
});

When('aceito os termos', async function () {
  await this.page.getByTestId('checkbox').check();
});

When('submeto o cadastro', async function () {
  await this.page.getByTestId('cadastrar').click();
});

Then('as credenciais são salvas para uso posterior', async function () {
  saveUserCredentials(this._user);
});

Then('sou redirecionado com sucesso', async function () {
  await this.page.waitForTimeout(4000);
});

When('faço login com o usuário salvo', async function () {
  const loginPage = new LoginPage(this.page);
  await loginPage.loginWithSavedUser();
});

Then('devo ver a mensagem de boas-vindas do admin', async function () {
  await expect(
    this.page.getByText('Este é seu sistema para administrar seu ecommerce.')
  ).toBeVisible();
});

Then('estou na área administrativa', async function () {
  await expect(
    this.page.getByText('Este é seu sistema para administrar seu ecommerce.')
  ).toBeVisible();
});

When('faço login com o e-mail {string} e senha {string}', async function (email, senha) {
  const loginPage = new LoginPage(this.page);
  await loginPage.login(email, senha);
});

Then('devo ver a mensagem {string}', async function (mensagem) {
  await expect(this.page.getByText(mensagem)).toBeVisible();
});

When('submeto o formulário sem preencher e-mail e senha', async function () {
  const loginPage = new LoginPage(this.page);
  await loginPage.submitButton.click();
});

When('preencho o e-mail com {string} e a senha com {string}', async function (email, senha) {
  const loginPage = new LoginPage(this.page);
  await loginPage.emailInput.fill(email);
  await loginPage.passwordInput.fill(senha);
});

When('submeto o formulário de login', async function () {
  const loginPage = new LoginPage(this.page);
  await loginPage.submitButton.click();
});

Then('permaneço na página de login', async function () {
  await this.page.waitForTimeout(2000);
  await expect(this.page).toHaveURL(/\/login/);
});

Then('não sou autenticado', async function () {
  await expect(this.page).toHaveURL(/\/login/);
});

When('faço logout', async function () {
  await this.page.getByTestId('logout').click();
  const loginPage = new LoginPage(this.page);
  await loginPage.expectOnLoginPage();
});

When('navego para a rota {string}', async function (rota) {
  await this.page.goto(rota);
  await this.page.waitForLoadState('networkidle');
});

Then('não devo ver o botão de cadastrar usuários', async function () {
  await expect(this.page.getByTestId('cadastrarUsuarios')).not.toBeVisible();
  await expect(this.page.getByTestId('cadastrarUsuarios')).toHaveCount(0);
});

Then('o acesso à área restrita está bloqueado', async function () {
  await expect(this.page.getByTestId('cadastrarUsuarios')).toHaveCount(0);
});

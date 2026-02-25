import fs from 'fs';
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage.js';
import { generateUser } from '../../utils/dataGenerator.js';
import { saveUserCredentials } from '../../utils/fileManager.js';

/** Salva screenshot em pasta e anexa ao Allure (buffer garante exibição no relatório). */
async function takeScreenshotAndAttach(page, testInfo, filePath, attachName) {
  const buffer = await page.screenshot({ fullPage: true });
  fs.mkdirSync('screenshots', { recursive: true });
  fs.writeFileSync(filePath, buffer);
  await testInfo.attach(attachName, { body: buffer, contentType: 'image/png' });
}

const VALID_EMAIL =
  process.env.PLAYWRIGHT_VALID_EMAIL ||
  'novotestamento@teste.com';

const VALID_PASSWORD =
  process.env.PLAYWRIGHT_VALID_PASSWORD ||
  '12345';

test.describe('Autenticação - Login e Logout', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.expectOnLoginPage();
  });

  test('criar usuario com sucesso', async ({ page }, testInfo) => {
    const user = generateUser();

    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('cadastrar').click();

    await page.getByTestId('nome').fill(user.nome);
    await page.getByTestId('email').fill(user.email);
    await page.getByTestId('password').fill(user.password);
    await page.getByTestId('checkbox').check();
    await page.getByTestId('cadastrar').click();

    // Salva credenciais após criação
    saveUserCredentials(user);
    await page.waitForTimeout(4000);

    await takeScreenshotAndAttach(
      page,
      testInfo,
      'screenshots/login-sucesso.png',
      'Evidência - Cadastro com sucesso'
    );
  });

  test('deve fazer login com usuario salvo', async ({ page }, testInfo) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.loginWithSavedUser();

    await expect(
      page.getByText('Este é seu sistema para administrar seu ecommerce.')
    ).toBeVisible();

    await takeScreenshotAndAttach(
      page,
      testInfo,
      'screenshots/login-usuario-salvo.png',
      'Evidência - Login com usuário salvo'
    );
  });


  test('deve exibir mensagem de erro para credenciais inválidas', async ({ page }, testInfo) => {
    const loginPage = new LoginPage(page);

    await loginPage.login('invalido@example.com', 'senhaerrada');

    await expect(
      page.getByText('Email e/ou senha inválidos')
    ).toBeVisible();

    await takeScreenshotAndAttach(
      page,
      testInfo,
      'screenshots/login-credenciais-invalidas.png',
      'Evidência - Mensagem credenciais inválidas'
    );
  });

  test('deve validar campos obrigatórios (e-mail e senha vazios)', async ({ page }, testInfo) => {
    const loginPage = new LoginPage(page);

    await loginPage.submitButton.click();

    const form = page.locator('form');

    await expect(form).toContainText('Email é obrigatório');
    await expect(form).toContainText('Password é obrigatório');

    await takeScreenshotAndAttach(
      page,
      testInfo,
      'screenshots/login-campos-obrigatorios.png',
      'Evidência - Validação campos obrigatórios'
    );
  });

  test('deve impedir login com e-mail em formato inválido', async ({ page }, testInfo) => {
    const loginPage = new LoginPage(page);

    await loginPage.emailInput.fill('email-invalido');
    await loginPage.passwordInput.fill('qualquercoisa');
    await loginPage.submitButton.click();

    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/login/);

    await takeScreenshotAndAttach(
      page,
      testInfo,
      'screenshots/login-email-invalido.png',
      'Evidência - E-mail em formato inválido'
    );
  });

  

  test('deve permitir logout e bloquear acesso posterior a rotas protegidas', async ({ page }, testInfo) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.loginWithSavedUser();

    await expect(
      page.getByText('Este é seu sistema para administrar seu ecommerce.')
    ).toBeVisible();

    await page.getByTestId('logout').click();
    await loginPage.expectOnLoginPage();

    await page.goto('/usuarios');
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByTestId('cadastrarUsuarios')
    ).not.toBeVisible();
    await expect(
      page.getByTestId('cadastrarUsuarios')
    ).toHaveCount(0);

    await takeScreenshotAndAttach(
      page,
      testInfo,
      'screenshots/logout-acesso-bloqueado.png',
      'Evidência - Acesso bloqueado após logout'
    );
  });
});
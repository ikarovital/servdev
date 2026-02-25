import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/loginPage.js';   
import { generateUser } from '../../utils/dataGenerator.js';
import { saveUserCredentials } from '../../utils/fileManager.js';

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

  test('criar usuario com sucesso', async ({ page }) => {
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
    await page.waitForTimeout(3000);
    await page.screenshot({
      path: 'screenshots/login-sucesso.png',
      fullPage: true
    });
  });

  test('deve fazer login com usuario salvo', async ({ page }) => {
    const loginPage = new LoginPage(page);
  
    await loginPage.goto();
    await loginPage.loginWithSavedUser();
  
    await expect(
      page.getByText('Este é seu sistema para administrar seu ecommerce.')
    ).toBeVisible();
  });


  test('deve exibir mensagem de erro para credenciais inválidas', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.login('invalido@example.com', 'senhaerrada');

    await expect(
      page.getByText('Email e/ou senha inválidos')
    ).toBeVisible();
  });

  test('deve validar campos obrigatórios (e-mail e senha vazios)', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.submitButton.click();

    const form = page.locator('form');

    await expect(form).toContainText('Email é obrigatório');
    await expect(form).toContainText('Password é obrigatório');
  });

  test('deve impedir login com e-mail em formato inválido', async ({ page }) => {
    const loginPage = new LoginPage(page);
  
    // Preenche e-mail inválido (validação nativa do browser)
    await loginPage.emailInput.fill('email-invalido');
    await loginPage.passwordInput.fill('qualquercoisa');
  
    // Tenta submeter o formulário
    await loginPage.submitButton.click();
  
    // ASSERT REAL: continua na tela de login
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/login/);
  
    await page.waitForTimeout(2000);
    // Evidência visual (tooltip nativo não é DOM)
    await page.screenshot({
      path: 'screenshots/login-email-invalido.png',
      fullPage: true
    });
  });

  

  test('deve permitir logout e bloquear acesso posterior a rotas protegidas', async ({ page }) => {
    const loginPage = new LoginPage(page);
  
    // Ir para login
    await loginPage.goto();
  
    // Login com usuário criado dinamicamente
    await loginPage.loginWithSavedUser();
  
    await expect(
      page.getByText('Este é seu sistema para administrar seu ecommerce.')
    ).toBeVisible();
  
    // Logout
    await page.getByTestId('logout').click();
  
    // Garantir que voltou para login
    await loginPage.expectOnLoginPage();
  
    // Tentar acessar rota protegida
    await page.goto('/usuarios');
  
 // Aguarda possível tentativa de carregar a página
await page.waitForLoadState('networkidle');

// Valida que não existe botão protegido
await expect(
  page.getByTestId('cadastrarUsuarios')
).not.toBeVisible();
  
    // Elemento protegido não deve existir
    await expect(
      page.getByTestId('cadastrarUsuarios')
    ).toHaveCount(0);
  
    await page.screenshot({
      path: 'screenshots/logout-acesso-bloqueado.png',
      fullPage: true
    });
  });
});
import { expect } from '@playwright/test';
import { getSavedUser } from '../utils/fileManager.js';

export class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.emailInput = page.getByTestId('email');
    this.passwordInput = page.getByTestId('senha');
    this.submitButton = page.getByTestId('entrar');
    this.genericErrorMessage = page.getByTestId('login-error');
  }

  async goto() {
    await this.page.goto('/login', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async loginWithSavedUser() {
    const user = getSavedUser();
    await this.login(user.email, user.password);
  }

  async expectOnLoginPage() {
    await this.page.waitForURL('**/login*');
    await expect(
      this.page.getByRole('heading', { name: /login/i })
    ).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
  }

  async expectLoginError() {
    await expect(
      this.page.getByText('Email e/ou senha inválidos')
    ).toBeVisible();
  }
}
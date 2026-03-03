/**
 * World do Cucumber com Playwright.
 * Um novo browser/context/page por cenário para isolamento total.
 * Estende o World do Cucumber para receber attach() (exigido pelo AllureCucumberTestRuntime).
 */
import { World as CucumberWorld } from '@cucumber/cucumber';

export default class World extends CucumberWorld {
  constructor(options) {
    super(options);
    this.page = null;
    this.context = null;
    this.browser = null;
    this.scenarioName = '';
  }

  async init() {
    const { chromium } = await import('playwright');
    this.browser = await chromium.launch({
      headless: process.env.HEADLESS !== 'false',
    });
    this.context = await this.browser.newContext({
      baseURL: process.env.BASE_URL || 'https://front.serverest.dev',
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
    });
    this.page = await this.context.newPage();
  }

  async destroy() {
    if (this.page) await this.page.close().catch(() => {});
    if (this.context) await this.context.close().catch(() => {});
    if (this.browser) await this.browser.close().catch(() => {});
    this.page = null;
    this.context = null;
    this.browser = null;
  }
}

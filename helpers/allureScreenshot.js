import fs from 'fs';
import path from 'path';
import * as allure from 'allure-js-commons';
import { ALLURE_RUNTIME_MESSAGE_CONTENT_TYPE } from 'allure-js-commons/sdk/reporter';

const SCREENSHOTS_DIR = 'reports/screenshots';

/**
 * Garante que o diretório de screenshots existe.
 */
function ensureScreenshotsDir() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
}

/**
 * Gera nome padronizado para evidência no Allure.
 * Formato: "Evidência - <descrição do step>"
 * @param {string} stepText - Texto do step (ex: "Dado que estou na página de login")
 * @returns {string}
 */
export function getAttachmentName(stepText) {
  const normalized = stepText.replace(/\s+/g, ' ').trim();
  const maxLen = 80;
  const suffix = normalized.length > maxLen ? '...' : '';
  return `Evidência - ${normalized.slice(0, maxLen)}${suffix}`;
}

/**
 * Gera nome de arquivo único para screenshot (evita sobrescrever entre cenários).
 * @param {string} prefix - Prefixo (ex: "login", "produto")
 * @param {string} scenarioName - Nome do cenário
 * @returns {string}
 */
export function getScreenshotFilePath(prefix, scenarioName = '') {
  ensureScreenshotsDir();
  const safeName = (scenarioName || 'step')
    .replace(/[^a-z0-9]/gi, '-')
    .slice(0, 40);
  const timestamp = Date.now();
  const fileName = `${prefix}-${safeName}-${timestamp}.png`;
  return path.join(SCREENSHOTS_DIR, fileName);
}

/**
 * Tira screenshot da página, salva em disco e anexa ao Allure.
 * Cada step deve gerar evidência com nome padronizado.
 * @param {object} page - Playwright Page
 * @param {string} stepText - Texto do step para o nome do attachment
 * @param {object} [cucumberWorld] - World do Cucumber (opcional). Se informado, usa world.attach para garantir que a evidência vá para o reporter.
 * @returns {Promise<Buffer|null>} Buffer do screenshot
 */
export async function takeScreenshotAndAttachToAllure(page, stepText, cucumberWorld = null) {
  if (!page) return null;
  const buffer = await page.screenshot({ fullPage: true }).catch(() => null);
  if (!buffer) return null;

  const attachName = getAttachmentName(stepText);
  const filePath = getScreenshotFilePath('step', stepText.slice(0, 30));
  ensureScreenshotsDir();
  fs.writeFileSync(filePath, buffer);

  const message = {
    type: 'attachment_content',
    data: {
      name: attachName,
      content: buffer.toString('base64'),
      encoding: 'base64',
      contentType: 'image/png',
      fileExtension: 'png',
      wrapInStep: true,
      timestamp: Date.now(),
    },
  };

  if (cucumberWorld && typeof cucumberWorld.attach === 'function') {
    await cucumberWorld.attach(JSON.stringify(message), ALLURE_RUNTIME_MESSAGE_CONTENT_TYPE);
  } else {
    await allure.attachment(attachName, buffer, 'image/png');
  }
  return buffer;
}

/**
 * Em caso de falha: tira screenshot e anexa ao Allure com nome específico.
 * @param {object} page - Playwright Page
 * @param {string} scenarioName - Nome do cenário que falhou
 * @param {object} [cucumberWorld] - World do Cucumber (opcional). Se informado, usa world.attach.
 */
export async function takeFailureScreenshot(page, scenarioName, cucumberWorld = null) {
  if (!page) return;
  const buffer = await page.screenshot({ fullPage: true }).catch(() => null);
  if (!buffer) return;

  const attachName = `Evidência - Falha - ${scenarioName}`;
  const filePath = getScreenshotFilePath('falha', scenarioName);
  ensureScreenshotsDir();
  fs.writeFileSync(filePath, buffer);

  const message = {
    type: 'attachment_content',
    data: {
      name: attachName,
      content: buffer.toString('base64'),
      encoding: 'base64',
      contentType: 'image/png',
      fileExtension: 'png',
      wrapInStep: true,
      timestamp: Date.now(),
    },
  };

  if (cucumberWorld && typeof cucumberWorld.attach === 'function') {
    await cucumberWorld.attach(JSON.stringify(message), ALLURE_RUNTIME_MESSAGE_CONTENT_TYPE);
  } else {
    await allure.attachment(attachName, buffer, 'image/png');
  }
}

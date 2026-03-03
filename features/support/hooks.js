/** Garante que o runtime global do Allure (Cucumber) está registrado; evita "no test runtime is found". */
import 'allure-cucumberjs';

import { Before, After, AfterStep, setWorldConstructor, setDefaultTimeout } from '@cucumber/cucumber';
import World from './world.js';
import {
  takeScreenshotAndAttachToAllure,
  takeFailureScreenshot,
} from '../../helpers/allureScreenshot.js';

// Timeout global para steps/hooks (login + navegação podem levar mais que 5s)
setDefaultTimeout(30_000);

setWorldConstructor(World);

Before(async function ({ pickle }) {
  this.scenarioName = pickle.name || 'Cenário';
  await this.init();
});

AfterStep(async function ({ pickleStep }) {
  const stepText = pickleStep.text?.trim() || pickleStep.keyword + ' ...';
  await takeScreenshotAndAttachToAllure(this.page, stepText, this);
});

After(async function (result) {
  const failed =
    result?.result?.status === 'failed' ||
    result?.result?.status === 'undefined';
  if (failed && this.page) {
    await takeFailureScreenshot(this.page, this.scenarioName, this);
  }
  await this.destroy();
});

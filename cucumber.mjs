export default {
  format: ['allure-cucumberjs/reporter', 'progress'],
  formatOptions: {
    resultsDir: 'reports/allure-results',
  },
  paths: ['features/**/*.feature'],
  import: ['features/support/*.js', 'features/step_definitions/**/*.js'],
  timeout: 30_000,
  parallel: 1,
};

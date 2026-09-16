import js from '@eslint/js';
import globals from 'globals';

const browserFiles = [
  'src/router.js',
  'src/route-lifecycle.js',
  'src/main.js',
  'src/cloudmon.js',
  'src/miphi.js',
  'src/miphi-wizard.js',
  'src/rayan.js',
  'src/privacy.js',
  'src/telemetry.js',
  'src/content-validation.js',
  'src/cookie-consent.js',
  'src/shared-footer.js',
  'src/views/**/*.js',
];

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'source-images/**'],
  },
  {
    ...js.configs.recommended,
    files: browserFiles,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    ...js.configs.recommended,
    files: ['vite.config.js', 'src/routes.config.js', 'eslint.config.js', 'scripts/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];

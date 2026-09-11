import js from '@eslint/js';
import globals from 'globals';

const browserFiles = [
  'router.js',
  'route-lifecycle.js',
  'main.js',
  'cloudmon.js',
  'miphi.js',
  'miphi-wizard.js',
  'telemetry.js',
  'content-validation.js',
  'views/**/*.js',
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
    files: ['vite.config.js', 'routes.config.js', 'eslint.config.js', 'scripts/**/*.mjs'],
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

const js = require('@eslint/js');
const eslintConfigPrettier = require('eslint-config-prettier');
const globals = require('globals');

module.exports = [
  {
    languageOptions: {
      globals: {
        ...globals.es2021,
        ...globals.node,
      },
    },
  },
  js.configs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      'arrow-body-style': ['error', 'as-needed'],
      'consistent-return': 'error',
      curly: ['error', 'multi-line', 'consistent'],
      eqeqeq: 'error',
      'no-console': 'warn',
      'no-shadow': 'error',
      'no-useless-constructor': 'error',
      'prefer-const': 'error',
      quotes: ['error', 'single', { avoidEscape: true }],
    },
  },
];

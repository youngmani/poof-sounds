import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

const config = [
  { languageOptions: { globals: { ...globals.es2021, ...globals.node } } },
  js.configs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      'arrow-body-style': ['error', 'as-needed'],
      'consistent-return': 'error',
      curly: ['error', 'multi-line', 'consistent'],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-console': 'warn',
      'no-shadow': 'error',
      'no-useless-constructor': 'error',
      'no-useless-rename': 'error',
      'object-shorthand': 'error',
      'prefer-const': 'error',
      quotes: ['error', 'single', { avoidEscape: true }],
    },
  },
];

export default config;

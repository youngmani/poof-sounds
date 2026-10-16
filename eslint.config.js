import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const config = defineConfig(
  { languageOptions: { globals: { ...globals.es2021, ...globals.node } } },
  js.configs.recommended,
  tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      'arrow-body-style': ['error', 'as-needed'],
      'consistent-return': 'error',
      curly: ['error', 'multi-line', 'consistent'],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-console': 'warn',
      'no-shadow': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { varsIgnorePattern: '^_' },
      ],
      'no-useless-constructor': 'error',
      'no-useless-rename': 'error',
      'object-shorthand': 'error',
      'prefer-const': 'error',
      quotes: ['error', 'single', { avoidEscape: true }],
    },
  },
);

export default config;

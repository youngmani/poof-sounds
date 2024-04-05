module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended', 'prettier'],
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
};

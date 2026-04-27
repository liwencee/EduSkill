module.exports = {
  env: { node: true, es2021: true, jest: true },
  extends: ['eslint:recommended', 'plugin:n/recommended', 'plugin:security/recommended'],
  plugins: ['n', 'security'],
  parserOptions: { ecmaVersion: 2021 },
  rules: {
    // Security
    'security/detect-object-injection': 'warn',
    'security/detect-non-literal-fs-filename': 'error',
    'security/detect-non-literal-regexp': 'warn',
    'security/detect-possible-timing-attacks': 'warn',
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'warn',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-new-buffer': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-pseudoRandomBytes': 'error',

    // Node
    'n/no-unsupported-features/es-syntax': 'off',
    'n/no-missing-require': 'error',

    // Code quality
    'no-console': 'warn',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-var': 'error',
    'prefer-const': 'error',
    'eqeqeq': ['error', 'always'],
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
  },
  ignorePatterns: ['node_modules/', 'coverage/', 'dist/'],
};

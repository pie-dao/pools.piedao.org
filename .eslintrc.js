module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'import/extensions': 0,
    'no-console': 0,
    'no-underscore-dangle': 0,
    'no-use-before-define': 0,
    'object-curly-newline': 0,
  },
};

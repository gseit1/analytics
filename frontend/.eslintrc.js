module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/standard'
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/multi-word-component-names': 'off',
    'space-before-function-paren': 'off',
    'no-trailing-spaces': 'off',
    'space-infix-ops': 'off',
    'operator-linebreak': 'off',
    'multiline-ternary': 'off',
    'indent': 'off',
    'comma-dangle': 'off',
    'no-unused-vars': 'warn'
  }
}

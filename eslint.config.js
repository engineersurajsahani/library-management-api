// @ts-check

import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import pluginPrettier from 'eslint-plugin-prettier';

export default [
  // Global ignores
  {
    ignores: ['node_modules/', 'dist/', 'build/'],
  },

  // Base configuration for Node.js CommonJS files
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
      },
    },
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'prettier/prettier': 'error',
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },

  // Apply recommended rules
  eslint.configs.recommended,

  // Apply prettier config to disable conflicting rules
  eslintConfigPrettier,
];

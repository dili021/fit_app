//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'
import sonarjs from 'eslint-plugin-sonarjs'

export default [
  ...tanstackConfig,
  {
    ignores: [
      'convex/_generated/**',
      'public/sw.js',
      'eslint.config.js',
      'prettier.config.js',
    ],
  },
  {
    plugins: {
      sonarjs,
    },
    rules: {
      // Default rules
      complexity: 'off',
      'sonarjs/cognitive-complexity': ['error', 15],
      'max-lines-per-function': [
        'error',
        {
          max: 150,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      'max-depth': ['error', 3],
      'max-nested-callbacks': ['error', 3],
      'no-nested-ternary': 'error',
      'max-params': ['error', 4],
      'max-lines': [
        'error',
        {
          max: 400,
          skipBlankLines: true,
          skipComments: true,
        },
      ],

      'sonarjs/no-duplicate-string': ['warn', { threshold: 3 }],
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-collapsible-if': 'error',
      'sonarjs/no-inverted-boolean-check': 'error',
      'sonarjs/prefer-immediate-return': 'error',
      'sonarjs/prefer-single-boolean-return': 'error',

      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': [
        'error',
        {
          ignoreVoid: true,
        },
      ],
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: false,
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
  // Component rules
  {
    files: ['src/components/**/*.tsx'],
    rules: {
      'sonarjs/cognitive-complexity': ['error', 12],
      'max-lines-per-function': ['error', 200],
      'max-params': ['error', 3],
    },
  },
  // Hook rules
  {
    files: ['src/hooks/**/*.ts'],
    rules: {
      'sonarjs/cognitive-complexity': ['error', 10],
      'max-lines-per-function': ['error', 80],
      'max-lines': ['error', 200],
      'max-depth': ['error', 2],
      'max-params': ['error', 3],
    },
  },
  // Route rules
  {
    files: ['src/routes/**/*.tsx'],
    rules: {
      'sonarjs/cognitive-complexity': ['error', 15],
      'max-lines-per-function': ['error', 150],
      'max-lines': ['error', 400],
    },
  },
  // Type rules
  {
    files: ['src/types/**/*.ts'],
    rules: {
      'sonarjs/cognitive-complexity': 'off',
      'max-lines-per-function': 'off',
      'max-lines': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  // Convex rules
  {
    files: ['src/convex/**/*.ts'],
    rules: {
      'sonarjs/cognitive-complexity': ['error', 10],
      'max-lines-per-function': ['error', 80],
      'max-lines': ['error', 200],
      'max-depth': ['error', 2],
      'max-params': ['error', 3],
    },
  },
]

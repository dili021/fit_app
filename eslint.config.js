//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

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
]

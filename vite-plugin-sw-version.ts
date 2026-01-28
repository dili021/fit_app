import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Plugin } from 'vite'

/**
 * Vite plugin to inject semver version into service worker during build
 * Modifies public/sw.js before Vite copies it to the output directory
 */
export function swVersionPlugin(): Plugin {
  return {
    name: 'sw-version',
    buildStart() {
      // Read package.json to get version
      const packageJsonPath = join(process.cwd(), 'package.json')
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
      const version = packageJson.version || '1.0.0'

      // Read the service worker template
      const swTemplatePath = join(process.cwd(), 'public/sw.js')
      let swContent = readFileSync(swTemplatePath, 'utf-8')

      // Replace CACHE_NAME with versioned cache name
      const cacheName = `training-tracker-${version}`
      swContent = swContent.replace(
        /const CACHE_NAME = ['"].*?['"]/,
        `const CACHE_NAME = '${cacheName}'`,
      )

      // Write the modified service worker (Vite will copy it from public/)
      writeFileSync(swTemplatePath, swContent, 'utf-8')
    },
  }
}

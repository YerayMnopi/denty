import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'

const emptyModule = fileURLToPath(new URL('./src/lib/empty-module.ts', import.meta.url))
const mongodbStub = fileURLToPath(new URL('./src/lib/mongodb-stub.ts', import.meta.url))
const openaiStub = fileURLToPath(new URL('./src/lib/openai-stub.ts', import.meta.url))

const mongodbOptionalDeps = [
  'mongodb-client-encryption',
  'aws4',
  'snappy',
  '@mongodb-js/zstd',
  '@aws-sdk/credential-providers',
  'gcp-metadata',
  'socks',
  'kerberos',
  '@mongodb-js/saslprep',
]

const serverOnlyPackages = ['mongodb', 'bson', 'openai']

const clientStubs: Record<string, string> = {
  mongodb: mongodbStub,
  bson: emptyModule,
  openai: openaiStub,
  ...Object.fromEntries(mongodbOptionalDeps.map((dep) => [dep, emptyModule])),
}

/**
 * Vite plugin that stubs server-only packages for the client bundle.
 * Uses resolveId to check the `ssr` flag per-request, which works
 * correctly in both dev and production builds.
 */
function stubServerPackages(): Plugin {
  return {
    name: 'stub-server-packages',
    enforce: 'pre',
    resolveId(source, _importer, options) {
      if (options?.ssr) return null
      const stub = clientStubs[source]
      if (stub) return stub
      return null
    },
  }
}

const config = defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    devtools(),
    stubServerPackages(),
    nitro({
      externals: {
        inline: [],
        external: [...serverOnlyPackages, ...mongodbOptionalDeps],
      },
    }),
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
  ssr: {
    external: [...serverOnlyPackages, ...mongodbOptionalDeps],
  },
})

export default config

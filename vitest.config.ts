import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Configurazione separata da vite.config.ts: quella avvia il plugin di Electron, che ai
// test non serve. I test girano in Node; quelli del renderer che hanno bisogno del DOM
// lo dichiarano in testa al file (`@vitest-environment jsdom`).
export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src/renderer/src'),
            // Mai il vero `electron` nei test: fuori da Electron scarica il binario se manca.
            electron: path.resolve(__dirname, 'src/test-support/electron-stub.ts'),
        },
    },
    test: {
        include: ['src/**/*.test.ts'],
        environment: 'node',
    },
})

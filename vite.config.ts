
import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'

import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
    root: path.join(__dirname, 'src/renderer'),
    base: './',
    build: {
        outDir: path.join(__dirname, 'dist'),
        emptyOutDir: true,
    },
    plugins: [
        react(),
        electron({
            main: {
                // Shortcut of `build.lib.entry`.
                entry: path.join(__dirname, 'src/main/index.ts'),
                vite: {
                    build: {
                        outDir: path.join(__dirname, 'dist-electron/main'),
                        // vite-plugin-electron (index.js:42) imposta build.lib.formats
                        // a ["es"] quando package.json ha "type":"module", ignorando
                        // rollupOptions.output.format: 'cjs'. Per forzare CJS dobbiamo
                        // sovrascrivere formats qui, che viene mergiato sopra il default.
                        lib: {
                            formats: ['cjs'],
                        },
                        rollupOptions: {
                            // In watch mode il watcher rileva i propri output e lancia
                            // una seconda build che ignora lib.formats:['cjs'] → ESM in .cjs.
                            // Escludendo le cartelle di output si rompe il loop.
                            watch: {
                                exclude: ['dist-electron/**', 'dist/**', 'node_modules/**'],
                            },
                            external: ['better-sqlite3', 'electron'],
                            output: {
                                format: 'cjs',
                                entryFileNames: '[name].cjs',
                                chunkFileNames: '[name]-[hash].cjs',
                            }
                        }
                    }
                }
            },
            preload: {
                // Shortcut of `build.rollupOptions.input`.
                input: path.join(__dirname, 'src/preload/index.ts'),
                vite: {
                    build: {
                        outDir: path.join(__dirname, 'dist-electron/preload'),
                        rollupOptions: {
                            output: {
                                entryFileNames: '[name].cjs',
                            }
                        }
                    }
                }
            },
            // Ployfill the Electron and Node.js built-in modules for Renderer process.
            // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
            renderer: {},
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src/renderer/src'),
        },
    },
})


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
                    plugins: [{
                        // vite-plugin-electron imposta lib.formats a ["es"] quando
                        // package.json ha "type":"module", e mergeConfig CONCATENA gli
                        // array: il nostro ["cjs"] diventava ["es","cjs"], cioè due build
                        // dello stesso index.cjs. In build la seconda vinceva (CJS); in
                        // watch (`npm run dev`) no, e index.cjs restava ESM. Qui si impone
                        // un solo formato, mutando la configurazione già fusa.
                        //
                        // Dalla 1.x il plugin impone anche il nome del file, `[name].js`: con
                        // "type":"module" Node avrebbe letto come modulo ES un file CommonJS,
                        // e package.json avvia `index.cjs`. Anche il nome si impone qui.
                        name: 'titan-main-cjs-only',
                        config(config) {
                            if (config.build?.lib) {
                                config.build.lib.formats = ['cjs']
                                config.build.lib.fileName = () => '[name].cjs'
                            }
                        },
                    }],
                    build: {
                        outDir: path.join(__dirname, 'dist-electron/main'),
                        // Senza pulizia restavano i chunk delle build precedenti, e
                        // electron-builder li impacchettava tutti (dist-electron/**).
                        emptyOutDir: true,
                        rolldownOptions: {
                            // Il watcher non deve reagire ai propri output.
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
                        emptyOutDir: true,
                        rolldownOptions: {
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

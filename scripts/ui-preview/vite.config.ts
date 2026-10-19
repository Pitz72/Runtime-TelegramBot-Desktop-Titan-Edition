import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..', '..')

/**
 * Anteprima dell'interfaccia nel browser: `npm run preview:ui`, poi http://localhost:5199
 *
 * Niente plugin di Electron: la pagina monta l'app vera con un `window.api` finto
 * (mock-api.ts). Parametri utili: ?empty (nessun bot), ?whatsnew (schermata novità),
 * ?reduce (animazioni ridotte), ?autostart (motore già acceso all'apertura), ?axe (audit di accessibilità al caricamento, risultato in window.__axe).
 *
 * `cacheDir` separata e `dedupe` di React: senza, convivono due copie di React
 * (framer-motion ne prende una, l'app l'altra) e gli hook esplodono.
 */
export default defineConfig({
    root: here,
    cacheDir: path.join(root, 'node_modules/.vite-ui-preview'),
    plugins: [react()],
    css: { postcss: path.join(root, 'postcss.config.js') },
    resolve: {
        alias: { '@': path.join(root, 'src/renderer/src') },
        dedupe: ['react', 'react-dom'],
    },
    server: { port: 5199, strictPort: true, fs: { allow: [root] } },
})

import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'

import { defineConfig } from 'vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from 'tailwindcss'

// Load backend target from public/appsettings.json
// let targetUrl = 'http://127.0.0.1:8000/api/v1'
let targetUrl = 'https://unaffecting-christel-semijocularly.ngrok-free.dev/api/v1'
try {
  const settingsPath = path.resolve(__dirname, 'public/appsettings.json')
  if (fs.existsSync(settingsPath)) {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'))
    const backend = settings.Backend
    if (backend) {
      const { Addresss, HttpPort, HttpsPort, APIPrefix } = backend
      const protocol = HttpsPort ? 'https' : 'http'
      const port = HttpsPort || HttpPort
      const host = port ? `${Addresss}:${port}` : Addresss
      targetUrl = `${protocol}://${host}${APIPrefix}`
      console.log(`[Vite Proxy] Target URL loaded from appsettings.json: ${targetUrl}`)
    }
  }
} catch (error) {
  console.warn('[Vite Proxy] Failed to load target from appsettings.json, using default:', targetUrl)
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api': {
        target: targetUrl,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})


import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
/// <reference types="vitest" />
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL || 'http://localhost:8080'
  const targetOrigin = apiUrl ? new URL(apiUrl).origin : undefined

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: targetOrigin
        ? {
            '/api': {
              target: targetOrigin,
              changeOrigin: true
            },
            '/ws': {
              target: targetOrigin,
              ws: true
            }
          }
        : undefined
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/main.tsx', 'src/**/*.d.ts', 'src/test/**'],
      },
    },
  }
})

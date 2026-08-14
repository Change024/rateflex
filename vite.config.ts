import path from 'path'
import { defineConfig } from '@lark-apaas/coding-preset-vite-react'

const clientBasePath = process.env.CLIENT_BASE_PATH || '/'

export default defineConfig({
  base: `${clientBasePath.replace(/\/$/, '')}/`,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@shared': path.resolve(__dirname, 'shared'),
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  root: path.resolve(__dirname, '.'),
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('@firebase/auth') ||
            id.includes('firebase/auth') ||
            id.includes('@firebase\\auth') ||
            id.includes('firebase\\auth')
          ) {
            return 'firebase-auth'
          }
          if (
            id.includes('node_modules/firebase') ||
            id.includes('node_modules/@firebase') ||
            id.includes('node_modules\\firebase') ||
            id.includes('node_modules\\@firebase')
          ) {
            return 'firebase-db'
          }
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules\\react')
          ) {
            return 'react-vendor'
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared'),
      '@siteData': path.resolve(__dirname, '../src/data.ts'),
      '@siteAssets': path.resolve(__dirname, '../src/assets'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true,
    watch: {
      ignored: [
        /[\\/]\.figma[\\/]/,
        /[\\/]\.claude[\\/]/,
        /[\\/]\.firebase[\\/]/,
        /[\\/]\.agents[\\/]/,
        /[\\/]\.cursor[\\/]/,
        /[\\/]\.kiro[\\/]/,
        /[\\/]\.github[\\/]/,
        /[\\/]\.git[\\/]/,
        /[\\/]\.system_generated[\\/]/,
        /[\\/]dist[\\/]/,
        /[\\/]admin[\\/]dist[\\/]/,
        /[\\/]node_modules[\\/]/,
        /\.log$/,
        /\.jsonl$/,
        /\.md$/,
        /CLAUDE\.md$/,
        '**/.figma/**',
        '**/.claude/**',
        '**/.firebase/**',
        '**/.agents/**',
        '**/.cursor/**',
        '**/.kiro/**',
        '**/.github/**',
        '**/.git/**',
        '**/dist/**',
        '**/admin/dist/**',
        '**/*.log',
        '**/node_modules/**',
        '**/.system_generated/**',
        '**/CLAUDE.md',
        '**/*.md',
        '**/*.jsonl',
      ],
    },
    fs: {
      allow: [path.resolve(__dirname, '..')],
    },
  },
  preview: {
    port: 5174,
    strictPort: true,
  },
})

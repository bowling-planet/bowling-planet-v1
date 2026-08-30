import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import viteCompressionImport from 'vite-plugin-compression'

const viteCompression = (viteCompressionImport as any).default || viteCompressionImport;

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    viteCompression({ algorithm: 'brotliCompress' }),
    viteCompression({ algorithm: 'gzip' })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor';
            if (id.includes('three')) return 'three';
            if (id.includes('@tiptap') || id.includes('@blocknote')) return 'editor';
            return 'utils';
          }
        }
      }
    }
  }
})

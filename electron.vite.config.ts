import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

const rendererSrcDir = fileURLToPath(new URL('./src/renderer', import.meta.url))

export default defineConfig({
  main: {
    build: {
      outDir: 'dist/electron/main'
    }
  },
  preload: {
    build: {
      outDir: 'dist/electron/preload'
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': rendererSrcDir,
        '@shared': fileURLToPath(new URL('./shared', import.meta.url))
      }
    },
    plugins: [vue()],
    build: {
      outDir: 'dist/electron/renderer',
      emptyOutDir: false
    },
    server: {
      fs: {
        allow: [rendererSrcDir]
      }
    }
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react-dom')) return 'vendor-react'
          if (id.includes('framer-motion')) return 'vendor-framer'
          if (id.includes('tsparticles')) return 'vendor-particles'
          if (id.includes('node_modules')) return 'vendor'
        },
      },
    },

    chunkSizeWarningLimit: 200,
    assetsDir: 'assets',
    sourcemap: false,
  },

  server: {
    port: 5173,
    strictPort: true,
  },
})

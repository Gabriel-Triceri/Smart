import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: __dirname, // Set the root directory to the absolute path
  server: {
    port: 3000,
    open: true
  }
})

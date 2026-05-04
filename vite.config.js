import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    hmr: true,
    // HTTPS disabled — both frontend and backend run HTTP during development
    // Before presentation: enable https:true here AND uncomment TLS in application.properties
  }
})
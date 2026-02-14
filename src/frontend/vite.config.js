import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    define: {
        __BUILD_VERSION__: JSON.stringify(new Date().toISOString().replace(/[T:]/g, '-').slice(0, 19)),
    },
    plugins: [react()],
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true
            }
        }
    }
})

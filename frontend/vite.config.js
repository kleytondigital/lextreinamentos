import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import tailwindcss from 'vite-plugin-tailwind';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false
            }
        }
    }
})
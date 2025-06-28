import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-manifest',
      writeBundle() {
        // Copiar manifest.json y la carpeta icons a dist
        try {
          mkdirSync('dist', { recursive: true });
          copyFileSync('manifest.json', 'dist/manifest.json');
          // Copiar iconos
          if (existsSync('icons')) {
            mkdirSync('dist/icons', { recursive: true });
            for (const file of readdirSync('icons')) {
              copyFileSync(`icons/${file}`, `dist/icons/${file}`);
            }
          }
        } catch (error) {
          console.warn('Warning: No se pudo copiar manifest o iconos:', error.message);
        }
      }
    }
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
      },
      output: {
        entryFileNames: '[name]/[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.html')) {
            return '[name]/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  }
});


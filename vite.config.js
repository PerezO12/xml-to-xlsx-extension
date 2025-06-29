import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-manifest-and-background',
      writeBundle() {
        // Copiar manifest.json, la carpeta icons y background script a dist
        try {
          mkdirSync('dist', { recursive: true });
          mkdirSync('dist/src', { recursive: true });
          
          // Copiar manifest
          copyFileSync('manifest.json', 'dist/manifest.json');
          
          // Copiar background script
          if (existsSync('src/background.js')) {
            copyFileSync('src/background.js', 'dist/src/background.js');
          }
          
          // Copiar iconos
          if (existsSync('icons')) {
            mkdirSync('dist/icons', { recursive: true });
            for (const file of readdirSync('icons')) {
              copyFileSync(`icons/${file}`, `dist/icons/${file}`);
            }
          }
        } catch (error) {
          console.warn('Warning: No se pudo copiar archivos:', error.message);
        }
      }
    }
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        carga: resolve(__dirname, 'carga.html'),
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
    },
    // Configuración específica para Firefox WebExtensions
    target: 'es2018', // Compatible con Firefox 57+
    minify: 'esbuild', // Usar esbuild en lugar de terser
    sourcemap: false
  }
});


import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// PORT hanya dipakai untuk dev server — tidak wajib saat production build
const port = Number(process.env.PORT || '3000');

// BASE_PATH: default '/' untuk production build di luar Replit
const basePath = process.env.BASE_PATH || '/';

const isReplit = process.env.REPL_ID !== undefined;
const isDev = process.env.NODE_ENV !== 'production';

export default defineConfig(async () => {
  const plugins: any[] = [react(), tailwindcss()];

  // Plugin Replit hanya aktif saat di lingkungan Replit (bukan Docker)
  if (isDev && isReplit) {
    try {
      const { default: runtimeErrorOverlay } = await import(
        '@replit/vite-plugin-runtime-error-modal'
      );
      plugins.push(runtimeErrorOverlay());

      const { cartographer } = await import('@replit/vite-plugin-cartographer');
      plugins.push(
        cartographer({ root: path.resolve(import.meta.dirname, '..') }),
      );

      const { devBanner } = await import('@replit/vite-plugin-dev-banner');
      plugins.push(devBanner());
    } catch {
      // Plugin Replit tidak tersedia — abaikan (normal saat build di Docker)
    }
  }

  return {
    base: basePath,
    plugins,
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, 'src'),
      },
      dedupe: ['react', 'react-dom'],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, 'dist/public'),
      emptyOutDir: true,
    },
    server: {
      port,
      strictPort: true,
      host: '0.0.0.0',
      allowedHosts: true,
      fs: { strict: true },
    },
    preview: {
      port,
      host: '0.0.0.0',
      allowedHosts: true,
    },
  };
});

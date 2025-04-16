import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { splitVendorChunkPlugin } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import imagemin from 'vite-plugin-imagemin';
import compression from 'vite-plugin-compression';
import { createHtmlPlugin } from 'vite-plugin-html';
export default defineConfig(({ command, mode }) => ({
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    }),
    imagemin({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false,
      },
      optipng: {
        optimizationLevel: 7,
      },
      mozjpeg: {
        quality: 80,
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4,
      },
      svgo: {
        plugins: [
          {
            name: 'removeViewBox',
          },
          {
            name: 'removeEmptyAttrs',
            active: false,
          },
        ],
      },
    }),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          title: 'Web Engine Platform',
          description: 'A comprehensive web engine platform for web applications',
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@core': path.resolve(__dirname, './src/core'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: mode === 'development',
    minify: mode === 'production' ? 'terser' : false,
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
      },
    },
    rollupOptions: {
      output: {
        manualChunks: id => {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/@emotion/')) {
            return 'emotion-vendor';
          }
          if (id.includes('node_modules/@aws-sdk/')) {
            return 'aws-vendor';
          }
          if (id.includes('/src/core/theme/')) {
            return 'theme';
          }
          if (id.includes('/src/components/')) {
            const match = id.match(/\/src\/components\/([^/]+)/);
            if (match) {
              return `components-${match[1]}`;
            }
            return 'components-shared';
          }
          if (id.includes('/src/hooks/')) {
            return 'hooks';
          }
          if (id.includes('/src/utils/')) {
            return 'utils';
          }
          if (id.includes('/src/pages/')) {
            const match = id.match(/\/src\/pages\/([^/]+)/);
            if (match) {
              return `pages-${match[1]}`;
            }
          }
        },
        chunkFileNames: chunkInfo => {
          const name = chunkInfo.name;
          if (name.includes('vendor')) {
            return 'assets/js/vendor/[name]-[hash].js';
          }
          if (name.includes('components-')) {
            return 'assets/js/components/[name]-[hash].js';
          }
          if (name.includes('pages-')) {
            return 'assets/js/pages/[name]-[hash].js';
          }
          return 'assets/js/[name]-[hash].js';
        },
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: assetInfo => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          if (/\.css$/.test(assetInfo.name)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[ext]/[name]-[hash][extname]`;
        },
      },
    },
    target: 'es2020',
    cssCodeSplit: true,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096,
    cssTarget: ['chrome61', 'safari11', 'firefox60', 'edge79'],
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@emotion/react',
      '@emotion/styled',
      '@aws-sdk/client-s3',
      '@aws-sdk/s3-request-presigner',
    ],
    exclude: ['@nestjs/platform-express'],
    esbuildOptions: {
      target: 'es2020',
      supported: {
        'top-level-await': true,
      },
    },
  },
}));

import { defineConfig, loadEnv, ConfigEnv, UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { splitVendorChunkPlugin } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import imagemin from 'vite-plugin-imagemin';
import compression from 'vite-plugin-compression';
import { createHtmlPlugin } from 'vite-plugin-html';
import fs from 'fs';
import { execSync } from 'child_process';

// Type extensions for third-party libraries
declare module 'vite' {
  interface HmrOptions {
    css?: boolean;
    react?: boolean;
  }
}

// Type extension for compression plugin
declare module 'vite-plugin-compression' {
  interface CompressionOptions {
    deleteOriginFile?: boolean;
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  // Load env variables from the correct file based on mode
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';
  const isAnalyze = mode === 'analyze';
  
  // Custom plugin to generate service worker after build
  const generateServiceWorkerPlugin = () => {
    return {
      name: 'generate-service-worker',
      closeBundle: async () => {
        if (mode === 'production' || mode === 'staging') {
          console.log('Generating service worker...');
          try {
            // Ensure the service-worker.js file exists in src directory
            if (!fs.existsSync('./src/service-worker.js')) {
              console.error('service-worker.js file not found in src directory!');
              return;
            }
            
            // Run Workbox to generate the service worker
            execSync('npx workbox-cli generateSW workbox-config.js', { stdio: 'inherit' });
            console.log('Service worker generated successfully!');
          } catch (error) {
            console.error('Error generating service worker:', error);
          }
        }
      },
    };
  };

  // Custom plugin to optimize modern/legacy browser handling
  const generateModernLegacyPlugin = () => {
    return {
      name: 'modern-legacy',
      // This plugin only adds attributes to script tags in the HTML
      transformIndexHtml(html) {
        // Only apply in production
        if (!isProduction) return html;
        
        // Add module/nomodule pattern for script tags
        return html.replace(
          /<script type="module" crossorigin src="([^"]+)"><\/script>/g,
          (match, src) => {
            // For modern browsers
            return `<script type="module" crossorigin src="${src}"></script>`;
          }
        );
      },
    };
  };

  // Determine optimization level based on mode
  const getOptimizationLevel = () => {
    switch (mode) {
      case 'production':
        return {
          minify: 'terser' as const,
          treeshake: true,
          mangleProps: /^_/,
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.info', 'console.debug'],
          }
        };
      case 'staging':
        return {
          minify: 'terser' as const,
          treeshake: true,
          compress: {
            drop_debugger: true,
            pure_funcs: ['console.debug'],
          }
        };
      default:
        return {
          minify: false as const,
          treeshake: false,
        };
    }
  };

  // Get optimization level
  const optimization = getOptimizationLevel();

  return {
    plugins: [
      react({
        // Fast Refresh is enabled by default in dev mode
        jsxRuntime: 'automatic',
        babel: {
          plugins: [
            ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
            // Add transform-react-remove-prop-types for production
            ...(isProduction ? [
              ['transform-react-remove-prop-types', {
                removeImport: true,
                additionalLibraries: ['prop-types'],
              }]
            ] : [])
          ],
          // Add tree shaking optimization for dev dependencies
          presets: [
            ['@babel/preset-env', {
              modules: false, // Preserve ES modules for better tree shaking
              loose: true, // More performant code, but less spec-compliant
              bugfixes: true, // Apply bugfixes to reduce code output
              useBuiltIns: 'usage', // Only include polyfills that are used
              corejs: 3, // Use core-js version 3
            }]
          ]
        },
      }),
      splitVendorChunkPlugin(),
      visualizer({
        filename: 'dist/stats.html',
        open: isAnalyze, // Only auto-open when in analyze mode
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
        // Custom options for the compression plugin
        deleteOriginFile: false,
      } as { algorithm: 'gzip'; ext: string; deleteOriginFile: boolean }),
      compression({
        algorithm: 'brotliCompress',
        ext: '.br',
        // Custom options for the compression plugin
        deleteOriginFile: false,
      } as { algorithm: 'brotliCompress'; ext: string; deleteOriginFile: boolean }),
      createHtmlPlugin({
        minify: isProduction,
        inject: {
          data: {
            title: 'Web Engine Platform',
            description: 'A comprehensive web engine platform for web applications',
          },
        },
      }),
      generateServiceWorkerPlugin(),
      generateModernLegacyPlugin(),
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
      hmr: {
        overlay: true,
        // Custom HMR options
        css: true as any,
        react: true as any,
        timeout: 5000,
      },
      watch: {
        usePolling: true,
        ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
      },
      cors: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: !isProduction, // Only enable sourcemaps for non-production builds
      minify: optimization.minify,
      terserOptions: {
        compress: optimization.compress,
        mangle: isProduction, // Mangle variable names in production
        keep_fnames: !isProduction, // Keep function names except in production
        keep_classnames: !isProduction, // Keep class names except in production
        format: {
          comments: !isProduction ? 'all' : false // Remove comments in production
        }
      },
      rollupOptions: {
        // Use native tree shaking
        treeshake: optimization.treeshake ? {
          moduleSideEffects: false, // Assume no side effects for better tree shaking
          propertyReadSideEffects: false, // Assume property reads have no side effects
          tryCatchDeoptimization: false, // Don't deoptimize try/catch blocks
        } : false,
        output: {
          manualChunks: (id: string) => {
            // Split vendor chunks by framework and major libraries
            if (id.includes('node_modules/react/') || 
                id.includes('node_modules/react-dom/') || 
                id.includes('node_modules/scheduler/')) {
              return 'react-vendor';
            }
            
            if (id.includes('node_modules/@emotion/') || 
                id.includes('node_modules/styled-components/')) {
              return 'styling-vendor';
            }
            
            if (id.includes('node_modules/@mui/')) {
              return 'mui-vendor';
            }
            
            if (id.includes('node_modules/@aws-sdk/')) {
              return 'aws-vendor';
            }
            
            if (id.includes('node_modules/@tanstack/react-query')) {
              return 'query-vendor';
            }
            
            if (id.includes('node_modules/firebase/')) {
              return 'firebase-vendor';
            }
            
            if (id.includes('node_modules/') &&
               !id.includes('node_modules/@mui/') &&
               !id.includes('node_modules/react/') &&
               !id.includes('node_modules/react-dom/') &&
               !id.includes('node_modules/@emotion/') &&
               !id.includes('node_modules/@aws-sdk/') &&
               !id.includes('node_modules/@tanstack/') &&
               !id.includes('node_modules/firebase/')) {
              return 'vendor-common';
            }

            // Feature-based splitting for application code
            if (id.includes('/src/core/theme/')) {
              return 'theme';
            }
            
            // Split components by feature using more granular chunking
            if (id.includes('/src/components/')) {
              // Group components by subdirectory
              const match = id.match(/\/src\/components\/([^/]+)/);
              if (match) {
                const componentType = match[1];
                return `components-${componentType}`;
              }
              return 'components-shared';
            }
            
            if (id.includes('/src/hooks/')) {
              return 'hooks';
            }
            
            if (id.includes('/src/utils/')) {
              return 'utils';
            }

            // Route-based splitting for page components
            if (id.includes('/src/pages/')) {
              // Each page gets its own chunk for better code splitting
              // This works well with dynamic imports
              const fileMatch = id.match(/\/src\/pages\/([^/]+)/);
              if (fileMatch) {
                return `pages-${fileMatch[1]}`;
              }
            }
            
            // Default chunk name
            return null;
          },
          chunkFileNames: (chunkInfo) => {
            const name = chunkInfo.name;
            
            // Vendor chunks go to vendor directory
            if (name?.includes('vendor')) {
              return 'assets/js/vendor/[name]-[hash].js';
            }
            
            // Component chunks go to components directory
            if (name?.includes('components-')) {
              return 'assets/js/components/[name]-[hash].js';
            }
            
            // Page chunks go to pages directory
            if (name?.includes('pages-')) {
              return 'assets/js/pages/[name]-[hash].js';
            }
            
            // All other chunks
            return 'assets/js/[name]-[hash].js';
          },
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            if (!assetInfo.name) return 'assets/[ext]/[name]-[hash][extname]';

            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];

            // Group assets by type
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
      target: isProduction ? 'es2015' : 'es2020', // Target older browsers in production
      cssCodeSplit: true,
      reportCompressedSize: !isProduction, // Disable in production for faster builds
      chunkSizeWarningLimit: 1000,
      assetsInlineLimit: 4096, // 4kb
      cssTarget: ['chrome61', 'safari11', 'firefox60', 'edge79'],
    },
    optimizeDeps: {
      // Pre-bundle these dependencies for faster dev startup
      include: [
        'react',
        'react-dom',
        '@emotion/react',
        '@emotion/styled',
        '@aws-sdk/client-s3',
        '@aws-sdk/s3-request-presigner',
        'react-router-dom',
        'react-error-boundary',
        '@reduxjs/toolkit',
        'react-redux',
      ],
      exclude: ['@nestjs/platform-express'], // Exclude server-only dependencies
      esbuildOptions: {
        target: 'es2020',
        supported: {
          'top-level-await': true,
        },
        plugins: [
          // Add tree-shaking for dev mode with special comment handling
          {
            name: 'dev-tree-shaking',
            setup(build) {
              build.onLoad({ filter: /\.[jt]sx?$/ }, async (args) => {
                if (!args.path.includes('node_modules')) {
                  const content = fs.readFileSync(args.path, 'utf8');
                  // Handle pure annotations in developer code
                  if (content.includes('/*#__PURE__*/')) {
                    return {
                      contents: content,
                      loader: args.path.endsWith('tsx') ? 'tsx' : 'jsx',
                    };
                  }
                }
                return null;
              });
            },
          },
        ],
      },
    },
    // Add modern/legacy browser conditionals
    define: {
      'import.meta.env.MODERN_BUILD': JSON.stringify(true),
      ...Object.keys(env).reduce((acc, key) => {
        if (key.startsWith('VITE_')) {
          acc[`import.meta.env.${key}`] = JSON.stringify(env[key]);
        }
        return acc;
      }, {} as Record<string, string>),
    },
  };
});

declare module 'vite-plugin-compression' {
  interface CompressionOptions {
    algorithm?: 'gzip' | 'brotliCompress';
    ext?: string;
  }

  function compression(options?: CompressionOptions): any;
  export default compression;
}

declare module 'vite-plugin-imagemin' {
  interface ImageminOptions {
    gifsicle?: {
      optimizationLevel?: number;
      interlaced?: boolean;
    };
    optipng?: {
      optimizationLevel?: number;
    };
    mozjpeg?: {
      quality?: number;
    };
    pngquant?: {
      quality?: [number, number];
      speed?: number;
    };
    svgo?: {
      plugins?: Array<{
        name?: string;
        active?: boolean;
      }>;
    };
  }

  function imagemin(options?: ImageminOptions): any;
  export default imagemin;
}

declare module 'vite-plugin-html' {
  interface HtmlPluginOptions {
    minify?: boolean;
    inject?: {
      data?: {
        title?: string;
        description?: string;
        [key: string]: any;
      };
    };
  }

  export function createHtmlPlugin(options?: HtmlPluginOptions): any;
}

declare module 'rollup-plugin-visualizer' {
  interface VisualizerOptions {
    filename?: string;
    open?: boolean;
    gzipSize?: boolean;
    brotliSize?: boolean;
    template?: 'sunburst' | 'treemap' | 'network';
  }

  export function visualizer(options?: VisualizerOptions): any;
}

/**
 * DataCompression
 * 
 * Provides utilities for data compression to optimize transfer sizes
 * for large datasets in ETL operations.
 */

import { TransformerFunction } from './types';

/**
 * Compression formats supported by the system
 */
export type CompressionFormat = 'gzip' | 'deflate' | 'brotli' | 'lz4' | 'zstd';

/**
 * Compression level (higher = better compression, slower speed)
 */
export type CompressionLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/**
 * Compression options
 */
export interface CompressionOptions {
  format?: CompressionFormat;
  level?: CompressionLevel;
  dictionary?: Uint8Array | null;
  chunkSize?: number;
}

/**
 * Metadata for compressed data
 */
export interface CompressionMetadata {
  dataType?: 'json' | string;
  timestamp?: string;
  chunkIndex?: number;
  totalChunks?: number;
  itemCount?: number;
  startIndex?: number;
  endIndex?: number;
  [key: string]: unknown;
}

/**
 * Compressed data with metadata
 */
export interface CompressedData {
  format: CompressionFormat;
  data: Uint8Array;
  originalSize: number;
  compressedSize: number;
  metadata?: CompressionMetadata;
}

/**
 * Utility class for data compression
 */
export class DataCompression {
  /**
   * Default compression format to use
   */
  private static defaultFormat: CompressionFormat = 'gzip';

  /**
   * Default compression level
   */
  private static defaultLevel: CompressionLevel = 6;

  /**
   * Default chunk size for streaming compression (bytes)
   */
  private static defaultChunkSize = 1024 * 64; // 64KB

  /**
   * Set default compression options
   */
  static setDefaults(options: Partial<CompressionOptions>): void {
    if (options.format) {
      this.defaultFormat = options.format;
    }
    if (options.level !== undefined) {
      this.defaultLevel = options.level;
    }
    if (options.chunkSize) {
      this.defaultChunkSize = options.chunkSize;
    }
  }

  /**
   * Convert a string to a Uint8Array
   */
  private static textToBuffer(text: string): Uint8Array {
    const encoder = new TextEncoder();
    return encoder.encode(text);
  }

  /**
   * Convert a Uint8Array to a string
   */
  private static bufferToText(buffer: Uint8Array): string {
    const decoder = new TextDecoder();
    return decoder.decode(buffer);
  }

  /**
   * Compress data using the browser's CompressionStream API
   * (For modern browsers that support Web Streams API)
   */
  static async compressWithStreams(
    data: string | Uint8Array, 
    options: CompressionOptions = {}
  ): Promise<CompressedData> {
    // Check if CompressionStream is available
    if (typeof CompressionStream === 'undefined') {
      throw new Error('CompressionStream API is not supported in this environment');
    }

    const format = options.format || this.defaultFormat;
    
    // Only gzip and deflate are supported by CompressionStream
    if (format !== 'gzip' && format !== 'deflate') {
      throw new Error(`Format ${format} is not supported by CompressionStream API`);
    }
    
    // Convert input to Uint8Array if it's a string
    const inputData = typeof data === 'string' ? this.textToBuffer(data) : data;
    const originalSize = inputData.length;
    
    // Create a compression stream
    const cs = new CompressionStream(format);
    const writer = cs.writable.getWriter();
    
    // Write the data
    await writer.write(inputData);
    await writer.close();
    
    // Read the compressed data
    const reader = cs.readable.getReader();
    const chunks: Uint8Array[] = [];
    
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    // Combine chunks
    let totalLength = 0;
    for (const chunk of chunks) {
      totalLength += chunk.length;
    }
    
    const compressedData = new Uint8Array(totalLength);
    let offset = 0;
    
    for (const chunk of chunks) {
      compressedData.set(chunk, offset);
      offset += chunk.length;
    }
    
    return {
      format,
      data: compressedData,
      originalSize,
      compressedSize: compressedData.length,
    };
  }

  /**
   * Decompress data using the browser's DecompressionStream API
   * (For modern browsers that support Web Streams API)
   */
  static async decompressWithStreams(
    compressed: CompressedData
  ): Promise<Uint8Array> {
    // Check if DecompressionStream is available
    if (typeof DecompressionStream === 'undefined') {
      throw new Error('DecompressionStream API is not supported in this environment');
    }
    
    const { format, data } = compressed;
    
    // Only gzip and deflate are supported by DecompressionStream
    if (format !== 'gzip' && format !== 'deflate') {
      throw new Error(`Format ${format} is not supported by DecompressionStream API`);
    }
    
    // Create a decompression stream
    const ds = new DecompressionStream(format);
    const writer = ds.writable.getWriter();
    
    // Write the compressed data
    await writer.write(data);
    await writer.close();
    
    // Read the decompressed data
    const reader = ds.readable.getReader();
    const chunks: Uint8Array[] = [];
    
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    // Combine chunks
    let totalLength = 0;
    for (const chunk of chunks) {
      totalLength += chunk.length;
    }
    
    const decompressedData = new Uint8Array(totalLength);
    let offset = 0;
    
    for (const chunk of chunks) {
      decompressedData.set(chunk, offset);
      offset += chunk.length;
    }
    
    return decompressedData;
  }

  /**
   * Compress a string or object using JSON stringification and compression
   */
  static async compressJSON<T>(
    data: T, 
    options: CompressionOptions = {}
  ): Promise<CompressedData> {
    const jsonString = JSON.stringify(data);
    const compressed = await this.compressWithStreams(jsonString, options);
    
    compressed.metadata = {
      dataType: 'json',
      timestamp: new Date().toISOString(),
    };
    
    return compressed;
  }

  /**
   * Decompress and parse JSON data
   */
  static async decompressJSON<T>(compressed: CompressedData): Promise<T> {
    const decompressedBuffer = await this.decompressWithStreams(compressed);
    const jsonString = this.bufferToText(decompressedBuffer);
    
    return JSON.parse(jsonString) as T;
  }

  /**
   * Calculate the compression ratio
   */
  static getCompressionRatio(compressed: CompressedData): number {
    if (compressed.compressedSize === 0) return 0;
    return compressed.originalSize / compressed.compressedSize;
  }

  /**
   * Get a human-readable compression summary
   */
  static getCompressionSummary(compressed: CompressedData): string {
    const ratio = this.getCompressionRatio(compressed);
    const savings = 100 * (1 - 1 / ratio);
    
    return `${compressed.format}: ${formatFileSize(compressed.originalSize)} → ${formatFileSize(compressed.compressedSize)}, ` +
           `ratio: ${ratio.toFixed(2)}x (${savings.toFixed(1)}% smaller)`;
  }

  /**
   * Create a compression transformer for ETL pipeline
   */
  static createCompressionTransformer<T>(
    options: CompressionOptions = {}
  ): TransformerFunction<T, Promise<CompressedData>> {
    return (data: T) => this.compressJSON<T>(data, options);
  }

  /**
   * Create a decompression transformer for ETL pipeline
   */
  static createDecompressionTransformer<T>(): TransformerFunction<CompressedData, Promise<T>> {
    return (compressed: CompressedData) => this.decompressJSON<T>(compressed);
  }

  /**
   * Handle large datasets by compressing in chunks
   */
  static async compressLargeDataset<T>(
    data: T[], 
    options: CompressionOptions & { maxItemsPerChunk?: number } = {}
  ): Promise<CompressedData[]> {
    const maxItemsPerChunk = options.maxItemsPerChunk || 1000;
    const chunks: CompressedData[] = [];
    
    // Process data in chunks
    for (let i = 0; i < data.length; i += maxItemsPerChunk) {
      const chunk = data.slice(i, i + maxItemsPerChunk);
      const compressed = await this.compressJSON(chunk, options);
      
      // Add chunk metadata
      compressed.metadata = {
        ...compressed.metadata,
        chunkIndex: i / maxItemsPerChunk,
        totalChunks: Math.ceil(data.length / maxItemsPerChunk),
        itemCount: chunk.length,
        startIndex: i,
        endIndex: i + chunk.length - 1,
      };
      
      chunks.push(compressed);
    }
    
    return chunks;
  }

  /**
   * Reassemble a large dataset from compressed chunks
   */
  static async decompressLargeDataset<T>(
    compressedChunks: CompressedData[]
  ): Promise<T[]> {
    // Sort chunks by index if they exist
    const sortedChunks = [...compressedChunks].sort((a, b) => {
      const indexA = a.metadata?.chunkIndex ?? 0;
      const indexB = b.metadata?.chunkIndex ?? 0;
      return indexA - indexB;
    });
    
    // Decompress all chunks
    const decompressedChunks: T[][] = [];
    
    for (const chunk of sortedChunks) {
      const decompressed = await this.decompressJSON<T[]>(chunk);
      decompressedChunks.push(decompressed);
    }
    
    // Flatten all chunks
    return decompressedChunks.flat();
  }

  /**
   * Create blob URL for downloading compressed data
   */
  static createDownloadUrl(
    compressed: CompressedData, 
    filename?: string
  ): { url: string; filename: string } {
    const blob = new Blob([compressed.data], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    
    // Generate default filename if not provided
    const defaultFilename = `data-${new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')}.${compressed.format}`;
    
    return {
      url,
      filename: filename || defaultFilename,
    };
  }

  /**
   * Release resources of a blob URL
   */
  static releaseDownloadUrl(url: string): void {
    URL.revokeObjectURL(url);
  }
}

/**
 * Format a file size in bytes to a human-readable string
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  } else {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }
} 
/**
 * Example demonstrating data compression for large transfers
 * 
 * This example shows how to:
 * 1. Compress JSON data for efficient transfer
 * 2. Decompress data after receiving it
 * 3. Handle large datasets with chunked compression
 * 4. Integrate compression with ETL pipelines
 */

import { DataCompression, DataTransformer, CompressedData } from '../';

// Example dataset for demonstration
interface SensorReading {
  id: string;
  deviceId: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  pressure: number;
  battery: number;
  coordinates: {
    latitude: number;
    longitude: number;
    altitude?: number;
  };
  tags: string[];
  metadata: Record<string, any>;
}

/**
 * Generate a sample dataset of sensor readings
 */
function generateSampleData(count: number): SensorReading[] {
  const data: SensorReading[] = [];
  const deviceIds = ['sensor-001', 'sensor-002', 'sensor-003', 'sensor-004', 'sensor-005'];
  const tagOptions = ['indoor', 'outdoor', 'critical', 'normal', 'warning', 'error', 'maintenance'];
  
  const now = new Date();
  const startTime = now.getTime() - (count * 60000); // 1 minute intervals
  
  for (let i = 0; i < count; i++) {
    const timestamp = new Date(startTime + (i * 60000)).toISOString();
    const deviceId = deviceIds[Math.floor(Math.random() * deviceIds.length)];
    
    // Select 1-3 random tags
    const tags: string[] = [];
    const tagCount = Math.floor(Math.random() * 3) + 1;
    for (let t = 0; t < tagCount; t++) {
      const tag = tagOptions[Math.floor(Math.random() * tagOptions.length)];
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    }
    
    data.push({
      id: `reading-${i.toString().padStart(6, '0')}`,
      deviceId,
      timestamp,
      temperature: 20 + (Math.random() * 15 - 5), // 15°C to 30°C
      humidity: 30 + (Math.random() * 60),        // 30% to 90%
      pressure: 990 + (Math.random() * 40),       // 990 to 1030 hPa
      battery: 3.0 + (Math.random() * 1.2),       // 3.0V to 4.2V
      coordinates: {
        latitude: 40.7128 + (Math.random() * 0.1 - 0.05),
        longitude: -74.006 + (Math.random() * 0.1 - 0.05),
        ...(Math.random() > 0.5 ? { altitude: 10 + (Math.random() * 100) } : {}),
      },
      tags,
      metadata: {
        firmware: `v${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
        signalStrength: Math.floor(Math.random() * 100),
        lastCalibration: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        notes: Math.random() > 0.7 ? "Maintenance scheduled" : undefined,
      }
    });
  }
  
  return data;
}

/**
 * Basic compression example
 */
async function demonstrateBasicCompression() {
  console.log('--- Basic Compression ---');
  
  // Generate sample data (1000 readings)
  const sensorData = generateSampleData(1000);
  
  console.log(`Original data size (approx): ${JSON.stringify(sensorData).length} bytes`);
  
  // Compress with gzip (default)
  console.log('\nCompressing with gzip (default)...');
  const gzipCompressed = await DataCompression.compressJSON(sensorData);
  console.log(DataCompression.getCompressionSummary(gzipCompressed));
  
  // Compress with deflate
  console.log('\nCompressing with deflate...');
  const deflateCompressed = await DataCompression.compressJSON(sensorData, { format: 'deflate' });
  console.log(DataCompression.getCompressionSummary(deflateCompressed));
  
  // Decompress the data
  console.log('\nDecompressing...');
  const decompressed = await DataCompression.decompressJSON<SensorReading[]>(gzipCompressed);
  
  console.log(`Decompressed data count: ${decompressed.length} items`);
  console.log(`First item: ${decompressed[0].id}, ${decompressed[0].timestamp}`);
  console.log('Decompression successful:', JSON.stringify(sensorData[0]) === JSON.stringify(decompressed[0]));
}

/**
 * Large dataset handling example
 */
async function demonstrateLargeDatasetCompression() {
  console.log('\n--- Large Dataset Compression ---');
  
  // Generate a larger dataset (10,000 readings)
  const largeDataset = generateSampleData(10000);
  console.log(`Generated dataset with ${largeDataset.length} items`);
  
  // Compress in chunks (1000 items per chunk)
  console.log('\nCompressing in chunks...');
  const startTime = Date.now();
  const compressedChunks = await DataCompression.compressLargeDataset(largeDataset, {
    maxItemsPerChunk: 1000,
    format: 'gzip'
  });
  const endTime = Date.now();
  
  console.log(`Compressed into ${compressedChunks.length} chunks in ${endTime - startTime}ms`);
  
  // Log details about each chunk
  let totalOriginalSize = 0;
  let totalCompressedSize = 0;
  
  compressedChunks.forEach((chunk, index) => {
    console.log(`Chunk ${index + 1}: ${DataCompression.getCompressionSummary(chunk)}`);
    totalOriginalSize += chunk.originalSize;
    totalCompressedSize += chunk.compressedSize;
  });
  
  const overallRatio = totalOriginalSize / totalCompressedSize;
  const savings = 100 * (1 - 1 / overallRatio);
  console.log(`\nOverall: ${formatFileSize(totalOriginalSize)} → ${formatFileSize(totalCompressedSize)}, ` +
              `ratio: ${overallRatio.toFixed(2)}x (${savings.toFixed(1)}% smaller)`);
  
  // Decompress the chunks
  console.log('\nDecompressing chunks...');
  const decompressStart = Date.now();
  const reassembled = await DataCompression.decompressLargeDataset<SensorReading>(compressedChunks);
  const decompressEnd = Date.now();
  
  console.log(`Decompressed ${reassembled.length} items in ${decompressEnd - decompressStart}ms`);
  console.log('Successful:', reassembled.length === largeDataset.length);
}

/**
 * ETL pipeline integration example
 */
async function demonstratePipelineIntegration() {
  console.log('\n--- ETL Pipeline Integration ---');
  
  // Generate sample data (1000 readings)
  const sensorData = generateSampleData(1000);
  
  // Create a data processing pipeline:
  // 1. Filter out readings with low battery
  // 2. Add calculated field (temperature in Fahrenheit)
  // 3. Compress the results for efficient transfer
  
  // Step 1: Filter transform
  const filterLowBattery = (data: SensorReading[]): SensorReading[] => {
    return data.filter(reading => reading.battery >= 3.3);
  };
  
  // Step 2: Add calculated field
  const addFahrenheit = (data: SensorReading[]): (SensorReading & { temperatureF: number })[] => {
    return data.map(reading => ({
      ...reading,
      temperatureF: (reading.temperature * 9/5) + 32
    }));
  };
  
  // Create the pipeline
  const pipeline = DataTransformer.createPipeline<
    SensorReading[], 
    Promise<CompressedData>
  >({
    name: 'Sensor Data ETL Pipeline with Compression',
    transformers: [
      filterLowBattery,
      addFahrenheit,
      DataCompression.createCompressionTransformer({ format: 'gzip' })
    ]
  });
  
  // Execute the pipeline
  console.log('Executing pipeline with compression...');
  const startTime = Date.now();
  const result = await pipeline(sensorData);
  const endTime = Date.now();
  
  console.log(`Pipeline executed in ${endTime - startTime}ms`);
  console.log(`Compression: ${DataCompression.getCompressionSummary(result)}`);
  
  // Decompress to verify
  const decompressed = await DataCompression.decompressJSON<(SensorReading & { temperatureF: number })[]>(result);
  console.log(`Processed ${decompressed.length} readings (filtered from ${sensorData.length})`);
  console.log('Sample processed reading:', decompressed[0]);
}

/**
 * Download URL example
 */
function demonstrateDownloadUrl() {
  console.log('\n--- Download URL Generation ---');
  
  // This function would typically run in a browser environment.
  // In this example, we'll just show the URL creation process.
  
  // Create a small compressed data object for demonstration
  const sampleData = {
    compressed: true,
    format: 'gzip' as const,
    data: new Uint8Array([31, 139, 8, 0, 0, 0, 0, 0, 0, 3, 75, 202, 207, 79, 74, 74, 44, 82, 72, 73, 44, 73, 4, 0, 43, 148, 131, 165, 12, 0, 0, 0]),
    originalSize: 20,
    compressedSize: 29,
    metadata: { example: true }
  };
  
  // Create download URL
  const { url, filename } = DataCompression.createDownloadUrl(
    sampleData, 
    'example-data.gzip'
  );
  
  console.log(`Download URL created: ${url} (in browser environment)`);
  console.log(`Filename: ${filename}`);
  console.log('\nIn a browser, you would use this URL for download:');
  console.log(`
// Example browser code:
const downloadLink = document.createElement('a');
downloadLink.href = url;
downloadLink.download = filename;
downloadLink.click();

// Later, when done:
DataCompression.releaseDownloadUrl(url);
  `);
}

/**
 * Format a file size in bytes to a human-readable string
 * (copy of the function in DataCompression.ts for this example file)
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

/**
 * Run all the examples
 */
async function runExamples() {
  await demonstrateBasicCompression();
  await demonstrateLargeDatasetCompression();
  await demonstratePipelineIntegration();
  demonstrateDownloadUrl();
}

// Run the examples if this file is executed directly
if (require.main === module) {
  runExamples().catch(console.error);
}

// Export for testing or reuse
export { runExamples }; 
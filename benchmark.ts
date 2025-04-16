import { runBenchmark } from './src/core/theme/run-benchmark';

// Parse command line arguments
const args = process.argv.slice(2);
const iterations = parseInt(args[0]) || 20; // Default to 20 iterations if not specified

console.log(`Running theme switching benchmark with ${iterations} iterations...`);

// Run the benchmark
runBenchmark()
  .then(() => {
    console.log('Benchmark completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error running benchmark:', error);
    process.exit(1);
  }); 
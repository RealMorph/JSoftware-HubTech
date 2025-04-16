require('ts-node').register({
  compilerOptions: {
    module: 'commonjs',
    esModuleInterop: true,
    target: 'es2020',
    moduleResolution: 'node',
    sourceMap: true,
    outDir: 'dist',
    baseUrl: '.',
    paths: {
      '@/*': ['src/*'],
    },
  },
});

const { ThemeBenchmark } = require('../src/core/theme/theme-benchmark');

async function main() {
  try {
    const benchmark = ThemeBenchmark.getInstance(20);
    const results = await benchmark.runBenchmark();
    console.log('Benchmark results:', results);
  } catch (error) {
    console.error('Error running benchmark:', error);
    process.exit(1);
  }
}

main();

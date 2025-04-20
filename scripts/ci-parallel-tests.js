/**
 * CI Parallel Tests
 * 
 * This script runs tests in parallel for CI environments to speed up builds.
 * It distributes tests across multiple processes and collects results.
 */

const { execSync } = require('child_process');
const chalk = require('chalk');

// Configuration
const DEFAULT_CONCURRENCY = 4; // Default number of parallel processes
const TEST_SUITES = [
  {
    name: 'unit',
    command: 'npm run test -- --ci',
    weight: 2, // Relative weight compared to other suites
  },
  {
    name: 'a11y',
    command: 'npm run test:a11y:ci',
    weight: 1,
  },
  {
    name: 'e2e',
    command: 'npm run test:e2e',
    weight: 3,
  },
  {
    name: 'visual',
    command: 'npm run test:visual-regression',
    weight: 2,
  },
  {
    name: 'chromatic',
    command: 'npm run test:chromatic:ci',
    weight: 2, 
  },
  {
    name: 'performance',
    command: 'npm run test:performance:components',
    weight: 1,
  }
];

// Parse command line arguments
const args = process.argv.slice(2);
const concurrencyArg = args.find(arg => arg.startsWith('--concurrency='));
const concurrency = concurrencyArg 
  ? parseInt(concurrencyArg.split('=')[1], 10) 
  : DEFAULT_CONCURRENCY;

const specificSuite = args.find(arg => arg.startsWith('--suite='));
const suiteName = specificSuite ? specificSuite.split('=')[1] : null;

const dryRun = args.includes('--dry-run');

// Distribute test suites into batches based on weight
function distributeSuites(suites, numBatches) {
  // If a specific suite is requested, only return that one
  if (suiteName) {
    const suite = suites.find(s => s.name === suiteName);
    if (!suite) {
      console.error(chalk.red(`Suite "${suiteName}" not found`));
      process.exit(1);
    }
    return [[suite]];
  }

  // Sort suites by weight (descending)
  const sortedSuites = [...suites].sort((a, b) => b.weight - a.weight);
  
  // Initialize batches
  const batches = Array.from({ length: numBatches }, () => ({
    suites: [],
    totalWeight: 0,
  }));
  
  // Distribute suites using a greedy algorithm (place each suite in the least loaded batch)
  sortedSuites.forEach(suite => {
    // Find batch with lowest total weight
    const leastLoadedBatch = batches.reduce(
      (min, batch, i) => batch.totalWeight < batches[min].totalWeight ? i : min,
      0
    );
    
    // Add suite to that batch
    batches[leastLoadedBatch].suites.push(suite);
    batches[leastLoadedBatch].totalWeight += suite.weight;
  });
  
  // Return just the suites from each batch
  return batches.map(batch => batch.suites);
}

// Run a batch of test suites in sequence
function runBatch(batch, batchIndex) {
  console.log(chalk.blue(`\nBatch ${batchIndex + 1} starting with ${batch.length} suites: ${batch.map(s => s.name).join(', ')}`));
  
  for (const suite of batch) {
    console.log(chalk.cyan(`\nRunning ${suite.name} tests...`));
    console.log(chalk.gray(`Command: ${suite.command}`));
    
    const startTime = Date.now();
    
    try {
      if (!dryRun) {
        execSync(suite.command, { stdio: 'inherit' });
      } else {
        console.log(chalk.yellow(`[DRY RUN] Would execute: ${suite.command}`));
      }
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(chalk.green(`✅ ${suite.name} tests passed in ${duration}s`));
    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.error(chalk.red(`❌ ${suite.name} tests failed after ${duration}s`));
      
      if (!dryRun) {
        throw error; // Re-throw to make the whole process fail
      }
    }
  }
  
  return true;
}

// Main function
async function runParallelTests() {
  console.log(chalk.blue(`Running tests in parallel with concurrency ${concurrency}`));
  
  if (suiteName) {
    console.log(chalk.yellow(`Running only suite: ${suiteName}`));
  }
  
  if (dryRun) {
    console.log(chalk.yellow('Dry run mode - commands will not be executed'));
  }
  
  // Distribute suites into batches
  const batches = distributeSuites(TEST_SUITES, concurrency);
  
  console.log(chalk.blue('\nTest distribution:'));
  batches.forEach((batch, i) => {
    if (batch.length > 0) {
      console.log(chalk.white(`Batch ${i + 1}: ${batch.map(s => s.name).join(', ')}`));
    }
  });
  
  // Filter out empty batches
  const nonEmptyBatches = batches.filter(batch => batch.length > 0);
  
  // Run batches in parallel
  const startTime = Date.now();
  
  try {
    // Run batches in parallel
    if (dryRun) {
      // In dry run mode, just process them sequentially
      for (let i = 0; i < nonEmptyBatches.length; i++) {
        await runBatch(nonEmptyBatches[i], i);
      }
    } else {
      if (process.platform === 'win32') {
        // Windows doesn't handle Promise.all with child processes well
        // Run sequentially to avoid issues
        for (let i = 0; i < nonEmptyBatches.length; i++) {
          await runBatch(nonEmptyBatches[i], i);
        }
      } else {
        // On Unix platforms, run in parallel
        await Promise.all(nonEmptyBatches.map(runBatch));
      }
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(chalk.green(`\n✅ All tests completed successfully in ${duration}s`));
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error(chalk.red(`\n❌ Tests failed after ${duration}s`));
    
    if (!dryRun) {
      process.exit(1);
    }
  }
}

// Run the tests
runParallelTests(); 
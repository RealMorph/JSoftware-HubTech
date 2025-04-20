/**
 * Example demonstrating the DataProcessor for advanced ETL operations
 * 
 * This example shows how to:
 * 1. Create a custom data processor for API data
 * 2. Use the processor for data transformation and validation
 * 3. Handle errors and retries in data processing
 * 4. Integrate with compression for large data transfers
 */

import { DataProcessor, DataProcessors } from '../DataProcessor';
import { DataTransformer } from '../DataTransformer';
import { DataCompression } from '../DataCompression';

// Example data types
interface ApiResponse {
  status: string;
  data: {
    users: User[];
  };
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface ProcessedUser {
  id: number;
  fullName: string;
  email: string;
  role: string;
  isAdmin: boolean;
  createdDate: Date;
}

/**
 * Simple API fetch function that might fail sometimes
 */
async function fetchUsers(): Promise<ApiResponse> {
  // Simulate API call with occasional failures
  const shouldFail = Math.random() < 0.3; // 30% chance of failure
  
  if (shouldFail) {
    throw new Error('API request failed');
  }
  
  // Mock API response
  return {
    status: 'success',
    data: {
      users: [
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          role: 'admin',
          created_at: '2023-01-15T09:30:00Z'
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'user',
          created_at: '2023-02-20T14:15:30Z'
        },
        {
          id: 3,
          name: 'Bob Johnson',
          email: 'bob@example.com',
          role: 'user',
          created_at: '2023-03-10T11:45:22Z'
        },
        {
          id: 4,
          name: 'Alice Williams',
          email: 'alice@example.com',
          role: 'manager',
          created_at: '2023-01-05T16:20:45Z'
        },
        {
          id: 5,
          name: 'Charlie Brown',
          email: 'charlie@example.com',
          role: 'admin',
          created_at: '2023-04-18T08:10:15Z'
        }
      ]
    }
  };
}

/**
 * Basic usage example
 */
async function basicProcessorExample() {
  console.log('--- Basic DataProcessor Example ---');
  
  // Create transformers for our data pipeline
  const extractUsers = (response: ApiResponse): User[] => response.data.users;
  
  const transformUsers = (users: User[]): ProcessedUser[] => {
    return users.map(user => ({
      id: user.id,
      fullName: user.name,
      email: user.email,
      role: user.role,
      isAdmin: user.role === 'admin',
      createdDate: new Date(user.created_at)
    }));
  };
  
  const sortByCreatedDate = (users: ProcessedUser[]): ProcessedUser[] => {
    return [...users].sort((a, b) => a.createdDate.getTime() - b.createdDate.getTime());
  };
  
  // Create a processor using the factory helper
  const userProcessor = DataProcessors.createAPIProcessor<ApiResponse, ProcessedUser[]>({
    name: 'User Data Processor',
    description: 'Processes user data from the API',
    transformers: [
      extractUsers,
      transformUsers,
      sortByCreatedDate
    ],
    maxRetries: 3,
    retryDelay: 1000,
    useExponentialBackoff: true,
    onSuccess: (result) => {
      console.log(`Successfully processed ${result.length} users`);
    },
    onFailure: (error) => {
      console.error('Processing failed:', error.message);
    }
  });
  
  // Process the data with automatic retries
  try {
    console.log('Fetching and processing user data...');
    const result = await userProcessor.process(() => fetchUsers());
    
    console.log(`Processing completed in ${result.stats.duration}ms`);
    console.log(`Retry attempts: ${result.stats.retryCount}`);
    
    if (result.success) {
      console.log('\nProcessed users:');
      result.data.forEach(user => {
        console.log(`- ${user.fullName} (${user.email}), ${user.role}, created: ${user.createdDate.toLocaleDateString()}`);
      });
    } else {
      console.error('Processing failed after retries');
    }
  } catch (error) {
    console.error('Unhandled error:', (error as Error).message);
  }
}

/**
 * Advanced usage with compression and validation
 */
async function advancedProcessorExample() {
  console.log('\n--- Advanced DataProcessor Example with Compression ---');
  
  // Generate a large dataset
  const generateLargeUserDataset = (count: number): User[] => {
    const roles = ['user', 'admin', 'manager', 'support', 'guest'];
    const users: User[] = [];
    
    for (let i = 1; i <= count; i++) {
      users.push({
        id: i,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        role: roles[Math.floor(Math.random() * roles.length)],
        created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    
    return users;
  };
  
  // Create a large dataset (10,000 users)
  const largeDataset = {
    status: 'success',
    data: {
      users: generateLargeUserDataset(10000)
    }
  };
  
  // Validator function to check processed data
  const validateProcessedUsers = (users: ProcessedUser[]): boolean => {
    if (!Array.isArray(users) || users.length === 0) {
      return false;
    }
    
    // Check that all required fields are present
    return users.every(user => 
      typeof user.id === 'number' &&
      typeof user.fullName === 'string' &&
      typeof user.email === 'string' &&
      typeof user.role === 'string' &&
      typeof user.isAdmin === 'boolean' &&
      user.createdDate instanceof Date
    );
  };
  
  // Create a custom processor with compression
  const largeDataProcessor = new DataProcessor<ApiResponse, ProcessedUser[]>({
    id: 'large-data-processor',
    name: 'Large User Dataset Processor',
    description: 'Processes and compresses large user datasets',
    transformers: [
      (response: ApiResponse) => response.data.users,
      
      // Transform users
      (users: User[]): ProcessedUser[] => users.map(user => ({
        id: user.id,
        fullName: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.role === 'admin',
        createdDate: new Date(user.created_at)
      })),
      
      // Filter only admin and manager users
      (users: ProcessedUser[]): ProcessedUser[] => 
        users.filter(user => user.role === 'admin' || user.role === 'manager'),
      
      // Sort by ID for consistent ordering
      (users: ProcessedUser[]): ProcessedUser[] => 
        [...users].sort((a, b) => a.id - b.id)
    ],
    validator: validateProcessedUsers,
    compressData: true,
    compressionOptions: {
      format: 'gzip',
      level: 6
    },
    cacheResults: true,
    cacheTTL: 5 * 60 * 1000 // 5 minutes
  });
  
  try {
    console.log('Processing large dataset...');
    const startTime = Date.now();
    
    // This would automatically handle compression if implemented
    const result = await largeDataProcessor.process(largeDataset);
    
    console.log(`Processing completed in ${result.stats.duration}ms`);
    
    if (result.success) {
      console.log(`Processed ${result.data.length} users (filtered from ${largeDataset.data.users.length})`);
      console.log(`First 5 processed users:`);
      result.data.slice(0, 5).forEach(user => {
        console.log(`- ${user.fullName} (${user.email}), ${user.role}`);
      });
      
      // In a real implementation, compressed data would show size differences
      if (result.stats.compressed) {
        console.log(
          `\nCompression: ${result.stats.originalSize} bytes → ${result.stats.compressedSize} bytes, ` +
          `ratio: ${(result.stats.originalSize! / result.stats.compressedSize!).toFixed(2)}x`
        );
      }
    } else {
      console.error('Processing failed:', result.error?.message);
    }
  } catch (error) {
    console.error('Unhandled error:', (error as Error).message);
  }
}

/**
 * Example of a service that fails multiple times before succeeding
 */
async function unreliableService(attemptLimit = 3): Promise<string> {
  // This static variable persists between function calls
  // to count how many times the function has been called
  if (typeof (unreliableService as any).attempts === 'undefined') {
    (unreliableService as any).attempts = 0;
  }
  
  const currentAttempt = ++(unreliableService as any).attempts;
  
  // Log the current attempt
  console.log(`unreliableService called (attempt ${currentAttempt})`);
  
  // Simulate an unreliable service that fails the first n-1 attempts
  if (currentAttempt < attemptLimit) {
    const error = new Error(`Service failed on attempt ${currentAttempt}`);
    console.error(error.message);
    throw error;
  }
  
  // Successfully return on the nth attempt
  console.log(`Service succeeded on attempt ${currentAttempt}`);
  return `Success after ${currentAttempt} attempts!`;
}

/**
 * Example demonstrating the retry mechanism
 */
async function retryMechanismExample() {
  console.log('\n--- Retry Mechanism Example ---');
  
  // Reset the attempt counter for the example
  (unreliableService as any).attempts = 0;
  
  // Create a processor for our unreliable service with retries
  const retryProcessor = DataProcessors.createAPIProcessor<string, string>({
    name: 'Unreliable Service Processor',
    description: 'Demonstrates retry mechanism with exponential backoff',
    transformers: [
      // Simple identity transformer
      (result: string) => result
    ],
    maxRetries: 5,
    retryDelay: 500, // Start with 500ms delay
    useExponentialBackoff: true, // Use exponential backoff
    onSuccess: (result) => {
      console.log(`Final success: ${result}`);
    },
    onFailure: (error) => {
      console.error(`Final failure: ${error.message}`);
    }
  });
  
  try {
    // Process with a service that will succeed on the 3rd attempt
    console.log('Calling unreliable service that will succeed on the 3rd attempt...');
    const result = await retryProcessor.process(() => unreliableService(3));
    
    console.log(`\nProcessing completed in ${result.stats.duration}ms`);
    console.log(`Retry attempts: ${result.stats.retryCount}`);
    console.log(`Final result: ${result.data}`);
    
    if (result.success) {
      console.log('Service call ultimately succeeded!');
    } else {
      console.error('Service call ultimately failed.');
    }
  } catch (error) {
    console.error('Unhandled error:', (error as Error).message);
  }
  
  // Reset for another example
  (unreliableService as any).attempts = 0;
  
  try {
    // Process with a service that will need more retries than allowed
    console.log('\nCalling unreliable service that would need 10 attempts (more than max retries)...');
    const result = await retryProcessor.process(() => unreliableService(10));
    
    // This shouldn't be reached on success
    console.log(`Processing completed in ${result.stats.duration}ms`);
    console.log(`Retry attempts: ${result.stats.retryCount}`);
    
    if (result.success) {
      console.log('Unexpectedly succeeded.');
    } else {
      console.error(`Failed as expected after ${result.stats.retryCount} retry attempts`);
      console.error(`Error: ${result.error?.message}`);
    }
  } catch (error) {
    console.error('Unhandled error:', (error as Error).message);
  }
}

/**
 * Run the examples
 */
async function runExamples() {
  await basicProcessorExample();
  await advancedProcessorExample();
  await retryMechanismExample(); // Add the new example
  
  console.log('\n--- Example Complete ---');
  console.log('Note: The DataProcessor class now includes retry mechanism implementation with exponential backoff.');
  console.log('The caching and compression features still need to be implemented.');
}

// Run the examples if this file is executed directly
if (require.main === module) {
  runExamples().catch(console.error);
}

// Export for testing or reuse
export { runExamples }; 
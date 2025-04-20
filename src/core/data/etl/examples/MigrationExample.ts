/**
 * Example demonstrating schema migration
 * 
 * This example shows how to:
 * 1. Register different schema versions
 * 2. Define migration paths between versions
 * 3. Migrate data between schema versions
 */

import { DataMigration, DataTransformer } from '../';

// Define some example schemas and data models

// Version 1.0 schema - Basic user model
interface UserV1 {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

// Version 1.1 schema - Added name fields
interface UserV1_1 {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

// Version 2.0 schema - Added profile and restructured user data
interface UserV2 {
  id: string;
  username: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    displayName: string;
  };
  metadata: {
    createdAt: string;
    lastLogin?: string;
  };
}

/**
 * Register schema versions
 */
function registerSchemaVersions() {
  // Register all schema versions
  DataMigration.registerSchemaVersion('1.0', 'Initial user schema');
  DataMigration.registerSchemaVersion('1.1', 'Added first and last name fields');
  DataMigration.registerSchemaVersion('2.0', 'Added profile and metadata structure');
}

/**
 * Register migrations between schema versions
 */
function registerMigrations() {
  // Migration from v1.0 to v1.1 - Split name into firstName and lastName
  DataMigration.registerMigration(
    '1.0',
    '1.1',
    (user: UserV1): UserV1_1 => {
      // For demo purposes, we'll split username to first/last name
      // In a real application, you might prompt the user for this information
      const nameParts = user.username.split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      return {
        ...user,
        firstName,
        lastName,
      };
    },
    'Add firstName and lastName fields from username'
  );
  
  // Migration from v1.1 to v2.0 - Restructure to add profile and metadata
  DataMigration.registerMigration(
    '1.1',
    '2.0',
    (user: UserV1_1): UserV2 => {
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        profile: {
          firstName: user.firstName,
          lastName: user.lastName,
          displayName: `${user.firstName} ${user.lastName}`.trim() || user.username,
        },
        metadata: {
          createdAt: user.createdAt,
        },
      };
    },
    'Restructure user data to include profile and metadata'
  );
  
  // Direct migration from v1.0 to v2.0 for optimization
  DataMigration.registerMigration(
    '1.0',
    '2.0',
    (user: UserV1): UserV2 => {
      // For demo purposes, we'll split username to first/last name
      const nameParts = user.username.split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        profile: {
          firstName,
          lastName,
          displayName: `${firstName} ${lastName}`.trim() || user.username,
        },
        metadata: {
          createdAt: user.createdAt,
        },
      };
    },
    'Direct migration from v1.0 to v2.0'
  );
}

/**
 * Example usage
 */
function runExample() {
  console.log('Running schema migration example...');
  
  // Register schemas and migrations
  registerSchemaVersions();
  registerMigrations();
  
  // Sample data in v1.0 format
  const userV1: UserV1 = {
    id: 'user123',
    username: 'johndoe',
    email: 'john.doe@example.com',
    createdAt: '2023-01-15T12:00:00Z',
  };
  
  console.log('Original user data (v1.0):', userV1);
  
  // Migrate from v1.0 to v1.1
  const userV1_1 = DataMigration.migrateData<UserV1, UserV1_1>(
    userV1, 
    '1.0', 
    '1.1'
  );
  console.log('Migrated to v1.1:', userV1_1);
  
  // Migrate from v1.1 to v2.0
  const userV2 = DataMigration.migrateData<UserV1_1, UserV2>(
    userV1_1, 
    '1.1', 
    '2.0'
  );
  console.log('Migrated to v2.0:', userV2);
  
  // Alternatively, migrate directly from v1.0 to v2.0
  const userV2Direct = DataMigration.migrateData<UserV1, UserV2>(
    userV1, 
    '1.0', 
    '2.0'
  );
  console.log('Directly migrated to v2.0:', userV2Direct);
  
  // Show all migration paths from v1.0 to v2.0
  const paths = DataMigration.findMigrationPaths('1.0', '2.0');
  console.log('All possible migration paths:');
  paths.forEach((path, i) => {
    console.log(`Path ${i + 1}: ${path.map(m => `${m.sourceVersion} → ${m.targetVersion}`).join(' → ')}`);
  });
  
  // Show the migration graph
  console.log('Migration graph:', DataMigration.getMigrationGraph());
  
  // Using with DataTransformer pipeline
  const pipeline = DataTransformer.createPipeline({
    name: 'User Migration Pipeline',
    transformers: [
      // Convert data from v1.0 to v2.0
      DataMigration.createMigrationTransformer<UserV1, UserV2>('1.0', '2.0'),
      
      // Add additional transformations as needed
      DataTransformer.map<UserV2, UserV2>(user => ({
        ...user,
        metadata: {
          ...user.metadata,
          lastLogin: new Date().toISOString(),
        },
      })),
    ],
  });
  
  // Execute the pipeline
  pipeline(userV1).then(result => {
    console.log('Pipeline result:', result);
  });
}

// Run the example if this file is executed directly
if (require.main === module) {
  runExample();
}

// Export for testing or reuse
export { registerSchemaVersions, registerMigrations, runExample }; 
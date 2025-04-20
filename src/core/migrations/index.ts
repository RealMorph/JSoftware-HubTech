import { Migration, DatabaseMigrationService } from '../services/database-migration-service';

// Import all migrations
import { addUserRolesMigration } from './add-user-roles';

// Import all app migrations
import { initialAppMigration } from './001-initial-app-migration';

/**
 * List of all migrations in order of application
 */
export const migrations: Migration[] = [
  addUserRolesMigration,
];

/**
 * Run all pending migrations
 */
export const runMigrations = async (): Promise<void> => {
  const migrationService = DatabaseMigrationService.getInstance();
  
  console.log('Running migrations...');
  
  for (const migration of migrations) {
    await migrationService.applyMigration(migration);
  }
  
  console.log('All migrations completed.');
};

/**
 * Rollback a specific migration by ID
 */
export const rollbackMigration = async (migrationId: string): Promise<void> => {
  const migrationService = DatabaseMigrationService.getInstance();
  const migration = migrations.find(m => m.id === migrationId);
  
  if (!migration) {
    throw new Error(`Migration with ID ${migrationId} not found.`);
  }
  
  await migrationService.rollbackMigration(migration);
};

// Export all app migrations
export {
  addUserRolesMigration
}; 
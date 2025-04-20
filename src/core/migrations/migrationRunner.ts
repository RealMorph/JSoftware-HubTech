import { DatabaseMigrationService as FirebaseMigrationService } from '../firebase/database-migration';
import { DatabaseMigrationService } from '../services/database-migration-service';
import { migrations as appMigrations } from './index';
import { app } from '../firebase';

// Firebase migrations
import { addContactCustomFieldsMigration } from '../firebase/migrations/001-add-contact-custom-fields';

// Firebase migrations list
const firebaseMigrations = [
  addContactCustomFieldsMigration,
  // Add new Firebase migrations here
];

/**
 * Run all pending migrations for both systems
 * @param targetVersion Optional target version for Firebase migrations
 */
export async function runAllMigrations(targetVersion?: string): Promise<void> {
  console.log('Starting database migrations...');
  
  try {
    // Initialize Firebase if needed
    if (!app) {
      throw new Error('Firebase not initialized');
    }
    
    // Run Firebase migrations first
    console.log('Running Firebase migrations...');
    const firebaseMigrationService = FirebaseMigrationService.getInstance();
    const firebaseCurrentVersion = await firebaseMigrationService.getCurrentVersion();
    console.log(`Current Firebase DB version: ${firebaseCurrentVersion}`);
    
    await firebaseMigrationService.applyMigrations(firebaseMigrations, targetVersion);
    
    const firebaseNewVersion = await firebaseMigrationService.getCurrentVersion();
    console.log(`Firebase migrations completed. New version: ${firebaseNewVersion}`);
    
    // Then run application migrations
    console.log('Running application migrations...');
    const migrationService = DatabaseMigrationService.getInstance();
    
    for (const migration of appMigrations) {
      const isMigrationApplied = await migrationService.isMigrationApplied(migration.id);
      if (!isMigrationApplied) {
        console.log(`Applying migration ${migration.id}: ${migration.name}`);
        await migrationService.applyMigration(migration);
      } else {
        console.log(`Migration ${migration.id} already applied, skipping`);
      }
    }
    
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
}

/**
 * Rollback a specific Firebase migration
 * @param migrationId ID of the migration to rollback
 */
export async function rollbackFirebaseMigration(migrationId: string): Promise<void> {
  console.log(`Rolling back Firebase migration: ${migrationId}`);
  
  try {
    const migrationService = FirebaseMigrationService.getInstance();
    await migrationService.rollbackMigration(migrationId, firebaseMigrations);
    console.log(`Successfully rolled back Firebase migration: ${migrationId}`);
  } catch (error) {
    console.error(`Error rolling back Firebase migration ${migrationId}:`, error);
    throw error;
  }
}

/**
 * Rollback a specific application migration
 * @param migrationId ID of the migration to rollback
 */
export async function rollbackAppMigration(migrationId: string): Promise<void> {
  console.log(`Rolling back application migration: ${migrationId}`);
  
  try {
    const migrationService = DatabaseMigrationService.getInstance();
    const migration = appMigrations.find(m => m.id === migrationId);
    
    if (!migration) {
      throw new Error(`Migration with ID ${migrationId} not found`);
    }
    
    await migrationService.rollbackMigration(migration);
    console.log(`Successfully rolled back application migration: ${migrationId}`);
  } catch (error) {
    console.error(`Error rolling back application migration ${migrationId}:`, error);
    throw error;
  }
}

/**
 * Get migration status for both systems
 */
export async function getMigrationStatus(): Promise<{
  firebaseMigrations: { version: string; applied: string[] };
  appMigrations: { applied: string[]; pending: string[] };
}> {
  // Get Firebase migration status
  const firebaseMigrationService = FirebaseMigrationService.getInstance();
  const firebaseVersion = await firebaseMigrationService.getCurrentVersion();
  const firebaseApplied = await firebaseMigrationService.getAppliedMigrations();
  
  // Get application migration status
  const migrationService = DatabaseMigrationService.getInstance();
  const appliedAppMigrations: string[] = [];
  const pendingAppMigrations: string[] = [];
  
  for (const migration of appMigrations) {
    const isApplied = await migrationService.isMigrationApplied(migration.id);
    if (isApplied) {
      appliedAppMigrations.push(migration.id);
    } else {
      pendingAppMigrations.push(migration.id);
    }
  }
  
  return {
    firebaseMigrations: {
      version: firebaseVersion,
      applied: firebaseApplied
    },
    appMigrations: {
      applied: appliedAppMigrations,
      pending: pendingAppMigrations
    }
  };
} 
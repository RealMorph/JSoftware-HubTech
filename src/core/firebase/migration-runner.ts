import { FirebaseDatabaseMigrationService } from './database-migration-service';
import { FirestoreService } from './firebase-db-service';

// Import all migrations - these are automatically loaded from the migrations directory
// in the FirebaseDatabaseMigrationService

/**
 * Run all pending migrations
 */
export async function runMigrations(): Promise<string[]> {
  const firestoreService = FirestoreService.getInstance();
  const migrationService = new FirebaseDatabaseMigrationService(firestoreService);
  
  try {
    console.log('Running database migrations...');
    
    // Initialize migrations
    await migrationService.initMigrations();
    
    // Get current status
    const status = await migrationService.getMigrationStatus();
    console.log(`Applied migrations: ${status.appliedMigrations.join(', ') || 'None'}`);
    console.log(`Pending migrations: ${status.pendingMigrations.join(', ') || 'None'}`);
    
    // Apply pending migrations
    const appliedMigrations = await migrationService.runMigrations();
    
    if (appliedMigrations.length > 0) {
      console.log(`Successfully applied migrations: ${appliedMigrations.join(', ')}`);
    } else {
      console.log('No migrations to apply');
    }
    
    return appliedMigrations;
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  } finally {
    // Close the migration service
    await migrationService.close();
  }
}

/**
 * Rollback the last migration
 */
export async function rollbackLastMigration(): Promise<string | null> {
  const firestoreService = FirestoreService.getInstance();
  const migrationService = new FirebaseDatabaseMigrationService(firestoreService);
  
  try {
    console.log('Rolling back the last migration...');
    
    // Get current status
    const status = await migrationService.getMigrationStatus();
    console.log(`Applied migrations: ${status.appliedMigrations.join(', ') || 'None'}`);
    
    if (status.appliedMigrations.length === 0) {
      console.log('No migrations to roll back');
      return null;
    }
    
    // Rollback the last migration
    const rolledBackMigration = await migrationService.rollbackLastMigration();
    
    if (rolledBackMigration) {
      console.log(`Successfully rolled back migration: ${rolledBackMigration}`);
    } else {
      console.log('No migration was rolled back');
    }
    
    return rolledBackMigration;
  } catch (error) {
    console.error('Error rolling back migration:', error);
    throw error;
  } finally {
    // Close the migration service
    await migrationService.close();
  }
}

/**
 * Rollback a specific migration
 * @param migrationId ID of the migration to rollback
 */
export async function rollbackMigration(migrationId: string): Promise<boolean> {
  const firestoreService = FirestoreService.getInstance();
  const migrationService = new FirebaseDatabaseMigrationService(firestoreService);
  
  try {
    console.log(`Rolling back migration: ${migrationId}`);
    
    // Rollback the specific migration
    const success = await migrationService.rollbackMigration(migrationId);
    
    if (success) {
      console.log(`Successfully rolled back migration: ${migrationId}`);
    } else {
      console.log(`Migration ${migrationId} was not rolled back`);
    }
    
    return success;
  } catch (error) {
    console.error(`Error rolling back migration ${migrationId}:`, error);
    throw error;
  } finally {
    // Close the migration service
    await migrationService.close();
  }
} 
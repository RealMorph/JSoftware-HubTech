#!/usr/bin/env node

/**
 * Database Migration Runner
 * 
 * This script provides a command-line utility for running database migrations.
 * 
 * Usage:
 *   npm run migrations:run              Run all pending migrations
 *   npm run migrations:status           Check the status of migrations
 *   npm run migrations:rollback <migration_id>  Roll back a specific migration
 *   npm run migrations:rollback-last    Roll back the last applied migration
 */

// Load environment variables
import { config } from 'dotenv';
config();

// Import migration functions
import { 
  runMigrations, 
  rollbackMigration,
  rollbackLastMigration
} from '../core/firebase/migration-runner';
import { FirestoreService } from '../core/firebase/firebase-db-service';
import { FirebaseDatabaseMigrationService } from '../core/firebase/database-migration-service';

async function run() {
  const args = process.argv.slice(2);
  const command = args[0] || 'status';
  const migrationId = args[1]; // Used for rollback commands

  try {
    console.log(`Running migration command: ${command}`);
    
    switch (command) {
      case 'status': {
        // Initialize the migration service to check status
        const firestoreService = FirestoreService.getInstance();
        const migrationService = new FirebaseDatabaseMigrationService(firestoreService);
        
        try {
          await migrationService.initMigrations();
          const status = await migrationService.getMigrationStatus();
          
          console.log('\nMigration Status:');
          console.log('-----------------');
          console.log(`Applied migrations: ${status.appliedMigrations.length}`);
          if (status.appliedMigrations.length > 0) {
            console.log(`  ${status.appliedMigrations.join('\n  ')}`);
          }
          
          console.log(`\nPending migrations: ${status.pendingMigrations.length}`);
          if (status.pendingMigrations.length > 0) {
            console.log(`  ${status.pendingMigrations.join('\n  ')}`);
          }
        } finally {
          await migrationService.close();
        }
        break;
      }
      
      case 'run': {
        // Run all pending migrations
        const appliedMigrations = await runMigrations();
        
        if (appliedMigrations.length === 0) {
          console.log('No migrations were applied. Database is up to date.');
        } else {
          console.log(`Successfully applied ${appliedMigrations.length} migrations.`);
        }
        break;
      }
      
      case 'rollback': {
        // Check if migration ID was provided
        if (!migrationId) {
          console.error('Error: Migration ID is required for rollback');
          console.log('Usage: npm run migrations:rollback <migration_id>');
          process.exit(1);
        }
        
        // Roll back the specified migration
        const success = await rollbackMigration(migrationId);
        
        if (success) {
          console.log(`Successfully rolled back migration: ${migrationId}`);
        } else {
          console.log(`Migration ${migrationId} was not rolled back. It may not have been applied.`);
        }
        break;
      }
      
      case 'rollback-last': {
        // Roll back the last migration
        const rolledBackMigration = await rollbackLastMigration();
        
        if (rolledBackMigration) {
          console.log(`Successfully rolled back the last migration: ${rolledBackMigration}`);
        } else {
          console.log('No migration was rolled back. There may be no applied migrations.');
        }
        break;
      }
      
      default:
        console.error(`Unknown command: ${command}`);
        console.log('Available commands: status, run, rollback, rollback-last');
        process.exit(1);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

run(); 
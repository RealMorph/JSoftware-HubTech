import { FirestoreService } from './firebase-db-service';
import { Migration } from '../types/migration';
import * as migrations from './migrations';

export interface MigrationStatus {
  appliedMigrations: string[];
  pendingMigrations: string[];
}

interface MigrationDocument {
  id: string;
  appliedAt: any; // Use any for Timestamp since we're avoiding direct firebase-admin dependency
}

export class FirebaseDatabaseMigrationService {
  private db: any; // Firestore instance from the migration interface
  private migrationsCollection: any; // Collection reference
  private migrationsArray: Migration[];

  constructor(private firestoreService: FirestoreService) {
    // Use any type since FirestoreService doesn't expose a direct firestore property
    this.db = (firestoreService as any).firestore || firestoreService;
    this.migrationsCollection = this.db.collection('migrations');
    this.migrationsArray = Object.values(migrations) as Migration[];
  }

  /**
   * Initialize the migrations collection if it doesn't exist
   */
  public async initMigrations(): Promise<void> {
    const migrationSystemDoc = this.db.collection('system').doc('migrations');
    const doc = await migrationSystemDoc.get();

    if (!doc.exists) {
      // Use serverTimestamp from the db object
      await migrationSystemDoc.set({
        initialized: true,
        lastChecked: this.db.serverTimestamp ? this.db.serverTimestamp() : new Date()
      });
    }
  }

  /**
   * Get the current status of migrations
   */
  public async getMigrationStatus(): Promise<MigrationStatus> {
    // Get all applied migrations from the database
    const snapshot = await this.migrationsCollection.get();
    const appliedMigrations = snapshot.docs.map((doc: any) => doc.id);

    // Get all migrations that haven't been applied yet
    const pendingMigrations = this.migrationsArray
      .filter(migration => !appliedMigrations.includes(migration.id))
      .map(migration => migration.id);

    return {
      appliedMigrations,
      pendingMigrations
    };
  }

  /**
   * Run all pending migrations
   */
  public async runMigrations(): Promise<string[]> {
    const { pendingMigrations } = await this.getMigrationStatus();
    const appliedMigrations: string[] = [];

    // Sort migrations by ID to ensure they run in the correct order
    const migrationsToRun = this.migrationsArray
      .filter(migration => pendingMigrations.includes(migration.id))
      .sort((a, b) => a.id.localeCompare(b.id));

    for (const migration of migrationsToRun) {
      try {
        console.log(`Running migration: ${migration.id} - ${migration.name}`);
        
        // Run the migration
        await migration.up(this.db);
        
        // Record that the migration was applied
        await this.migrationsCollection.doc(migration.id).set({
          id: migration.id,
          name: migration.name,
          appliedAt: this.db.serverTimestamp ? this.db.serverTimestamp() : new Date()
        });
        
        appliedMigrations.push(migration.id);
        console.log(`Migration ${migration.id} completed successfully`);
      } catch (error) {
        console.error(`Migration ${migration.id} failed:`, error);
        throw new Error(`Failed to run migration ${migration.id}: ${error}`);
      }
    }

    return appliedMigrations;
  }

  /**
   * Roll back the last applied migration
   */
  public async rollbackLastMigration(): Promise<string | null> {
    // Get all applied migrations ordered by appliedAt DESC
    const snapshot = await this.migrationsCollection
      .orderBy('appliedAt', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      console.log('No migrations to roll back');
      return null;
    }

    const lastMigrationDoc = snapshot.docs[0];
    const lastMigrationId = lastMigrationDoc.id;

    // Find the migration object
    const migration = this.migrationsArray.find(m => m.id === lastMigrationId);

    if (!migration) {
      throw new Error(`Could not find migration with ID: ${lastMigrationId}`);
    }

    try {
      console.log(`Rolling back migration: ${migration.id} - ${migration.name}`);
      
      // Run the down migration
      await migration.down(this.db);
      
      // Remove the migration record
      await this.migrationsCollection.doc(migration.id).delete();
      
      console.log(`Migration ${migration.id} rolled back successfully`);
      return migration.id;
    } catch (error) {
      console.error(`Failed to roll back migration ${migration.id}:`, error);
      throw new Error(`Failed to roll back migration ${migration.id}: ${error}`);
    }
  }

  /**
   * Rollback a specific migration by ID
   */
  public async rollbackMigration(migrationId: string): Promise<boolean> {
    // Check if the migration has been applied
    const migrationDoc = await this.migrationsCollection.doc(migrationId).get();
    
    if (!migrationDoc.exists) {
      console.log(`Migration ${migrationId} has not been applied, nothing to roll back`);
      return false;
    }
    
    // Find the migration object
    const migration = this.migrationsArray.find(m => m.id === migrationId);
    
    if (!migration) {
      throw new Error(`Could not find migration with ID: ${migrationId}`);
    }
    
    try {
      console.log(`Rolling back migration: ${migration.id} - ${migration.name}`);
      
      // Run the down migration
      await migration.down(this.db);
      
      // Remove the migration record
      await this.migrationsCollection.doc(migration.id).delete();
      
      console.log(`Migration ${migration.id} rolled back successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to roll back migration ${migration.id}:`, error);
      throw new Error(`Failed to roll back migration ${migration.id}: ${error}`);
    }
  }

  /**
   * Close the database connection
   */
  public async close(): Promise<void> {
    try {
      // Use optional chaining with type assertion to avoid TypeScript errors
      const service = this.firestoreService as any;
      if (service?.close) {
        await service.close();
      }
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  }
} 
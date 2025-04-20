import { Migration } from '../types/migration';
import { IndexedDBService } from './indexed-db-service';

export interface MigrationStatus {
  appliedMigrations: Migration[];
  pendingMigrations: Migration[];
}

export class DatabaseMigrationService {
  private db: IndexedDBService;
  private migrations: Migration[] = [];
  private migrationStoreName = 'migrations';
  private initialized = false;

  constructor() {
    this.db = new IndexedDBService('app_database', 1);
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    // Initialize the database and create migration store if it doesn't exist
    await this.db.open([{ name: this.migrationStoreName, keyPath: 'id' }]);
    
    // Load all available migrations from the migrations directory
    try {
      const migrationsModule = await import('../migrations');
      this.migrations = Object.values(migrationsModule).filter(
        migration => typeof migration === 'object' && migration !== null && 
        'id' in migration && 'up' in migration && 'down' in migration
      ) as Migration[];
      
      // Sort migrations by ID
      this.migrations.sort((a, b) => a.id.localeCompare(b.id));
      
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing app migrations:', error);
      throw error;
    }
  }

  async getMigrationStatus(): Promise<MigrationStatus> {
    if (!this.initialized) await this.initialize();
    
    const appliedMigrationRecords = await this.db.getAll(this.migrationStoreName);
    const appliedMigrationIds = appliedMigrationRecords.map(record => record.id);
    
    const appliedMigrations = this.migrations.filter(migration => 
      appliedMigrationIds.includes(migration.id)
    );
    
    const pendingMigrations = this.migrations.filter(migration => 
      !appliedMigrationIds.includes(migration.id)
    );
    
    return { appliedMigrations, pendingMigrations };
  }

  async runMigrations(): Promise<void> {
    if (!this.initialized) await this.initialize();
    
    const { pendingMigrations } = await this.getMigrationStatus();
    
    for (const migration of pendingMigrations) {
      console.log(`Running migration: ${migration.id} - ${migration.name}`);
      
      try {
        // Run the migration
        await migration.up(null as any); // IndexedDB doesn't use Firestore, we'll adjust the Migration interface later
        
        // Record the migration in the database
        await this.db.add(this.migrationStoreName, {
          id: migration.id,
          name: migration.name,
          timestamp: new Date().toISOString()
        });
        
        console.log(`Migration ${migration.id} completed successfully`);
      } catch (error) {
        console.error(`Error running migration ${migration.id}:`, error);
        throw error;
      }
    }
  }

  async rollbackLastMigration(): Promise<void> {
    if (!this.initialized) await this.initialize();
    
    const appliedMigrations = await this.db.getAll(this.migrationStoreName);
    if (appliedMigrations.length === 0) {
      console.log('No migrations to roll back');
      return;
    }
    
    // Sort by timestamp descending
    appliedMigrations.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    const lastMigrationRecord = appliedMigrations[0];
    const lastMigrationId = lastMigrationRecord.id;
    
    const migration = this.migrations.find(m => m.id === lastMigrationId);
    
    if (!migration) {
      console.error(`Migration ${lastMigrationId} not found in available migrations`);
      throw new Error(`Migration ${lastMigrationId} not found`);
    }
    
    console.log(`Rolling back migration: ${migration.id} - ${migration.name}`);
    
    try {
      // Run the down migration
      await migration.down(null as any); // IndexedDB doesn't use Firestore
      
      // Remove the migration record from the database
      await this.db.delete(this.migrationStoreName, migration.id);
      
      console.log(`Rollback of migration ${migration.id} completed successfully`);
    } catch (error) {
      console.error(`Error rolling back migration ${migration.id}:`, error);
      throw error;
    }
  }

  async close(): Promise<void> {
    await this.db.close();
  }
} 
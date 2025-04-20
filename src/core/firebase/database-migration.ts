import { firestore } from './firebase-config';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc,
  getDoc,
  writeBatch
} from 'firebase/firestore';

interface Migration {
  id: string;
  name: string;
  description: string;
  timestamp: number;
  version: string;
  apply: () => Promise<void>;
  rollback?: () => Promise<void>;
}

export class DatabaseMigrationService {
  private static instance: DatabaseMigrationService;
  private readonly MIGRATIONS_COLLECTION = 'migrations';
  private readonly APP_SETTINGS_COLLECTION = 'app_settings';
  private readonly VERSION_DOC_ID = 'database_version';
  
  private constructor() {}
  
  public static getInstance(): DatabaseMigrationService {
    if (!DatabaseMigrationService.instance) {
      DatabaseMigrationService.instance = new DatabaseMigrationService();
    }
    return DatabaseMigrationService.instance;
  }
  
  /**
   * Get current database version
   */
  public async getCurrentVersion(): Promise<string> {
    try {
      const docRef = doc(firestore, this.APP_SETTINGS_COLLECTION, this.VERSION_DOC_ID);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data().version || '0.0.0';
      }
      
      // Initialize version document if it doesn't exist
      await setDoc(docRef, { version: '0.0.0', updatedAt: Date.now() });
      return '0.0.0';
    } catch (error) {
      console.error('Error getting database version:', error);
      throw error;
    }
  }
  
  /**
   * Set current database version
   */
  public async setCurrentVersion(version: string): Promise<void> {
    try {
      const docRef = doc(firestore, this.APP_SETTINGS_COLLECTION, this.VERSION_DOC_ID);
      await updateDoc(docRef, { 
        version, 
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('Error setting database version:', error);
      throw error;
    }
  }
  
  /**
   * Get list of applied migrations
   */
  public async getAppliedMigrations(): Promise<string[]> {
    try {
      const migrationsCol = collection(firestore, this.MIGRATIONS_COLLECTION);
      const querySnapshot = await getDocs(migrationsCol);
      
      return querySnapshot.docs.map(doc => doc.id);
    } catch (error) {
      console.error('Error getting applied migrations:', error);
      throw error;
    }
  }
  
  /**
   * Record a migration as applied
   */
  public async recordMigration(migration: Migration): Promise<void> {
    try {
      const docRef = doc(firestore, this.MIGRATIONS_COLLECTION, migration.id);
      await setDoc(docRef, {
        name: migration.name,
        description: migration.description,
        timestamp: Date.now(),
        version: migration.version,
        appliedAt: Date.now()
      });
    } catch (error) {
      console.error('Error recording migration:', error);
      throw error;
    }
  }
  
  /**
   * Apply pending migrations
   * @param migrations List of migrations to apply
   * @param targetVersion Target version to migrate to (optional)
   */
  public async applyMigrations(
    migrations: Migration[], 
    targetVersion?: string
  ): Promise<void> {
    try {
      const currentVersion = await this.getCurrentVersion();
      const appliedMigrations = await this.getAppliedMigrations();
      
      // Filter migrations that need to be applied
      const pendingMigrations = migrations.filter(migration => 
        !appliedMigrations.includes(migration.id) && 
        (this.compareVersions(migration.version, currentVersion) > 0) &&
        (!targetVersion || this.compareVersions(migration.version, targetVersion) <= 0)
      );
      
      // Sort migrations by version
      pendingMigrations.sort((a, b) => this.compareVersions(a.version, b.version));
      
      // Apply migrations in a transaction if possible
      for (const migration of pendingMigrations) {
        console.log(`Applying migration ${migration.id}: ${migration.name}`);
        
        await migration.apply();
        await this.recordMigration(migration);
        
        // Update current version to the latest applied migration
        await this.setCurrentVersion(migration.version);
      }
      
      console.log(`Database migrated from ${currentVersion} to ${pendingMigrations.length > 0 
        ? pendingMigrations[pendingMigrations.length - 1].version
        : currentVersion}`);
    } catch (error) {
      console.error('Error applying migrations:', error);
      throw error;
    }
  }
  
  /**
   * Rollback a migration
   * @param migrationId ID of the migration to rollback
   * @param migrations List of available migrations
   */
  public async rollbackMigration(
    migrationId: string,
    migrations: Migration[]
  ): Promise<void> {
    try {
      const migration = migrations.find(m => m.id === migrationId);
      
      if (!migration) {
        throw new Error(`Migration ${migrationId} not found`);
      }
      
      if (!migration.rollback) {
        throw new Error(`Migration ${migrationId} does not support rollback`);
      }
      
      const appliedMigrations = await this.getAppliedMigrations();
      
      if (!appliedMigrations.includes(migrationId)) {
        throw new Error(`Migration ${migrationId} has not been applied`);
      }
      
      // Rollback the migration
      console.log(`Rolling back migration ${migration.id}: ${migration.name}`);
      await migration.rollback();
      
      // Remove migration record
      const docRef = doc(firestore, this.MIGRATIONS_COLLECTION, migrationId);
      await updateDoc(docRef, {
        rolledBackAt: Date.now()
      });
      
      // Update current version to the previous migration
      const previousMigrations = migrations.filter(m => 
        appliedMigrations.includes(m.id) &&
        this.compareVersions(m.version, migration.version) < 0
      );
      
      if (previousMigrations.length > 0) {
        // Sort migrations by version and get the most recent one
        previousMigrations.sort((a, b) => this.compareVersions(b.version, a.version));
        await this.setCurrentVersion(previousMigrations[0].version);
      } else {
        // If there are no previous migrations, set version to 0.0.0
        await this.setCurrentVersion('0.0.0');
      }
    } catch (error) {
      console.error('Error rolling back migration:', error);
      throw error;
    }
  }
  
  /**
   * Create a batch for batch operations
   */
  public createBatch() {
    return writeBatch(firestore);
  }
  
  /**
   * Compare two semantic version strings
   * Returns -1 if v1 < v2, 0 if v1 = v2, 1 if v1 > v2
   */
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;
      
      if (part1 < part2) return -1;
      if (part1 > part2) return 1;
    }
    
    return 0;
  }
} 
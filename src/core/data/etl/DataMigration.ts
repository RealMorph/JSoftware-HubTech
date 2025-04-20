/**
 * DataMigration
 * 
 * Provides utilities for handling schema migrations and data model evolution.
 * Supports versioned schemas, migration paths, and automatic data upgrading.
 */

import { TransformerFunction } from './types';

/**
 * Migration configuration
 */
export interface MigrationConfig {
  sourceVersion: string;
  targetVersion: string;
  description?: string;
  migrator: TransformerFunction<any, any>;
}

/**
 * Schema version metadata
 */
export interface SchemaVersion {
  version: string;
  description?: string;
  createdAt: Date;
  deprecated?: boolean;
}

/**
 * Utility class for schema migrations
 */
export class DataMigration {
  private static migrations: MigrationConfig[] = [];
  private static schemaVersions: Record<string, SchemaVersion> = {};

  /**
   * Register a new schema version
   */
  static registerSchemaVersion(
    version: string,
    description?: string, 
    options?: { deprecated?: boolean }
  ): void {
    if (this.schemaVersions[version]) {
      throw new Error(`Schema version ${version} already registered`);
    }

    this.schemaVersions[version] = {
      version,
      description,
      createdAt: new Date(),
      deprecated: options?.deprecated || false,
    };
  }

  /**
   * Get all registered schema versions
   */
  static getSchemaVersions(): SchemaVersion[] {
    return Object.values(this.schemaVersions);
  }
  
  /**
   * Get a specific schema version
   */
  static getSchemaVersion(version: string): SchemaVersion | undefined {
    return this.schemaVersions[version];
  }
  
  /**
   * Register a new migration between schema versions
   */
  static registerMigration(
    sourceVersion: string,
    targetVersion: string,
    migrator: TransformerFunction<any, any>,
    description?: string,
  ): void {
    if (!this.schemaVersions[sourceVersion]) {
      throw new Error(`Source schema version ${sourceVersion} not registered`);
    }
    
    if (!this.schemaVersions[targetVersion]) {
      throw new Error(`Target schema version ${targetVersion} not registered`);
    }
    
    // Check for duplicates
    const existingMigration = this.migrations.find(
      m => m.sourceVersion === sourceVersion && m.targetVersion === targetVersion
    );
    
    if (existingMigration) {
      throw new Error(`Migration from ${sourceVersion} to ${targetVersion} already registered`);
    }
    
    this.migrations.push({
      sourceVersion,
      targetVersion,
      description,
      migrator,
    });
  }
  
  /**
   * Find a direct migration path between source and target versions
   */
  static findDirectMigration(
    sourceVersion: string, 
    targetVersion: string
  ): MigrationConfig | undefined {
    return this.migrations.find(
      m => m.sourceVersion === sourceVersion && m.targetVersion === targetVersion
    );
  }
  
  /**
   * Find all possible migration paths between source and target versions
   */
  static findMigrationPaths(
    sourceVersion: string, 
    targetVersion: string
  ): MigrationConfig[][] {
    // Simple case: direct path
    const directPath = this.findDirectMigration(sourceVersion, targetVersion);
    if (directPath) {
      return [[directPath]];
    }
    
    // Use breadth-first search to find all possible paths
    const queue: { path: MigrationConfig[]; current: string }[] = [
      { path: [], current: sourceVersion }
    ];
    const paths: MigrationConfig[][] = [];
    const visited = new Set<string>();
    
    while (queue.length > 0) {
      const { path, current } = queue.shift()!;
      
      if (current === targetVersion) {
        paths.push([...path]);
        continue;
      }
      
      if (visited.has(current)) {
        continue;
      }
      
      visited.add(current);
      
      // Find all outgoing migrations from current version
      const nextMigrations = this.migrations.filter(m => m.sourceVersion === current);
      
      for (const migration of nextMigrations) {
        if (!visited.has(migration.targetVersion)) {
          queue.push({
            path: [...path, migration],
            current: migration.targetVersion
          });
        }
      }
    }
    
    return paths;
  }
  
  /**
   * Find the optimal migration path between source and target versions
   * (the one with the fewest steps)
   */
  static findOptimalMigrationPath(
    sourceVersion: string, 
    targetVersion: string
  ): MigrationConfig[] | null {
    const paths = this.findMigrationPaths(sourceVersion, targetVersion);
    
    if (paths.length === 0) {
      return null;
    }
    
    // Find the path with the fewest steps
    return paths.reduce((shortest, current) => 
      current.length < shortest.length ? current : shortest
    , paths[0]);
  }
  
  /**
   * Migrate data from one schema version to another
   */
  static migrateData<T, R>(
    data: T, 
    sourceVersion: string, 
    targetVersion: string
  ): R {
    // If versions are the same, no migration needed
    if (sourceVersion === targetVersion) {
      return data as unknown as R;
    }
    
    // Find the optimal migration path
    const migrationPath = this.findOptimalMigrationPath(sourceVersion, targetVersion);
    
    if (!migrationPath) {
      throw new Error(`No migration path found from ${sourceVersion} to ${targetVersion}`);
    }
    
    // Apply migrations in sequence
    return migrationPath.reduce((result, migration) => {
      return migration.migrator(result);
    }, data as any) as R;
  }
  
  /**
   * Create a migration transformer that can be used in an ETL pipeline
   */
  static createMigrationTransformer<T, R>(
    sourceVersion: string, 
    targetVersion: string
  ): TransformerFunction<T, R> {
    return (data: T) => this.migrateData<T, R>(data, sourceVersion, targetVersion);
  }

  /**
   * Get all registered migrations
   */
  static getAllMigrations(): MigrationConfig[] {
    return [...this.migrations];
  }
  
  /**
   * Calculate the migration graph for visualization or analysis
   */
  static getMigrationGraph(): { nodes: string[]; edges: { source: string; target: string }[] } {
    const nodes = Object.keys(this.schemaVersions);
    const edges = this.migrations.map(m => ({
      source: m.sourceVersion,
      target: m.targetVersion
    }));
    
    return { nodes, edges };
  }
  
  /**
   * Clear all registered migrations and schema versions (mainly for testing)
   */
  static clear(): void {
    this.migrations = [];
    this.schemaVersions = {};
  }
} 
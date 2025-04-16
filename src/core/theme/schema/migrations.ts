/**
 * Theme System Database Migrations
 *
 * This file contains migration definitions for the theme database schema.
 * It follows a versioned approach to database schema changes.
 */

/**
 * Migration interface represents a single database migration
 */
export interface Migration {
  version: number;
  name: string;
  description: string;
  up: () => string | object; // SQL string or NoSQL operation object
  down: () => string | object; // SQL string or NoSQL operation object
}

/**
 * Initial migration to create the theme table/collection
 */
export const initialMigration: Migration = {
  version: 1,
  name: 'initial_theme_schema',
  description: 'Create initial theme table/collection',
  up: () => `
    CREATE TABLE themes (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description VARCHAR(500),
      colors JSON NOT NULL,
      typography JSON NOT NULL,
      spacing JSON NOT NULL,
      breakpoints JSON NOT NULL,
      is_default BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX idx_themes_is_default ON themes(is_default);
    CREATE INDEX idx_themes_name ON themes(name);
  `,
  down: () => 'DROP TABLE themes;',
};

/**
 * Example migration to add a new field to the theme schema
 */
export const addThemeVersionMigration: Migration = {
  version: 2,
  name: 'add_theme_version',
  description: 'Add version field to track theme versions',
  up: () => 'ALTER TABLE themes ADD COLUMN version VARCHAR(10) DEFAULT "1.0.0";',
  down: () => 'ALTER TABLE themes DROP COLUMN version;',
};

/**
 * Example migration for MongoDB
 */
export const mongoInitialMigration = {
  version: 1,
  name: 'initial_mongo_theme_schema',
  description: 'Create initial theme collection with validation',
  up: () => ({
    createCollection: 'themes',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['id', 'name', 'colors', 'typography', 'spacing', 'breakpoints'],
        properties: {
          id: {
            bsonType: 'string',
            description: 'The unique identifier for the theme',
          },
          name: {
            bsonType: 'string',
            description: 'The name of the theme',
          },
          description: {
            bsonType: 'string',
            description: 'Optional description of the theme',
          },
          colors: {
            bsonType: 'object',
            description: 'Color palette for the theme',
          },
          typography: {
            bsonType: 'object',
            description: 'Typography settings for the theme',
          },
          spacing: {
            bsonType: 'object',
            description: 'Spacing scale for the theme',
          },
          breakpoints: {
            bsonType: 'object',
            description: 'Responsive breakpoints for the theme',
          },
          isDefault: {
            bsonType: 'bool',
            description: 'Whether this is the default theme',
          },
          createdAt: {
            bsonType: 'date',
            description: 'When the theme was created',
          },
          updatedAt: {
            bsonType: 'date',
            description: 'When the theme was last updated',
          },
        },
      },
    },
  }),
  down: () => ({ drop: 'themes' }),
};

/**
 * All migrations in order of version
 */
export const migrations: Migration[] = [initialMigration, addThemeVersionMigration];

/**
 * Get migrations needed to update from one version to another
 */
export function getMigrations(fromVersion: number, toVersion: number): Migration[] {
  return migrations.filter(
    migration => migration.version > fromVersion && migration.version <= toVersion
  );
}

/**
 * Database schema version tracking for migrations
 */
export interface SchemaVersionRecord {
  version: number;
  appliedAt: Date;
  migrationName: string;
}

/**
 * Check if the database needs migration and return migrations to apply
 */
export async function checkMigrationStatus(
  getCurrentVersion: () => Promise<number>,
  getLatestVersion: () => number = () => Math.max(...migrations.map(m => m.version))
): Promise<{
  needsMigration: boolean;
  currentVersion: number;
  targetVersion: number;
  migrationsToApply: Migration[];
}> {
  const currentVersion = await getCurrentVersion();
  const targetVersion = getLatestVersion();

  const needsMigration = currentVersion < targetVersion;
  const migrationsToApply = needsMigration ? getMigrations(currentVersion, targetVersion) : [];

  return {
    needsMigration,
    currentVersion,
    targetVersion,
    migrationsToApply,
  };
}

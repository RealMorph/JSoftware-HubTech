/**
 * SQL Database Adapter for Theme System
 *
 * This file provides a SQL database implementation of the ThemeDatabase interface.
 * It uses a generic database connection that should be adapted to your specific SQL database.
 */

import { ThemeConfig, ThemeDatabase } from '../theme-persistence';
import { themeToDbFormat, dbToThemeFormat } from '../schema/theme-schema';
import { Migration, migrations, SchemaVersionRecord } from '../schema/migrations';

/**
 * Generic SQL database connection interface.
 * This should be replaced with your actual database client.
 */
export interface SqlConnection {
  query<T>(sql: string, params?: any[]): Promise<T>;
  transaction<T>(callback: (connection: SqlConnection) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

/**
 * SQL implementation of the ThemeDatabase interface
 */
export class SqlThemeDatabase implements ThemeDatabase {
  private readonly tableName = 'themes';
  private readonly versionTableName = 'schema_versions';

  constructor(private connection: SqlConnection) {}

  /**
   * Initialize the database with required tables and initial data
   */
  async initialize(): Promise<void> {
    // Check if schema version table exists
    const versionTableExists = await this.tableExists(this.versionTableName);

    if (!versionTableExists) {
      // Create version tracking table
      await this.connection.query(`
        CREATE TABLE ${this.versionTableName} (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          version INTEGER NOT NULL,
          migration_name VARCHAR(100) NOT NULL,
          applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }

    // Check if themes table exists
    const themesTableExists = await this.tableExists(this.tableName);

    if (!themesTableExists) {
      // Apply initial migration
      await this.applyMigration(migrations[0]);
    } else {
      // Check if migrations are needed
      await this.checkAndApplyMigrations();
    }
  }

  /**
   * Check if a table exists in the database
   */
  private async tableExists(tableName: string): Promise<boolean> {
    try {
      const result = await this.connection.query<any[]>(
        `
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name=?
      `,
        [tableName]
      );

      return result.length > 0;
    } catch (error) {
      console.error(`Error checking if table ${tableName} exists:`, error);
      return false;
    }
  }

  /**
   * Apply a single migration to the database
   */
  private async applyMigration(migration: Migration): Promise<void> {
    try {
      await this.connection.transaction(async conn => {
        // Apply the migration
        const sql = migration.up().toString();
        await conn.query(sql);

        // Record the migration in the version table
        await conn.query(
          `
          INSERT INTO ${this.versionTableName} (version, migration_name)
          VALUES (?, ?)
        `,
          [migration.version, migration.name]
        );
      });

      console.log(`Applied migration: ${migration.name} (v${migration.version})`);
    } catch (error) {
      console.error(`Error applying migration ${migration.name}:`, error);
      throw error;
    }
  }

  /**
   * Get the current schema version from the database
   */
  private async getCurrentVersion(): Promise<number> {
    try {
      const result = await this.connection.query<Array<{ version: number }>>(
        `SELECT MAX(version) as version FROM ${this.versionTableName}`
      );

      return result[0]?.version || 0;
    } catch (error) {
      console.error('Error getting current schema version:', error);
      return 0;
    }
  }

  /**
   * Check if migrations are needed and apply them if necessary
   */
  private async checkAndApplyMigrations(): Promise<void> {
    const currentVersion = await this.getCurrentVersion();
    const latestVersion = Math.max(...migrations.map(m => m.version));

    if (currentVersion < latestVersion) {
      const migrationsToApply = migrations.filter(m => m.version > currentVersion);

      for (const migration of migrationsToApply) {
        await this.applyMigration(migration);
      }
    }
  }

  /**
   * Find a theme by its ID
   */
  async findThemeById(id: string): Promise<ThemeConfig | null> {
    try {
      const results = await this.connection.query<any[]>(
        `SELECT * FROM ${this.tableName} WHERE id = ?`,
        [id]
      );

      if (results.length === 0) {
        return null;
      }

      // Convert snake_case DB fields to camelCase for the application
      const dbRecord = this.mapDbRecord(results[0]);
      return dbToThemeFormat(dbRecord);
    } catch (error) {
      console.error(`Error finding theme by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Find all themes in the database
   */
  async findAllThemes(): Promise<ThemeConfig[]> {
    try {
      const results = await this.connection.query<any[]>(`SELECT * FROM ${this.tableName}`);

      return results.map(record => {
        const dbRecord = this.mapDbRecord(record);
        return dbToThemeFormat(dbRecord);
      });
    } catch (error) {
      console.error('Error finding all themes:', error);
      throw error;
    }
  }

  /**
   * Find the default theme
   */
  async findDefaultTheme(): Promise<ThemeConfig | null> {
    try {
      const results = await this.connection.query<any[]>(
        `SELECT * FROM ${this.tableName} WHERE is_default = TRUE LIMIT 1`
      );

      if (results.length === 0) {
        return null;
      }

      const dbRecord = this.mapDbRecord(results[0]);
      return dbToThemeFormat(dbRecord);
    } catch (error) {
      console.error('Error finding default theme:', error);
      throw error;
    }
  }

  /**
   * Create a new theme
   */
  async createTheme(
    theme: Omit<ThemeConfig, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ThemeConfig> {
    try {
      const dbTheme = themeToDbFormat(theme);
      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      await this.connection.query(
        `INSERT INTO ${this.tableName} (
          id, name, description, colors, typography, spacing, 
          breakpoints, is_default, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          dbTheme.name,
          dbTheme.description || null,
          JSON.stringify(dbTheme.colors),
          JSON.stringify(dbTheme.typography),
          JSON.stringify(dbTheme.spacing),
          JSON.stringify(dbTheme.breakpoints),
          dbTheme.isDefault || false,
          now,
          now,
        ]
      );

      // If this theme is set as default, update other themes
      if (dbTheme.isDefault) {
        await this.resetOtherDefaultThemes(id);
      }

      return {
        ...theme,
        id,
        createdAt: new Date(now),
        updatedAt: new Date(now),
      } as ThemeConfig;
    } catch (error) {
      console.error('Error creating theme:', error);
      throw error;
    }
  }

  /**
   * Update an existing theme
   */
  async updateTheme(
    id: string,
    updates: Partial<Omit<ThemeConfig, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<ThemeConfig | null> {
    try {
      // First check if the theme exists
      const existingTheme = await this.findThemeById(id);
      if (!existingTheme) {
        return null;
      }

      const dbUpdates = themeToDbFormat({
        ...existingTheme,
        ...updates,
      });

      // Build the SQL update statement
      let sql = `UPDATE ${this.tableName} SET updated_at = ? `;
      const params: any[] = [new Date().toISOString()];

      // Add fields that are being updated
      if (updates.name !== undefined) {
        sql += ', name = ?';
        params.push(dbUpdates.name);
      }

      if (updates.description !== undefined) {
        sql += ', description = ?';
        params.push(dbUpdates.description || null);
      }

      if (updates.colors !== undefined) {
        sql += ', colors = ?';
        params.push(JSON.stringify(dbUpdates.colors));
      }

      if (updates.typography !== undefined) {
        sql += ', typography = ?';
        params.push(JSON.stringify(dbUpdates.typography));
      }

      if (updates.spacing !== undefined) {
        sql += ', spacing = ?';
        params.push(JSON.stringify(dbUpdates.spacing));
      }

      if (updates.breakpoints !== undefined) {
        sql += ', breakpoints = ?';
        params.push(JSON.stringify(dbUpdates.breakpoints));
      }

      if (updates.isDefault !== undefined) {
        sql += ', is_default = ?';
        params.push(dbUpdates.isDefault);
      }

      // Complete the SQL statement with WHERE clause
      sql += ' WHERE id = ?';
      params.push(id);

      // Execute the update
      await this.connection.query(sql, params);

      // If this theme is set as default, update other themes
      if (updates.isDefault === true) {
        await this.resetOtherDefaultThemes(id);
      }

      // Return the updated theme
      return this.findThemeById(id);
    } catch (error) {
      console.error(`Error updating theme ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a theme by its ID
   */
  async deleteTheme(id: string): Promise<boolean> {
    try {
      // Check if theme exists and if it's the default
      const theme = await this.findThemeById(id);
      if (!theme) {
        return false;
      }

      // Delete the theme
      const result = await this.connection.query(`DELETE FROM ${this.tableName} WHERE id = ?`, [
        id,
      ]);

      // If this was the default theme, set another one as default
      if (theme.isDefault) {
        const themes = await this.findAllThemes();
        if (themes.length > 0) {
          await this.setDefaultTheme(themes[0].id);
        }
      }

      return true;
    } catch (error) {
      console.error(`Error deleting theme ${id}:`, error);
      throw error;
    }
  }

  /**
   * Set a theme as the default theme
   */
  async setDefaultTheme(id: string): Promise<boolean> {
    try {
      // Check if theme exists
      const theme = await this.findThemeById(id);
      if (!theme) {
        return false;
      }

      // Update all themes to not be default
      await this.resetAllDefaultThemes();

      // Set this theme as default
      await this.connection.query(`UPDATE ${this.tableName} SET is_default = TRUE WHERE id = ?`, [
        id,
      ]);

      return true;
    } catch (error) {
      console.error(`Error setting theme ${id} as default:`, error);
      throw error;
    }
  }

  /**
   * Reset the default flag for all themes except the one with the given ID
   */
  private async resetOtherDefaultThemes(id: string): Promise<void> {
    await this.connection.query(`UPDATE ${this.tableName} SET is_default = FALSE WHERE id != ?`, [
      id,
    ]);
  }

  /**
   * Reset the default flag for all themes
   */
  private async resetAllDefaultThemes(): Promise<void> {
    await this.connection.query(`UPDATE ${this.tableName} SET is_default = FALSE`);
  }

  /**
   * Map a database record with snake_case fields to camelCase
   */
  private mapDbRecord(record: Record<string, any>): Record<string, any> {
    return {
      id: record.id,
      name: record.name,
      description: record.description,
      colors: typeof record.colors === 'string' ? JSON.parse(record.colors) : record.colors,
      typography:
        typeof record.typography === 'string' ? JSON.parse(record.typography) : record.typography,
      spacing: typeof record.spacing === 'string' ? JSON.parse(record.spacing) : record.spacing,
      breakpoints:
        typeof record.breakpoints === 'string'
          ? JSON.parse(record.breakpoints)
          : record.breakpoints,
      isDefault: record.is_default,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }
}

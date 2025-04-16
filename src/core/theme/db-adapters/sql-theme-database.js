import { themeToDbFormat, dbToThemeFormat } from '../schema/theme-schema';
import { migrations } from '../schema/migrations';
export class SqlThemeDatabase {
  constructor(connection) {
    Object.defineProperty(this, 'connection', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: connection,
    });
    Object.defineProperty(this, 'tableName', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 'themes',
    });
    Object.defineProperty(this, 'versionTableName', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 'schema_versions',
    });
  }
  async initialize() {
    const versionTableExists = await this.tableExists(this.versionTableName);
    if (!versionTableExists) {
      await this.connection.query(`
        CREATE TABLE ${this.versionTableName} (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          version INTEGER NOT NULL,
          migration_name VARCHAR(100) NOT NULL,
          applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }
    const themesTableExists = await this.tableExists(this.tableName);
    if (!themesTableExists) {
      await this.applyMigration(migrations[0]);
    } else {
      await this.checkAndApplyMigrations();
    }
  }
  async tableExists(tableName) {
    try {
      const result = await this.connection.query(
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
  async applyMigration(migration) {
    try {
      await this.connection.transaction(async conn => {
        const sql = migration.up().toString();
        await conn.query(sql);
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
  async getCurrentVersion() {
    try {
      const result = await this.connection.query(
        `SELECT MAX(version) as version FROM ${this.versionTableName}`
      );
      return result[0]?.version || 0;
    } catch (error) {
      console.error('Error getting current schema version:', error);
      return 0;
    }
  }
  async checkAndApplyMigrations() {
    const currentVersion = await this.getCurrentVersion();
    const latestVersion = Math.max(...migrations.map(m => m.version));
    if (currentVersion < latestVersion) {
      const migrationsToApply = migrations.filter(m => m.version > currentVersion);
      for (const migration of migrationsToApply) {
        await this.applyMigration(migration);
      }
    }
  }
  async findThemeById(id) {
    try {
      const results = await this.connection.query(`SELECT * FROM ${this.tableName} WHERE id = ?`, [
        id,
      ]);
      if (results.length === 0) {
        return null;
      }
      const dbRecord = this.mapDbRecord(results[0]);
      return dbToThemeFormat(dbRecord);
    } catch (error) {
      console.error(`Error finding theme by ID ${id}:`, error);
      throw error;
    }
  }
  async findAllThemes() {
    try {
      const results = await this.connection.query(`SELECT * FROM ${this.tableName}`);
      return results.map(record => {
        const dbRecord = this.mapDbRecord(record);
        return dbToThemeFormat(dbRecord);
      });
    } catch (error) {
      console.error('Error finding all themes:', error);
      throw error;
    }
  }
  async findDefaultTheme() {
    try {
      const results = await this.connection.query(
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
  async createTheme(theme) {
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
      if (dbTheme.isDefault) {
        await this.resetOtherDefaultThemes(id);
      }
      return {
        ...theme,
        id,
        createdAt: new Date(now),
        updatedAt: new Date(now),
      };
    } catch (error) {
      console.error('Error creating theme:', error);
      throw error;
    }
  }
  async updateTheme(id, updates) {
    try {
      const existingTheme = await this.findThemeById(id);
      if (!existingTheme) {
        return null;
      }
      const dbUpdates = themeToDbFormat({
        ...existingTheme,
        ...updates,
      });
      let sql = `UPDATE ${this.tableName} SET updated_at = ? `;
      const params = [new Date().toISOString()];
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
      sql += ' WHERE id = ?';
      params.push(id);
      await this.connection.query(sql, params);
      if (updates.isDefault === true) {
        await this.resetOtherDefaultThemes(id);
      }
      return this.findThemeById(id);
    } catch (error) {
      console.error(`Error updating theme ${id}:`, error);
      throw error;
    }
  }
  async deleteTheme(id) {
    try {
      const theme = await this.findThemeById(id);
      if (!theme) {
        return false;
      }
      const result = await this.connection.query(`DELETE FROM ${this.tableName} WHERE id = ?`, [
        id,
      ]);
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
  async setDefaultTheme(id) {
    try {
      const theme = await this.findThemeById(id);
      if (!theme) {
        return false;
      }
      await this.resetAllDefaultThemes();
      await this.connection.query(`UPDATE ${this.tableName} SET is_default = TRUE WHERE id = ?`, [
        id,
      ]);
      return true;
    } catch (error) {
      console.error(`Error setting theme ${id} as default:`, error);
      throw error;
    }
  }
  async resetOtherDefaultThemes(id) {
    await this.connection.query(`UPDATE ${this.tableName} SET is_default = FALSE WHERE id != ?`, [
      id,
    ]);
  }
  async resetAllDefaultThemes() {
    await this.connection.query(`UPDATE ${this.tableName} SET is_default = FALSE`);
  }
  mapDbRecord(record) {
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

import { jest } from '@jest/globals';
import { migrations, getMigrations, checkMigrationStatus } from '../schema/migrations';

describe('Theme Database Schema', () => {
  describe('Schema Files', () => {
    it('should have migration files exported properly', () => {
      expect(Array.isArray(migrations)).toBe(true);
      expect(migrations.length).toBeGreaterThan(0);
      expect(typeof getMigrations).toBe('function');
      expect(typeof checkMigrationStatus).toBe('function');
    });
  });

  describe('Migrations System', () => {
    it('should have properly defined migrations', () => {
      expect(migrations.length).toBeGreaterThan(0);

      // Check each migration structure
      migrations.forEach(migration => {
        expect(migration.version).toBeGreaterThan(0);
        expect(typeof migration.name).toBe('string');
        expect(typeof migration.description).toBe('string');
        expect(typeof migration.up).toBe('function');
        expect(typeof migration.down).toBe('function');
      });

      // Check migrations are ordered by version
      for (let i = 1; i < migrations.length; i++) {
        expect(migrations[i].version).toBeGreaterThan(migrations[i - 1].version);
      }
    });

    it('should get migrations between versions', () => {
      const result = getMigrations(0, 2);

      expect(result.length).toBe(2);
      expect(result[0].version).toBe(1);
      expect(result[1].version).toBe(2);
    });

    it('should return empty array if no migrations needed', () => {
      const result = getMigrations(2, 2);
      expect(result.length).toBe(0);
    });
  });

  describe('Migration Status Check', () => {
    it('should check if migrations are needed', async () => {
      // Mock version getter
      const getCurrentVersion = jest.fn(() => Promise.resolve(1));

      const result = await checkMigrationStatus(getCurrentVersion);

      expect(result.needsMigration).toBe(true);
      expect(result.currentVersion).toBe(1);
      expect(result.targetVersion).toBe(2);
      expect(result.migrationsToApply.length).toBe(1);
      expect(result.migrationsToApply[0].version).toBe(2);
    });

    it('should handle up-to-date database', async () => {
      // Mock version getter for up-to-date database
      const getCurrentVersion = jest.fn(() => Promise.resolve(2));

      const result = await checkMigrationStatus(getCurrentVersion);

      expect(result.needsMigration).toBe(false);
      expect(result.currentVersion).toBe(2);
      expect(result.targetVersion).toBe(2);
      expect(result.migrationsToApply.length).toBe(0);
    });
  });
});

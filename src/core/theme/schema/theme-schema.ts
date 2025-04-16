/**
 * Theme System Database Schema
 *
 * This file defines the database schema for storing theme configurations.
 * It can be used with various database systems by adapting the schema to
 * the specific database technology being used.
 */

import { ThemeConfig } from '../theme-persistence';

/**
 * ThemeSchemaDefinition provides a database-agnostic representation
 * of the theme schema structure with field types and constraints.
 */
export interface ThemeSchemaDefinition {
  id: {
    type: 'string';
    primary: true;
    required: true;
  };
  name: {
    type: 'string';
    required: true;
    maxLength: 100;
  };
  description: {
    type: 'string';
    required: false;
    maxLength: 500;
  };
  colors: {
    type: 'json';
    required: true;
  };
  typography: {
    type: 'json';
    required: true;
  };
  spacing: {
    type: 'json';
    required: true;
  };
  breakpoints: {
    type: 'json';
    required: true;
  };
  isDefault: {
    type: 'boolean';
    required: false;
    default: false;
  };
  createdAt: {
    type: 'datetime';
    required: true;
    default: 'now';
  };
  updatedAt: {
    type: 'datetime';
    required: true;
    default: 'now';
  };
}

/**
 * Sample SQL schema for a relational database
 * This is provided as a reference implementation and can be adapted as needed
 */
export const sampleSqlSchema = `
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
`;

/**
 * Sample MongoDB schema for a document database
 * This is provided as a reference implementation and can be adapted as needed
 */
export const sampleMongoSchema = {
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  colors: { type: Object, required: true },
  typography: { type: Object, required: true },
  spacing: { type: Object, required: true },
  breakpoints: { type: Object, required: true },
  isDefault: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};

/**
 * Convert a ThemeConfig object to a database-compatible format
 * This function normalizes the data and ensures all required fields are present
 */
export function themeToDbFormat(
  theme: Omit<ThemeConfig, 'id' | 'createdAt' | 'updatedAt'>
): Record<string, any> {
  // Create a copy of the theme to avoid modifying the original
  const dbTheme: Record<string, any> = {
    name: theme.name,
    colors: theme.colors,
    typography: theme.typography,
    spacing: theme.spacing,
    breakpoints: theme.breakpoints,
  };

  // Handle optional fields
  if (theme.description) {
    dbTheme.description = theme.description;
  }

  if (theme.isDefault !== undefined) {
    dbTheme.isDefault = theme.isDefault;
  }

  return dbTheme;
}

/**
 * Convert a database record to a ThemeConfig object
 * This function handles any necessary transformations or default values
 */
export function dbToThemeFormat(dbRecord: Record<string, any>): ThemeConfig {
  return {
    id: dbRecord.id,
    name: dbRecord.name,
    description: dbRecord.description,
    colors: dbRecord.colors,
    typography: dbRecord.typography,
    spacing: dbRecord.spacing,
    breakpoints: dbRecord.breakpoints,
    isDefault: dbRecord.isDefault ?? false,
    createdAt: new Date(dbRecord.createdAt),
    updatedAt: new Date(dbRecord.updatedAt),
  };
}

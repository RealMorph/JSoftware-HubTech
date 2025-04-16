# Theme System Database Schema

This document describes the database schema and migration system for the theme system.

## Schema Overview

The theme system uses a database to store theme configurations. The schema is designed to be flexible and can be adapted for different database technologies. The core schema includes the following tables:

### Themes Table

The main table for storing theme configurations. Each theme contains the following fields:

| Field          | Type      | Description                                    |
|----------------|-----------|------------------------------------------------|
| id             | STRING    | Unique identifier for the theme                |
| name           | STRING    | Name of the theme                              |
| description    | STRING    | Optional description of the theme              |
| colors         | JSON      | Color palette including semantic and state colors |
| typography     | JSON      | Typography settings (scale, weights, etc.)     |
| spacing        | JSON      | Spacing scale and semantic spacing values      |
| breakpoints    | JSON      | Responsive breakpoint values and containers    |
| is_default     | BOOLEAN   | Flag indicating if this is the default theme   |
| created_at     | DATETIME  | When the theme was created                     |
| updated_at     | DATETIME  | When the theme was last updated                |
| version        | STRING    | Theme version (added in migration v2)          |

### Schema Versions Table

Tracks the database schema version and applied migrations:

| Field          | Type      | Description                                    |
|----------------|-----------|------------------------------------------------|
| id             | INTEGER   | Unique identifier for the version record       |
| version        | INTEGER   | Schema version number                          |
| migration_name | STRING    | Name of the migration                          |
| applied_at     | DATETIME  | When the migration was applied                 |

## Schema Implementations

The theme system includes example schema implementations for different database technologies:

### SQL Database

```sql
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
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  version VARCHAR(10) DEFAULT "1.0.0"
);

CREATE INDEX idx_themes_is_default ON themes(is_default);
CREATE INDEX idx_themes_name ON themes(name);
```

### MongoDB

```javascript
{
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
  version: { type: String, default: "1.0.0" }
}
```

## Migration System

The theme system includes a migration system to handle database schema changes over time. Migrations follow a version-based approach, where each migration has:

- A version number
- A name
- A description
- Up and down functions to apply or roll back the migration

### Current Migrations

| Version | Name | Description |
|---------|------|-------------|
| 1 | initial_theme_schema | Create initial theme table/collection |
| 2 | add_theme_version | Add version field to track theme versions |

### How Migrations Work

1. The system checks the current database schema version
2. If the database is at a lower version than the latest migration, it applies all migrations in sequence
3. Each applied migration is recorded in the schema versions table

### Adding a New Migration

To add a new migration:

1. Create a new Migration object with a higher version number
2. Implement the up and down functions
3. Add the migration to the migrations array

Example:

```typescript
const newFeatureMigration: Migration = {
  version: 3,
  name: 'add_new_feature',
  description: 'Add support for new feature X',
  up: () => 'ALTER TABLE themes ADD COLUMN new_feature_enabled BOOLEAN DEFAULT FALSE;',
  down: () => 'ALTER TABLE themes DROP COLUMN new_feature_enabled;'
};

// Add to migrations array
migrations.push(newFeatureMigration);
```

## Adapting to Different Databases

The theme system is designed to work with different database technologies. To adapt to a specific database:

1. Implement the ThemeDatabase interface
2. Convert the schema to the appropriate format for your database
3. Implement the migration system using your database's migration capabilities

See the SqlThemeDatabase class for an example implementation. 
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
export function themeToDbFormat(theme) {
  const dbTheme = {
    name: theme.name,
    colors: theme.colors,
    typography: theme.typography,
    spacing: theme.spacing,
    breakpoints: theme.breakpoints,
  };
  if (theme.description) {
    dbTheme.description = theme.description;
  }
  if (theme.isDefault !== undefined) {
    dbTheme.isDefault = theme.isDefault;
  }
  return dbTheme;
}
export function dbToThemeFormat(dbRecord) {
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

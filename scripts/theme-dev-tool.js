const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Configuration
const config = {
  outputPath: path.resolve(__dirname, '../dist/theme-analysis.txt'),
  srcPath: path.resolve(__dirname, '../src'),
  themePath: path.resolve(__dirname, '../src/core/theme'),
  defaultThemePath: path.resolve(__dirname, '../src/core/theme/default-theme.ts'),
  colorPalettePath: path.resolve(__dirname, '../src/core/theme/colorPalette.ts'),
};

// Helper function to find theme-related files
function findThemeFiles(dir) {
  const themeFiles = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      themeFiles.push(...findThemeFiles(filePath));
    } else if (
      file.includes('theme') ||
      file.includes('color') ||
      file.includes('palette') ||
      file.includes('style')
    ) {
      themeFiles.push(filePath);
    }
  }

  return themeFiles;
}

// Helper function to analyze theme usage
function analyzeThemeUsage() {
  const themeFiles = findThemeFiles(config.srcPath);
  console.log(`Found ${themeFiles.length} theme-related files`);

  // Analyze theme imports
  const themeImports = {};
  themeFiles.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(config.srcPath, filePath);

    // Find imports from theme directory
    const importRegex = /import\s+.*\s+from\s+['"]\.\.?\/.*theme.*['"]/g;
    const imports = content.match(importRegex) || [];

    if (imports.length > 0) {
      themeImports[relativePath] = imports;
    }
  });

  // Analyze theme hooks usage
  const themeHooks = {};
  themeFiles.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(config.srcPath, filePath);

    // Find theme hook usage
    const hookRegex = /useTheme\(\)|useThemeContext\(\)/g;
    const hooks = content.match(hookRegex) || [];

    if (hooks.length > 0) {
      themeHooks[relativePath] = hooks.length;
    }
  });

  // Analyze theme components
  const themeComponents = {};
  themeFiles.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(config.srcPath, filePath);

    // Find theme component usage
    const componentRegex = /<ThemeProvider|<ThemeManager|<ThemePreview|<PaletteDemo/g;
    const components = content.match(componentRegex) || [];

    if (components.length > 0) {
      themeComponents[relativePath] = components;
    }
  });

  return {
    themeImports,
    themeHooks,
    themeComponents,
  };
}

// Helper function to analyze color palette
function analyzeColorPalette() {
  if (!fs.existsSync(config.colorPalettePath)) {
    console.log(chalk.yellow('Color palette file not found'));
    return null;
  }

  const content = fs.readFileSync(config.colorPalettePath, 'utf-8');

  // Extract color definitions
  const colorRegex = /(\w+):\s*{\s*([^}]+)\s*}/g;
  const colors = [];
  let match;

  while ((match = colorRegex.exec(content)) !== null) {
    const [_, name, colorDefs] = match;
    const shades = {};

    // Extract shades
    const shadeRegex = /(\d+):\s*['"]([^'"]+)['"]/g;
    let shadeMatch;

    while ((shadeMatch = shadeRegex.exec(colorDefs)) !== null) {
      const [__, shade, hex] = shadeMatch;
      shades[shade] = hex;
    }

    colors.push({
      name,
      shades,
    });
  }

  return colors;
}

// Helper function to analyze default theme
function analyzeDefaultTheme() {
  if (!fs.existsSync(config.defaultThemePath)) {
    console.log(chalk.yellow('Default theme file not found'));
    return null;
  }

  const content = fs.readFileSync(config.defaultThemePath, 'utf-8');

  // Extract theme properties
  const themeRegex = /export\s+const\s+defaultTheme\s*=\s*{([^}]+)}/s;
  const match = themeRegex.exec(content);

  if (!match) {
    console.log(chalk.yellow('Default theme definition not found'));
    return null;
  }

  const themeContent = match[1];

  // Extract color scheme
  const colorSchemeRegex = /colors:\s*{([^}]+)}/s;
  const colorMatch = colorSchemeRegex.exec(themeContent);

  if (!colorMatch) {
    console.log(chalk.yellow('Color scheme not found in default theme'));
    return null;
  }

  const colorSchemeContent = colorMatch[1];

  // Extract color definitions
  const colorRegex = /(\w+):\s*['"]([^'"]+)['"]/g;
  const colors = {};
  let colorMatch2;

  while ((colorMatch2 = colorRegex.exec(colorSchemeContent)) !== null) {
    const [__, name, value] = colorMatch2;
    colors[name] = value;
  }

  // Extract typography
  const typographyRegex = /typography:\s*{([^}]+)}/s;
  const typographyMatch = typographyRegex.exec(themeContent);

  if (!typographyMatch) {
    console.log(chalk.yellow('Typography not found in default theme'));
    return null;
  }

  const typographyContent = typographyMatch[1];

  // Extract typography definitions
  const typographyRegex2 = /(\w+):\s*{([^}]+)}/g;
  const typography = {};
  let typographyMatch2;

  while ((typographyMatch2 = typographyRegex2.exec(typographyContent)) !== null) {
    const [__, name, defs] = typographyMatch2;
    typography[name] = {};

    // Extract typography properties
    const propRegex = /(\w+):\s*['"]([^'"]+)['"]/g;
    let propMatch;

    while ((propMatch = propRegex.exec(defs)) !== null) {
      const [___, propName, value] = propMatch;
      typography[name][propName] = value;
    }
  }

  return {
    colors,
    typography,
  };
}

// Helper function to generate theme recommendations
function generateThemeRecommendations(themeUsage, colorPalette, defaultTheme) {
  const recommendations = [];

  // Check for consistent color usage
  if (colorPalette && defaultTheme) {
    const paletteColors = new Set();
    colorPalette.forEach(color => {
      Object.keys(color.shades).forEach(shade => {
        paletteColors.add(`${color.name}.${shade}`);
      });
    });

    const themeColors = new Set(Object.keys(defaultTheme.colors));

    // Check for unused palette colors
    const unusedPaletteColors = Array.from(paletteColors).filter(color => !themeColors.has(color));
    if (unusedPaletteColors.length > 0) {
      recommendations.push({
        type: 'unused-palette-colors',
        description: 'Some palette colors are not used in the default theme',
        details: unusedPaletteColors.join(', '),
      });
    }

    // Check for theme colors not in palette
    const themeColorsNotInPalette = Array.from(themeColors).filter(
      color => !paletteColors.has(color)
    );
    if (themeColorsNotInPalette.length > 0) {
      recommendations.push({
        type: 'theme-colors-not-in-palette',
        description: 'Some theme colors are not defined in the color palette',
        details: themeColorsNotInPalette.join(', '),
      });
    }
  }

  // Check for theme hook usage
  const hookFiles = Object.keys(themeUsage.themeHooks);
  if (hookFiles.length === 0) {
    recommendations.push({
      type: 'no-theme-hooks',
      description:
        'No components are using theme hooks, consider using useTheme() for theme-aware components',
    });
  }

  // Check for theme provider usage
  const providerFiles = Object.keys(themeUsage.themeComponents).filter(file =>
    themeUsage.themeComponents[file].some(component => component.includes('ThemeProvider'))
  );

  if (providerFiles.length === 0) {
    recommendations.push({
      type: 'no-theme-provider',
      description: 'No ThemeProvider found, ensure your app is wrapped with ThemeProvider',
    });
  }

  return recommendations;
}

// Main function to analyze theme system
function analyzeThemeSystem() {
  console.log('Analyzing theme system...');

  // Analyze theme usage
  const themeUsage = analyzeThemeUsage();

  // Analyze color palette
  const colorPalette = analyzeColorPalette();

  // Analyze default theme
  const defaultTheme = analyzeDefaultTheme();

  // Generate recommendations
  const recommendations = generateThemeRecommendations(themeUsage, colorPalette, defaultTheme);

  // Generate report
  let report = 'Theme System Analysis Report\n';
  report += '==========================\n\n';

  // Theme usage
  report += 'Theme Usage:\n';
  report += '------------\n';
  report += `Theme-related files: ${findThemeFiles(config.srcPath).length}\n`;
  report += `Files importing from theme: ${Object.keys(themeUsage.themeImports).length}\n`;
  report += `Files using theme hooks: ${Object.keys(themeUsage.themeHooks).length}\n`;
  report += `Files using theme components: ${Object.keys(themeUsage.themeComponents).length}\n\n`;

  // Color palette
  report += 'Color Palette:\n';
  report += '-------------\n';
  if (!colorPalette) {
    report += 'Color palette not found.\n';
  } else {
    report += `Color categories: ${colorPalette.length}\n`;
    colorPalette.forEach(color => {
      report += `- ${color.name}: ${Object.keys(color.shades).length} shades\n`;
    });
  }
  report += '\n';

  // Default theme
  report += 'Default Theme:\n';
  report += '-------------\n';
  if (!defaultTheme) {
    report += 'Default theme not found.\n';
  } else {
    report += `Colors: ${Object.keys(defaultTheme.colors).length}\n`;
    report += `Typography categories: ${Object.keys(defaultTheme.typography).length}\n`;
  }
  report += '\n';

  // Recommendations
  report += 'Recommendations:\n';
  report += '---------------\n';
  if (recommendations.length === 0) {
    report += 'No recommendations.\n';
  } else {
    recommendations.forEach(recommendation => {
      report += `- ${recommendation.description}\n`;
      if (recommendation.details) {
        report += `  Details: ${recommendation.details}\n`;
      }
    });
  }
  report += '\n';

  // Best practices
  report += 'Theme System Best Practices:\n';
  report += '--------------------------\n';
  report += '- Use the color palette for consistent colors across the application\n';
  report += '- Use theme hooks (useTheme) to access theme values in components\n';
  report += '- Wrap your application with ThemeProvider to provide theme context\n';
  report += '- Use theme-aware components for consistent styling\n';
  report += '- Consider using CSS variables for dynamic theme switching\n';
  report += '- Test your application with different themes to ensure proper styling\n';

  // Write report to file
  fs.writeFileSync(config.outputPath, report);
  console.log(`Theme analysis report written to ${config.outputPath}`);

  return report;
}

// Run the analysis
analyzeThemeSystem();

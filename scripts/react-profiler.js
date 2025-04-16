const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  outputPath: path.resolve(__dirname, '../dist/react-performance.txt'),
  srcPath: path.resolve(__dirname, '../src'),
  threshold: {
    renderTime: 1, // ms
    reRenderCount: 3,
    propChanges: 5,
  },
};

// Helper function to find React component files
function findReactComponents(dir) {
  const components = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      components.push(...findReactComponents(filePath));
    } else if (
      (file.endsWith('.tsx') || file.endsWith('.jsx')) &&
      !file.includes('.test.') &&
      !file.includes('.spec.')
    ) {
      components.push(filePath);
    }
  }

  return components;
}

// Helper function to analyze a React component file
function analyzeComponent(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(config.srcPath, filePath);

  // Check for performance issues
  const issues = [];

  // Check for inline styles
  const inlineStyleRegex = /style=\{[^}]+\}/g;
  const inlineStyles = content.match(inlineStyleRegex) || [];
  if (inlineStyles.length > 0) {
    issues.push({
      type: 'inline-styles',
      count: inlineStyles.length,
      description: 'Using inline styles can cause unnecessary re-renders',
    });
  }

  // Check for inline functions in JSX
  const inlineFunctionRegex = /onClick=\{[^}]+\}|onChange=\{[^}]+\}|onSubmit=\{[^}]+\}/g;
  const inlineFunctions = content.match(inlineFunctionRegex) || [];
  if (inlineFunctions.length > 0) {
    issues.push({
      type: 'inline-functions',
      count: inlineFunctions.length,
      description: 'Using inline functions in JSX can cause unnecessary re-renders',
    });
  }

  // Check for large components
  const lines = content.split('\n').length;
  if (lines > 300) {
    issues.push({
      type: 'large-component',
      count: lines,
      description: 'Large components can be difficult to maintain and may impact performance',
    });
  }

  // Check for missing memoization
  const hasMemo =
    content.includes('React.memo') ||
    content.includes('useMemo') ||
    content.includes('useCallback');
  if (!hasMemo && (inlineStyles.length > 0 || inlineFunctions.length > 0)) {
    issues.push({
      type: 'missing-memoization',
      count: 1,
      description: 'Consider using React.memo, useMemo, or useCallback to optimize rendering',
    });
  }

  // Check for prop drilling
  const propsRegex = /props\.([a-zA-Z0-9_]+)/g;
  const props = content.match(propsRegex) || [];
  if (props.length > config.threshold.propChanges) {
    issues.push({
      type: 'prop-drilling',
      count: props.length,
      description: 'Excessive prop drilling can make components harder to maintain',
    });
  }

  // Check for state management
  const useStateRegex = /useState\(/g;
  const useStateCount = (content.match(useStateRegex) || []).length;
  if (useStateCount > 5) {
    issues.push({
      type: 'excessive-state',
      count: useStateCount,
      description: 'Consider using a state management solution for complex state',
    });
  }

  // Check for useEffect dependencies
  const useEffectRegex = /useEffect\([^,]+,\s*\[([^\]]+)\]/g;
  const useEffectMatches = content.matchAll(useEffectRegex);
  for (const match of useEffectMatches) {
    const deps = match[1].split(',').map(dep => dep.trim());
    if (deps.length === 0 || (deps.length === 1 && deps[0] === '')) {
      issues.push({
        type: 'empty-dependencies',
        count: 1,
        description: 'useEffect with empty dependencies array may indicate a missing dependency',
      });
    }
  }

  return {
    file: relativePath,
    issues,
  };
}

// Helper function to generate performance recommendations
function generateRecommendations(components) {
  const recommendations = [];

  // Count issue types
  const issueTypes = {};
  components.forEach(component => {
    component.issues.forEach(issue => {
      issueTypes[issue.type] = (issueTypes[issue.type] || 0) + issue.count;
    });
  });

  // Generate recommendations based on issue types
  if (issueTypes['inline-styles']) {
    recommendations.push({
      type: 'inline-styles',
      description: 'Consider using CSS-in-JS libraries or CSS modules instead of inline styles',
      count: issueTypes['inline-styles'],
    });
  }

  if (issueTypes['inline-functions']) {
    recommendations.push({
      type: 'inline-functions',
      description: 'Move event handlers outside of the render function or use useCallback',
      count: issueTypes['inline-functions'],
    });
  }

  if (issueTypes['large-component']) {
    recommendations.push({
      type: 'large-component',
      description: 'Break down large components into smaller, more focused components',
      count: issueTypes['large-component'],
    });
  }

  if (issueTypes['missing-memoization']) {
    recommendations.push({
      type: 'missing-memoization',
      description: 'Use React.memo, useMemo, or useCallback to prevent unnecessary re-renders',
      count: issueTypes['missing-memoization'],
    });
  }

  if (issueTypes['prop-drilling']) {
    recommendations.push({
      type: 'prop-drilling',
      description:
        'Consider using Context API or a state management library to avoid prop drilling',
      count: issueTypes['prop-drilling'],
    });
  }

  if (issueTypes['excessive-state']) {
    recommendations.push({
      type: 'excessive-state',
      description:
        'Consider using a state management solution like Redux or Zustand for complex state',
      count: issueTypes['excessive-state'],
    });
  }

  if (issueTypes['empty-dependencies']) {
    recommendations.push({
      type: 'empty-dependencies',
      description: 'Review useEffect dependencies to ensure they are correctly specified',
      count: issueTypes['empty-dependencies'],
    });
  }

  return recommendations;
}

// Main function to profile React components
function profileReactComponents() {
  console.log('Profiling React components...');

  // Find React component files
  const componentFiles = findReactComponents(config.srcPath);
  console.log(`Found ${componentFiles.length} React component files`);

  // Analyze components
  const components = componentFiles.map(analyzeComponent);

  // Filter components with issues
  const componentsWithIssues = components.filter(component => component.issues.length > 0);

  // Generate recommendations
  const recommendations = generateRecommendations(components);

  // Generate report
  let report = 'React Component Performance Report\n';
  report += '================================\n\n';

  // Summary
  report += `Total Components: ${components.length}\n`;
  report += `Components with Issues: ${componentsWithIssues.length}\n`;
  report += `Total Issues: ${components.reduce((sum, component) => sum + component.issues.length, 0)}\n\n`;

  // Components with issues
  report += 'Components with Issues:\n';
  report += '---------------------\n';
  if (componentsWithIssues.length === 0) {
    report += 'No components with issues found.\n';
  } else {
    componentsWithIssues.forEach(component => {
      report += `\n${component.file}:\n`;
      component.issues.forEach(issue => {
        report += `  - ${issue.description} (${issue.count} occurrences)\n`;
      });
    });
  }
  report += '\n';

  // Recommendations
  report += 'Recommendations:\n';
  report += '---------------\n';
  if (recommendations.length === 0) {
    report += 'No recommendations.\n';
  } else {
    recommendations.forEach(recommendation => {
      report += `- ${recommendation.description} (${recommendation.count} occurrences)\n`;
    });
  }
  report += '\n';

  // Best practices
  report += 'React Performance Best Practices:\n';
  report += '------------------------------\n';
  report += '- Use React.memo for components that receive the same props frequently\n';
  report += '- Use useMemo for expensive calculations\n';
  report += '- Use useCallback for functions passed as props\n';
  report += '- Avoid inline styles and functions in JSX\n';
  report += '- Break down large components into smaller, more focused components\n';
  report += '- Use the Context API or a state management library to avoid prop drilling\n';
  report += '- Review useEffect dependencies to ensure they are correctly specified\n';

  // Write report to file
  fs.writeFileSync(config.outputPath, report);
  console.log(`React performance report written to ${config.outputPath}`);

  return report;
}

// Run the profiler
profileReactComponents();

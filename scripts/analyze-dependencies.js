const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  outputPath: path.resolve(__dirname, '../dist/dependency-analysis.txt'),
  packageJsonPath: path.resolve(__dirname, '../package.json'),
  nodeModulesPath: path.resolve(__dirname, '../node_modules'),
  sizeThreshold: 1024 * 1024, // 1MB
  duplicateThreshold: 0.8, // 80% similarity
};

// Helper function to get directory size
function getDirectorySize(dirPath) {
  let size = 0;
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      size += getDirectorySize(filePath);
    } else {
      size += stats.size;
    }
  }

  return size;
}

// Helper function to get package info
function getPackageInfo(packageName) {
  try {
    const packageJsonPath = path.join(config.nodeModulesPath, packageName, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      return JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    }
  } catch (error) {
    console.error(`Error reading package info for ${packageName}:`, error.message);
  }
  return null;
}

// Helper function to check for duplicate dependencies
function findDuplicateDependencies(dependencies) {
  const duplicates = [];
  const packages = Object.keys(dependencies);

  for (let i = 0; i < packages.length; i++) {
    for (let j = i + 1; j < packages.length; j++) {
      const pkg1 = packages[i];
      const pkg2 = packages[j];

      // Check if packages have similar names or functionality
      if (pkg1.includes(pkg2) || pkg2.includes(pkg1)) {
        duplicates.push({
          pkg1,
          pkg2,
          version1: dependencies[pkg1],
          version2: dependencies[pkg2],
        });
      }
    }
  }

  return duplicates;
}

// Helper function to check for outdated dependencies
function checkOutdatedDependencies() {
  try {
    const result = execSync('npm outdated --json', { encoding: 'utf-8' });
    return JSON.parse(result);
  } catch (error) {
    console.error('Error checking outdated dependencies:', error.message);
    return {};
  }
}

// Helper function to check for security vulnerabilities
function checkSecurityVulnerabilities() {
  try {
    const result = execSync('npm audit --json', { encoding: 'utf-8' });
    return JSON.parse(result);
  } catch (error) {
    console.error('Error checking security vulnerabilities:', error.message);
    return { vulnerabilities: {} };
  }
}

// Main function to analyze dependencies
function analyzeDependencies() {
  console.log('Analyzing dependencies...');

  // Read package.json
  const packageJson = JSON.parse(fs.readFileSync(config.packageJsonPath, 'utf-8'));
  const { dependencies = {}, devDependencies = {} } = packageJson;

  // Combine all dependencies
  const allDependencies = { ...dependencies, ...devDependencies };

  // Find large dependencies
  const largeDependencies = [];
  for (const [pkg, version] of Object.entries(allDependencies)) {
    const pkgPath = path.join(config.nodeModulesPath, pkg);
    if (fs.existsSync(pkgPath)) {
      const size = getDirectorySize(pkgPath);
      if (size > config.sizeThreshold) {
        largeDependencies.push({ pkg, version, size });
      }
    }
  }

  // Sort large dependencies by size
  largeDependencies.sort((a, b) => b.size - a.size);

  // Find duplicate dependencies
  const duplicates = findDuplicateDependencies(allDependencies);

  // Check for outdated dependencies
  const outdated = checkOutdatedDependencies();

  // Check for security vulnerabilities
  const vulnerabilities = checkSecurityVulnerabilities();

  // Generate report
  let report = 'Dependency Analysis Report\n';
  report += '========================\n\n';

  // Summary
  report += `Total Dependencies: ${Object.keys(allDependencies).length}\n`;
  report += `Production Dependencies: ${Object.keys(dependencies).length}\n`;
  report += `Development Dependencies: ${Object.keys(devDependencies).length}\n\n`;

  // Large dependencies
  report += 'Large Dependencies (> 1MB):\n';
  report += '-------------------------\n';
  if (largeDependencies.length === 0) {
    report += 'No large dependencies found.\n';
  } else {
    largeDependencies.forEach(({ pkg, version, size }) => {
      const sizeMB = (size / (1024 * 1024)).toFixed(2);
      report += `${pkg}@${version}: ${sizeMB} MB\n`;
    });
  }
  report += '\n';

  // Duplicate dependencies
  report += 'Potential Duplicate Dependencies:\n';
  report += '-------------------------------\n';
  if (duplicates.length === 0) {
    report += 'No duplicate dependencies found.\n';
  } else {
    duplicates.forEach(({ pkg1, pkg2, version1, version2 }) => {
      report += `${pkg1}@${version1} and ${pkg2}@${version2}\n`;
    });
  }
  report += '\n';

  // Outdated dependencies
  report += 'Outdated Dependencies:\n';
  report += '---------------------\n';
  if (Object.keys(outdated).length === 0) {
    report += 'No outdated dependencies found.\n';
  } else {
    for (const [pkg, info] of Object.entries(outdated)) {
      report += `${pkg}: ${info.current} -> ${info.latest}\n`;
    }
  }
  report += '\n';

  // Security vulnerabilities
  report += 'Security Vulnerabilities:\n';
  report += '------------------------\n';
  const vulnCount = Object.keys(vulnerabilities.vulnerabilities || {}).length;
  if (vulnCount === 0) {
    report += 'No security vulnerabilities found.\n';
  } else {
    report += `Found ${vulnCount} security vulnerabilities.\n`;
    report += 'Run "npm audit" for details.\n';
  }
  report += '\n';

  // Recommendations
  report += 'Recommendations:\n';
  report += '---------------\n';

  if (largeDependencies.length > 0) {
    report += '- Consider replacing or optimizing large dependencies\n';
  }

  if (duplicates.length > 0) {
    report += '- Resolve duplicate dependencies to reduce bundle size\n';
  }

  if (Object.keys(outdated).length > 0) {
    report += '- Update outdated dependencies to get the latest features and security fixes\n';
  }

  if (vulnCount > 0) {
    report += '- Address security vulnerabilities by running "npm audit fix"\n';
  }

  // Write report to file
  fs.writeFileSync(config.outputPath, report);
  console.log(`Dependency analysis report written to ${config.outputPath}`);

  return report;
}

// Run the analysis
analyzeDependencies();

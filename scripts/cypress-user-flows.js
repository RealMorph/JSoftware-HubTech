/**
 * Cypress Critical User Flows Generator
 * 
 * This script helps generate and manage Cypress tests for critical user flows.
 * It can create template tests, run specific flows, and report on coverage.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

// Configuration
const FLOWS_DIR = path.join(__dirname, '../cypress/e2e/flows');
const TEMPLATES_DIR = path.join(__dirname, '../cypress/templates');
const RESULTS_DIR = path.join(__dirname, '../test-results');
const FLOW_CONFIG_FILE = path.join(__dirname, '../cypress/flow-config.json');

// Command line arguments
const args = process.argv.slice(2);
const command = args[0];
const flowName = args[1];

// Ensure directories exist
[FLOWS_DIR, TEMPLATES_DIR, RESULTS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Create default flow config if it doesn't exist
if (!fs.existsSync(FLOW_CONFIG_FILE)) {
  const defaultConfig = {
    criticalFlows: [
      {
        name: 'authentication',
        description: 'User authentication flow',
        steps: ['login', 'access-protected-route', 'logout'],
        priority: 'high'
      },
      {
        name: 'user-profile',
        description: 'User profile management',
        steps: ['view-profile', 'edit-profile', 'save-changes'],
        priority: 'medium'
      },
      {
        name: 'navigation',
        description: 'Main navigation flow',
        steps: ['navigate-between-pages', 'use-breadcrumbs', 'use-tabs'],
        priority: 'high'
      },
      {
        name: 'form-submission',
        description: 'Form validation and submission',
        steps: ['fill-form', 'validate-form', 'submit-form', 'handle-success'],
        priority: 'high'
      },
      {
        name: 'data-grid',
        description: 'Data grid operation flow',
        steps: ['filter-data', 'sort-data', 'paginate-data', 'select-row'],
        priority: 'medium'
      }
    ]
  };

  fs.writeFileSync(FLOW_CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
  console.log(chalk.green(`Created default flow configuration at ${FLOW_CONFIG_FILE}`));
}

// Load flow configuration
const flowConfig = JSON.parse(fs.readFileSync(FLOW_CONFIG_FILE, 'utf8'));

// Template for a new flow test
const generateFlowTemplate = (flow) => {
  return `/**
 * Critical User Flow: ${flow.description}
 * 
 * This test validates the ${flow.name} user flow
 * Priority: ${flow.priority}
 */

describe('${flow.description} (${flow.name})', () => {
  beforeEach(() => {
    cy.visit('/');
    // Common setup for this flow
    cy.intercept('GET', '/api/**').as('apiCall');
    cy.intercept('POST', '/api/**').as('postCall');
  });

  it('completes the entire ${flow.name} flow successfully', () => {
${flow.steps.map(step => `    // Step: ${step}
    // TODO: Implement the "${step}" step
    // cy.get('...').should('...').click();
    
`).join('')}
    // Final verification
    cy.url().should('include', '/success');
  });

  // Test each step in isolation
${flow.steps.map(step => `  it('completes the "${step}" step', () => {
    // TODO: Implement isolated test for "${step}" step
  });
`).join('\n')}

  // Error handling test
  it('handles errors gracefully', () => {
    // TODO: Implement error handling test
    // Force an error condition and verify proper handling
  });
});
`;
};

// Create a new flow test file
const createFlowTest = (flowName) => {
  const flow = flowConfig.criticalFlows.find(f => f.name === flowName);
  
  if (!flow) {
    console.error(chalk.red(`Flow "${flowName}" not found in configuration`));
    console.log(chalk.yellow('Available flows:'));
    flowConfig.criticalFlows.forEach(f => {
      console.log(chalk.yellow(`- ${f.name}: ${f.description}`));
    });
    process.exit(1);
  }
  
  const flowFile = path.join(FLOWS_DIR, `${flowName}.cy.js`);
  
  if (fs.existsSync(flowFile)) {
    console.error(chalk.red(`Flow test "${flowName}" already exists at ${flowFile}`));
    process.exit(1);
  }
  
  fs.writeFileSync(flowFile, generateFlowTemplate(flow));
  console.log(chalk.green(`Created flow test for "${flowName}" at ${flowFile}`));
};

// Run a specific flow test
const runFlowTest = (flowName) => {
  const specificTest = flowName ? `--spec "cypress/e2e/flows/${flowName}.cy.js"` : '';
  try {
    console.log(chalk.blue(`Running ${flowName ? `"${flowName}"` : 'all'} flow tests...`));
    execSync(`npx cypress run ${specificTest}`, { stdio: 'inherit' });
    console.log(chalk.green('Flow tests completed successfully'));
  } catch (error) {
    console.error(chalk.red('Flow tests failed:'), error.message);
    process.exit(1);
  }
};

// List all available flows
const listFlows = () => {
  console.log(chalk.blue('Available Critical User Flows:'));
  console.log('----------------------------');
  
  flowConfig.criticalFlows.forEach(flow => {
    const testFile = path.join(FLOWS_DIR, `${flow.name}.cy.js`);
    const implemented = fs.existsSync(testFile);
    
    console.log(`${implemented ? chalk.green('✓') : chalk.yellow('○')} ${flow.name}`);
    console.log(`   Description: ${flow.description}`);
    console.log(`   Priority: ${flow.priority}`);
    console.log(`   Steps: ${flow.steps.join(' → ')}`);
    console.log(`   Status: ${implemented ? chalk.green('Implemented') : chalk.yellow('Not implemented')}`);
    console.log('----------------------------');
  });
};

// Generate all missing flow tests
const generateAllFlows = () => {
  let generated = 0;
  
  flowConfig.criticalFlows.forEach(flow => {
    const flowFile = path.join(FLOWS_DIR, `${flow.name}.cy.js`);
    
    if (!fs.existsSync(flowFile)) {
      fs.writeFileSync(flowFile, generateFlowTemplate(flow));
      console.log(chalk.green(`Created flow test for "${flow.name}" at ${flowFile}`));
      generated++;
    }
  });
  
  if (generated === 0) {
    console.log(chalk.yellow('All flows already have test files generated'));
  } else {
    console.log(chalk.green(`Generated ${generated} flow test files`));
  }
};

// Report on flow coverage
const reportFlowCoverage = () => {
  const total = flowConfig.criticalFlows.length;
  const implemented = flowConfig.criticalFlows.filter(flow => 
    fs.existsSync(path.join(FLOWS_DIR, `${flow.name}.cy.js`))
  ).length;
  
  const percentage = Math.round((implemented / total) * 100);
  
  console.log(chalk.blue('Critical User Flow Coverage:'));
  console.log(`${implemented}/${total} flows implemented (${percentage}%)`);
  
  // Generate a simple coverage report
  const report = {
    timestamp: new Date().toISOString(),
    totalFlows: total,
    implementedFlows: implemented,
    coveragePercentage: percentage,
    flowStatus: flowConfig.criticalFlows.map(flow => {
      const testFile = path.join(FLOWS_DIR, `${flow.name}.cy.js`);
      return {
        name: flow.name,
        description: flow.description,
        priority: flow.priority,
        implemented: fs.existsSync(testFile)
      };
    })
  };
  
  const reportFile = path.join(RESULTS_DIR, 'flow-coverage.json');
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(chalk.green(`Coverage report saved to ${reportFile}`));
};

// Process command
switch (command) {
  case 'create':
    if (!flowName) {
      console.error(chalk.red('Please specify a flow name to create'));
      process.exit(1);
    }
    createFlowTest(flowName);
    break;
    
  case 'run':
    runFlowTest(flowName);
    break;
    
  case 'list':
    listFlows();
    break;
    
  case 'generate-all':
    generateAllFlows();
    break;
    
  case 'report':
    reportFlowCoverage();
    break;
    
  default:
    console.log(chalk.blue('Cypress Critical User Flows Generator'));
    console.log('Usage:');
    console.log('  node scripts/cypress-user-flows.js create <flow-name>  - Create a new flow test');
    console.log('  node scripts/cypress-user-flows.js run [flow-name]     - Run all or a specific flow test');
    console.log('  node scripts/cypress-user-flows.js list                - List all available flows');
    console.log('  node scripts/cypress-user-flows.js generate-all        - Generate all missing flow tests');
    console.log('  node scripts/cypress-user-flows.js report              - Report on flow coverage');
    break;
} 
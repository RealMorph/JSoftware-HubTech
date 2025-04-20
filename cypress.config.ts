import { defineConfig } from 'cypress';
import { lighthouse, prepareAudit } from '@cypress-audit/lighthouse';

// Fix for type compatibility
declare global {
  namespace Cypress {
    // Make BrowserLaunchOptions an alias for BeforeBrowserLaunchOptions
    type BrowserLaunchOptions = Cypress.BeforeBrowserLaunchOptions;
  }
}

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    excludeSpecPattern: ['**/node_modules/**', '**/__snapshots__/**'],
    experimentalRunAllSpecs: true,
    experimentalStudio: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    screenshotOnRunFailure: true,
    video: true,
    videoCompression: 32,
    setupNodeEvents(on, config) {
      // Lighthouse performance testing
      on('before:browser:launch', (browser, launchOptions) => {
        prepareAudit(launchOptions);
        return launchOptions;
      });

      on('task', {
        lighthouse: lighthouse(),
      });

      // Load environment variables
      const env = process.env.NODE_ENV || 'development';
      config.env.environment = env;

      // Return config
      return config;
    },
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    excludeSpecPattern: ['**/node_modules/**', '**/__snapshots__/**'],
    viewportWidth: 1280,
    viewportHeight: 720,
  },

  retries: {
    runMode: 2,
    openMode: 0,
  },

  screenshotsFolder: 'cypress/screenshots',
  videosFolder: 'cypress/videos',
  fixturesFolder: 'cypress/fixtures',
  downloadsFolder: 'cypress/downloads',

  defaultCommandTimeout: 5000,
  execTimeout: 60000,
  taskTimeout: 60000,
  pageLoadTimeout: 60000,
  requestTimeout: 15000,
  responseTimeout: 15000,
}); 
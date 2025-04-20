// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Import Axe Core for accessibility testing
import 'cypress-axe';

// Add accessibility testing commands
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to log in with the test user
       * @example cy.login('user@example.com', 'password123')
       */
      login(email: string, password: string): Chainable<any>;
      
      /**
       * Custom command to verify theme is applied correctly
       * @example cy.verifyTheme('light')
       */
      verifyTheme(themeName: string): Chainable<any>;
      
      /**
       * Custom command to wait for theme to apply
       * @example cy.waitForTheme()
       */
      waitForTheme(): Chainable<any>;
    }
  }
}

// Configure event listeners
Cypress.on('window:before:load', (win) => {
  // Disable specific console errors during tests
  const originalConsoleError = win.console.error;
  win.console.error = (...args: any[]) => {
    // Suppress React act() warnings
    if (
      args.length > 0 &&
      typeof args[0] === 'string' &&
      args[0].includes('was not wrapped in act')
    ) {
      return;
    }
    originalConsoleError(...args);
  };
});

// Log test information
beforeEach(() => {
  const testTitle = Cypress.currentTest.title;
  const testFullTitle = Cypress.currentTest.titlePath.join(' > ');
  
  cy.log(`Running test: ${testFullTitle}`);
  
  // Reset any persistent state
  cy.clearLocalStorage();
  cy.clearCookies();
  
  // Set default viewport
  cy.viewport(1280, 720);
}); 
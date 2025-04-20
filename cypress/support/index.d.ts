/// <reference types="cypress" />
/// <reference types="cypress-axe" />
/// <reference types="@cypress-audit/lighthouse" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to check accessibility of the current page
     * @example cy.checkA11y()
     */
    checkA11y(
      context?: string | Node | HTMLElement,
      options?: any,
      violations?: any
    ): Chainable;
    
    /**
     * Custom command to log in with the test user
     * @example cy.login('user@example.com', 'password123')
     */
    login(email: string, password: string): Chainable;
    
    /**
     * Custom command to verify theme is applied correctly
     * @example cy.verifyTheme('light')
     */
    verifyTheme(themeName: string): Chainable;
    
    /**
     * Custom command to wait for theme to apply
     * @example cy.waitForTheme()
     */
    waitForTheme(): Chainable;

    /**
     * Custom command to run Lighthouse audit
     * @example cy.runLighthouseAudit()
     */
    runLighthouseAudit(thresholds?: object): Chainable;

    /**
     * Custom command from cypress-axe
     */
    injectAxe(): Chainable;

    /**
     * Custom lighthouse command
     */
    lighthouse(thresholds?: object): Chainable;
  }
} 
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
/**
 * Custom command to check accessibility of the current page
 */
Cypress.Commands.add('checkA11y', function (context, options, violations) {
    cy.injectAxe();
    cy.checkA11y(context, options, violations);
});
/**
 * Custom command to log in with the test user
 */
Cypress.Commands.add('login', function (email, password) {
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(email);
    cy.get('[data-testid="password-input"]').type(password);
    cy.get('[data-testid="login-button"]').click();
    // Wait for login to complete and redirect
    cy.url().should('not.include', '/login');
});
/**
 * Custom command to verify theme is applied correctly
 */
Cypress.Commands.add('verifyTheme', function (themeName) {
    // Check that theme class/attribute is correctly set
    cy.get('html').should('have.attr', 'data-theme', themeName);
    // Verify some theme colors are applied correctly
    if (themeName === 'light') {
        cy.get('body').should('have.css', 'background-color', 'rgb(250, 250, 250)');
    }
    else if (themeName === 'dark') {
        cy.get('body').should('have.css', 'background-color', 'rgb(33, 33, 33)');
    }
});
/**
 * Custom command to wait for theme to apply
 */
Cypress.Commands.add('waitForTheme', function () {
    // Wait for theme CSS variables to be applied
    cy.get('html[data-theme]', { timeout: 5000 }).should('exist');
});
// Performance testing command
Cypress.Commands.add('runLighthouseAudit', function () {
    cy.lighthouse({
        performance: 85,
        accessibility: 90,
        'best-practices': 85,
        seo: 85,
        pwa: 50,
    });
});

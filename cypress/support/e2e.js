"use strict";
// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
// ***********************************************************
Object.defineProperty(exports, "__esModule", { value: true });
// Import commands.js using ES2015 syntax:
require("./commands");
// Import Axe Core for accessibility testing
require("cypress-axe");
// Configure event listeners
Cypress.on('window:before:load', function (win) {
    // Disable specific console errors during tests
    var originalConsoleError = win.console.error;
    win.console.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        // Suppress React act() warnings
        if (args.length > 0 &&
            typeof args[0] === 'string' &&
            args[0].includes('was not wrapped in act')) {
            return;
        }
        originalConsoleError.apply(void 0, args);
    };
});
// Log test information
beforeEach(function () {
    var testTitle = Cypress.currentTest.title;
    var testFullTitle = Cypress.currentTest.titlePath.join(' > ');
    cy.log("Running test: ".concat(testFullTitle));
    // Reset any persistent state
    cy.clearLocalStorage();
    cy.clearCookies();
    // Set default viewport
    cy.viewport(1280, 720);
});

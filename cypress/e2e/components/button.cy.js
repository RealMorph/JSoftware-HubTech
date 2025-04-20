describe('Button Component', function () {
    beforeEach(function () {
        // Navigate to the button demo page
        cy.visit('/components/button');
    });
    it('renders primary button correctly', function () {
        // Check if the button exists
        cy.get('[data-testid="button-primary"]').should('exist');
        // Verify appearance
        cy.get('[data-testid="button-primary"]')
            .should('have.css', 'background-color')
            .and('not.equal', 'rgba(0, 0, 0, 0)');
        // Test click behavior
        cy.get('[data-testid="button-primary"]').click();
        cy.get('[data-testid="click-result"]').should('contain', 'Primary button clicked');
    });
    it('renders secondary button correctly', function () {
        // Check if the button exists
        cy.get('[data-testid="button-secondary"]').should('exist');
        // Verify appearance
        cy.get('[data-testid="button-secondary"]')
            .should('have.css', 'border')
            .and('not.equal', 'none');
        // Test click behavior
        cy.get('[data-testid="button-secondary"]').click();
        cy.get('[data-testid="click-result"]').should('contain', 'Secondary button clicked');
    });
    it('renders disabled button correctly', function () {
        // Check if the button exists and is disabled
        cy.get('[data-testid="button-disabled"]')
            .should('exist')
            .and('have.attr', 'disabled');
        // Verify appearance (should have a different opacity)
        cy.get('[data-testid="button-disabled"]')
            .should('have.css', 'opacity')
            .and('not.equal', '1');
        // Test that clicking doesn't trigger the handler
        cy.get('[data-testid="button-disabled"]').click({ force: true });
        cy.get('[data-testid="click-result"]').should('not.contain', 'Disabled button clicked');
    });
    it('passes accessibility tests', function () {
        // Run a11y tests
        cy.checkA11y();
    });
    it('works correctly with keyboard navigation', function () {
        // Focus the button directly instead of using tab navigation
        cy.get('[data-testid="button-primary"]').focus();
        cy.get('[data-testid="button-primary"]').should('have.focus');
        // Press enter to click
        cy.focused().type('{enter}');
        cy.get('[data-testid="click-result"]').should('contain', 'Primary button clicked');
        // Focus the next button directly
        cy.get('[data-testid="button-secondary"]').focus();
        cy.get('[data-testid="button-secondary"]').should('have.focus');
        // Press space to click
        cy.focused().type(' ');
        cy.get('[data-testid="click-result"]').should('contain', 'Secondary button clicked');
    });
    it('renders correctly in different themes', function () {
        // Test light theme
        cy.get('html').invoke('attr', 'data-theme', 'light');
        cy.waitForTheme();
        cy.verifyTheme('light');
        // Test dark theme
        cy.get('html').invoke('attr', 'data-theme', 'dark');
        cy.waitForTheme();
        cy.verifyTheme('dark');
    });
    it('passes performance audit', function () {
        // Run lighthouse performance audit
        cy.runLighthouseAudit();
    });
});

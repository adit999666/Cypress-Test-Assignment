// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Command for login
Cypress.Commands.add('login', () => {
    cy.visit('/')
    cy.get('.auth-login-btn').click()

    cy.wait(10000)
    cy.origin('https://datapharmltd.b2clogin.com', () => {
        cy.get('#signInName').clear().type(Cypress.env('username'), { log: false })
        cy.get('#password').clear().type(Cypress.env('password'), { log: false })
        cy.get('#next').click()
    })

    cy.wait(10000)
    cy.url().should('include', '/emc/browse-companies')
})

Cypress.Commands.add('logout', () => {
    cy.get('.custom-dropdown-toggle.account-toggle.emc-icon-link').click();
    cy.get('.custom-dropdown-menu').should('be.visible');
    cy.get('a[href="/emc/logout"]').eq(0).click();
  });
  
/// <reference types="Cypress" />

context('Navigation', () => {
  beforeEach(() => {
    cy.mockGraphQL([])
    cy.visit('http://localhost:8000/', {
      onBeforeLoad: win => {
        win.sessionStorage.clear()
      },
    })
  })

  it("cy.go() - go back or forward in the browser's history", () => {
    cy.get('[data-testid=open-menu-button]').click()
    cy.get('[data-testid=multiplayer-menu-option]').click()
    cy.location('pathname').should('include', 'lobby')

    cy.go('back')
    cy.location('pathname').should('not.include', 'lobby')

    cy.go('forward')
    cy.location('pathname').should('include', 'lobby')

    // clicking back
    cy.go(-1)
    cy.location('pathname').should('not.include', 'lobby')

    // clicking forward
    cy.go(1)
    cy.location('pathname').should('include', 'lobby')

    // navigate to about
    cy.get('[data-testid=open-menu-button]').click()
    cy.get('[data-testid=about-menu-option]').click()
    cy.location('pathname').should('include', 'about')
  })
})

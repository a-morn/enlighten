/// <reference types="Cypress" />

context('Navigation', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8000/', {
      onBeforeLoad: (win) => {
        win.sessionStorage.clear()
      }
    })
  })

  it('cy.go() - go back or forward in the browser\'s history', () => {
    cy.get('nav > div > button').click()
    // https://on.cypress.io/go
    cy.get('nav').contains('Multiplayer').click()
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
    cy.get('nav > div > button').click()
    cy.get('nav').contains('About').click()
    cy.location('pathname').should('include', 'about')
  })

  it('cy.reload() - reload the page', () => {
    // https://on.cypress.io/reload
    cy.reload()

    // reload the page without using the cache
    cy.reload(true)
  })
})

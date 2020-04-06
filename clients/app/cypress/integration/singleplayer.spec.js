/// <reference types="Cypress" />

context('Navigation', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8000/', {
      onBeforeLoad: (win) => {
        win.sessionStorage.clear()
      }
    })
  })

  it('Start and end singleplayer game', () => {
    cy.get('select')
      .select('game-of-thrones')

    cy.get('button')
      .contains('Start')
      .click()

    cy.wait(1000);

    cy.get('button')
      .contains('End game')
      .click()
  })
})

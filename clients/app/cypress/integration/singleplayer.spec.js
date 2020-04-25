/// <reference types="Cypress" />
import categoriesOnlyGot from '../fixtures/categories-only-got.json'
import gameSingleplayerNotAnswered1 from '../fixtures/game-singleplayer-not-answered-1.json'
import gameSingleplayerAnswered1 from '../fixtures/game-singleplayer-answered-1.json'

context('Navigation', () => {
  beforeEach(() => {
    cy.mockGraphQL([
      {
        operationName: 'Categories',
        responses: [
          {
            data: {
              categories: categoriesOnlyGot,
            },
          },
        ],
      },
      {
        operationName: 'CreateGame',
        responses: [
          {
            data: {
              createGameSingleplayer: {
                success: true,
                __typename: 'CreateGameSingleplayerResponse',
              },
            },
          },
        ],
      },
      {
        operationName: 'GetGame',
        responses: [
          {
            data: {
              gameSingleplayer: null,
            },
          },
          {
            data: {
              gameSingleplayer: gameSingleplayerNotAnswered1,
            },
          },
          {
            data: {
              gameSingleplayer: null,
            },
          },
        ],
      },
      {
        operationName: 'AnswerQuestion',
        responses: [
          {
            data: {
              answerQuestionSingleplayer: {
                success: true,
                __typename: 'AnswerQuestionSingleplayerResponse',
              },
            },
          },
        ],
        wsSideEffect: {
          delay: 100,
          payload: {
            data: {
              gameSingleplayerSubscription: {
                gameSingleplayer: gameSingleplayerAnswered1,
                mutation: 'UPDATE',
                __typename: 'GameSingleplayerSubscription',
              },
            },
          },
        },
      },
      {
        operationName: 'DeleteGame',
        responses: [
          {
            data: {
              deleteGameSingleplayer: {
                success: true,
                __typename: 'DeleteGameSingleplayerResponse',
              },
            },
          },
        ],
      },
    ])
    cy.visit('http://localhost:8000/', {
      onBeforeLoad: win => {
        win.sessionStorage.clear()
      },
    })
  })

  it('Start game, answer question, end game', () => {
    console.log(cy.fixture('categories-only-got.json'))

    cy.get('[data-testid=open-menu-button]').click()
    cy.get('[data-testid=singleplayer-menu-option]').click()
    cy.get('[data-testid=category-select]').select('game-of-thrones')

    cy.get('[data-testid=start-game-button]').click()

    cy.get('[data-testid=alternative-0-wrapper]')
      .find('button')
      .click()

    cy.wait(1000)
    cy.get('[data-testid=end-game-button]').click()
  })
})

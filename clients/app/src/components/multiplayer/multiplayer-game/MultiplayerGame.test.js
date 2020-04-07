import React from 'react'
import { MultiplayerGame, ANSWER } from './MultiplayerGame'
import { MockedProvider } from '@apollo/react-testing'
import { mount } from 'enzyme'

const mocks = []

const baseGame = {
  currentQuestion: { type: 'text', alternatives: [] },
}

let container

it('show winner-modal when someone won', () => {
  // Test first render and effect
  const gameWherePlayerWon = {
    ...baseGame,
    players: [{ id: 'id', won: true }, { id: 'other-id' }],
  }
  container = mount(
    <MultiplayerGame
      game={gameWherePlayerWon}
      playerId={'id'}
      leaveGame={() => {}}
    />,
  )

  expect(
    container.find({
      'data-testid': 'winner-modal',
    }),
  ).toHaveLength(1)
})

it('show opponent-left-modal when other player left', () => {
  // Test first render and effect
  const gameWhereOtherPlayerLeft = {
    ...baseGame,
    players: [{ id: 'id' }, { id: 'other-id', hasLeft: true }],
  }
  container = mount(
    <MultiplayerGame
      game={gameWhereOtherPlayerLeft}
      playerId={'id'}
      leaveGame={() => {}}
    />,
  )

  expect(
    container.find({
      'data-testid': 'opponent-left-modal',
    }),
  ).toHaveLength(1)
})

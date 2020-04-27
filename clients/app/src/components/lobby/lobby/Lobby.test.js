import React from 'react'
import { render } from '@testing-library/react'
import { Lobby } from './Lobby'

test('renders game request offered modal', () => {
  const playerRequestName = 'Player McPlayerface'

  const { getByText } = render(
    <Lobby
      players={[]}
      offered
      playerRequestName={playerRequestName}
      pingLobby={() => {}}
    />,
  )

  expect(
    getByText(`${playerRequestName} is challenging you`),
  ).toBeInTheDocument()
})

test('renders game request offered modal', () => {
  const playerOfferedName = 'Marilyn Manson'
  const { getByText } = render(
    <Lobby
      players={[]}
      pending
      playerOfferedName={playerOfferedName}
      pingLobby={() => {}}
    />,
  )

  expect(
    getByText(`Waiting for ${playerOfferedName} to accept challenge`),
  ).toBeInTheDocument()
})

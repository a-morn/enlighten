import { render } from '@testing-library/react'
import React from 'react'
import { MultiplayerGame } from './MultiplayerGame'

test('show when you won', () => {
  const { getByText } = render(<MultiplayerGame playerWon />)

  expect(getByText(/You won!/i)).not.toEqual(null)
})

test('show when you lost', () => {
  const { getByText } = render(
    <MultiplayerGame otherPlayerWon otherPlayerName="Bob" />,
  )

  expect(getByText(/Bob won!/i)).toBeInTheDocument()
})

test('show when other player left', () => {
  const { getByText } = render(
    <MultiplayerGame otherPlayerLeft otherPlayerName="Bob" />,
  )

  expect(getByText(/Bob left!/i)).toBeInTheDocument()
})

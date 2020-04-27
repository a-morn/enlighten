import React from 'react'
import { render } from '@testing-library/react'
import PlayerList from './PlayerList'

test('renders all players', () => {
  const players = [
    { name: 'Alice', id: 'alice-123' },
    { name: 'Bob', id: 'bob-123' },
    { name: 'Charlie', id: 'charlie-123' },
  ]

  const { getByText } = render(
    <PlayerList players={players} currentPlayerId={players[1].id} />,
  )

  expect(getByText('Alice')).toBeInTheDocument()
  expect(getByText('Bob *')).toBeInTheDocument()
  expect(getByText('Charlie')).toBeInTheDocument()
})

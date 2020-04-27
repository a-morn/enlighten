import { render, fireEvent } from '@testing-library/react'
import React from 'react'
import SingleplayerGame from './SingleplayerGame'

test('ends game', () => {
  const endGame = jest.fn()
  const { getByText } = render(
    <SingleplayerGame
      endGame={endGame}
      currentQuestion={{ type: 'text', alternatives: [] }}
    />,
  )

  fireEvent.click(getByText(/End Game/i))

  expect(endGame).toHaveBeenCalledTimes(1)
})

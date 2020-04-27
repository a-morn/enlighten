import React from 'react'
import { render } from '@testing-library/react'
import Alternative from './Alternative'

test("doesn't have classes correct, incorrect, or selected by default", () => {
  const { getByTestId } = render(<Alternative alternative={{ type: 'text' }} />)

  expect(getByTestId('alternative-button').classList.contains('correct')).toBe(
    false,
  )
  expect(getByTestId('alternative-button').classList.contains('selected')).toBe(
    false,
  )
  expect(
    getByTestId('alternative-button').classList.contains('incorrect'),
  ).toBe(false)
})

test('has class correct if @correct == true , and class selected if @selected == true', () => {
  const { getByTestId } = render(
    <Alternative alternative={{ type: 'text' }} selected correct />,
  )

  expect(getByTestId('alternative-button').classList.contains('correct')).toBe(
    true,
  )
  expect(getByTestId('alternative-button').classList.contains('selected')).toBe(
    true,
  )
})

test('has class incorrect if correct === false', () => {
  const { getByTestId } = render(
    <Alternative alternative={{ type: 'text' }} correct={false} />,
  )

  expect(
    getByTestId('alternative-button').classList.contains('incorrect'),
  ).toBe(true)
})

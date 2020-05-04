import React from 'react'
import { render } from '@testing-library/react'
import Question from './Question'

test('renders text', () => {
  const questionProp = { type: 'text', text: 'Test', alternatives: [] }

  const { getByText } = render(<Question question={questionProp} />)

  expect(getByText(questionProp.text)).toBeInTheDocument()
})

test('renders image', () => {
  const questionProp = {
    type: 'image',
    src: '/path/to/image.jpg',
    lqip: 'base64abc',
    alternatives: [],
  }

  const { getByTestId } = render(<Question question={questionProp} />)

  expect(getByTestId('question-image').getAttribute('data-srcset')).toEqual(
    `${process.env.REACT_APP_ASSETS_URL}${questionProp.src}`,
  )
  expect(getByTestId('question-image').getAttribute('src')).toEqual(
    questionProp.lqip,
  )
})

import React from 'react'
import Question from './Question'
import { create } from 'react-test-renderer'

describe('Question component', () => {
  it('matches the snapshot', () => {
    const questionProp = { type: 'text', text: 'Test', alternatives: [] }
    const question = create(<Question question={questionProp} />)
    expect(question.toJSON()).toMatchSnapshot()
  })
  it('renders text', () => {
    const questionProp = { type: 'text', text: 'Test', alternatives: [] }
    const component = create(<Question question={questionProp} />)
    const instance = component.root
    const h3 = instance.findByType('h3')
    expect(h3.props.children).toBe(questionProp.text)
  })
  it('renders image', () => {
    const questionProp = {
      type: 'image',
      src: 'domain/image.jpg',
      alternatives: [],
    }
    const component = create(<Question question={questionProp} />)
    const instance = component.root
    const img = instance.findByType('img')
    expect(img.props.src).toBe(questionProp.src)
  })
})

import React from 'react'
import CategoryPicker from './CategoryPicker'
import { create } from 'react-test-renderer'

describe('CategoryPicker component', () => {
  it('matches the snapshot', () => {
    const categoryPicker = create(<CategoryPicker />)
    expect(categoryPicker.toJSON()).toMatchSnapshot()
  })
})

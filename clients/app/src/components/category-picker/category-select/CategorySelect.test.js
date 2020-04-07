import React from 'react'
import { create } from 'react-test-renderer'
import CategoryPicker from './CategoryPicker'

describe('CategoryPicker component', () => {
  it('matches the snapshot', () => {
    const categoryPicker = create(<CategoryPicker />)
    expect(categoryPicker.toJSON()).toMatchSnapshot()
  })
})

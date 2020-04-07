import React from 'react'
import { create } from 'react-test-renderer'
import LimitBreak from './LimitBreak'

describe('LimitBreak component', () => {
  it('matches the snapshot', () => {
    const limitBreak = create(<LimitBreak level={50} max={100} />)
    expect(limitBreak.toJSON()).toMatchSnapshot()
  })
})

import React from 'react'
import { render } from '@testing-library/react'
import CategorySelect from './CategorySelect'

test('renders all categories', () => {
  const categories = [
    { label: 'Animals', id: 'animals' },
    { label: 'Plants', id: 'plants' },
  ]

  const { getByText } = render(
    <CategorySelect
      categories={categories}
      onChange={() => {}}
      selected="plants"
    />,
  )

  for (const { label } of categories) {
    expect(getByText(label)).toBeInTheDocument()
  }
})

import React, { memo } from 'react'

const CategorySelect = memo(({ categories, onChange, selected }) => (
  <select
    data-testid="category-select"
    onChange={({ target: { value } }) => onChange(value)}
    className="block shadow appearance-none w-full bg-white border border-gray-dark text-gray-darker py-6 px-4 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray"
    value={selected}
  >
    {!selected && <option>Choose category</option>}
    {categories.map(({ _id, label }, i) => (
      <option key={i} value={_id}>
        {label}
      </option>
    ))}
  </select>
))

export default CategorySelect

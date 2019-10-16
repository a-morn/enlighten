import React, { memo } from "react";

const CategoryPicker = memo(({ categories, onSelect, selected }) => (
  <select
    onChange={({ target: { value } }) => onSelect(value)}
    className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
  >
    {!selected && <option>Choose category</option>}
    {categories.map(({ id, label }, i) => (
      <option key={i} value={id}>
        {label}
      </option>
    ))}
  </select>
));

export default CategoryPicker;

import React, { Fragment, useState, useEffect } from 'react'
import CategorySelect from './category-select'
import useWhyDidYouUpdate from 'hooks/debug/why-did-you-update'

function CategoryPicker({
  category,
  setCategory,
  className,
  buttonLabel,
  onClick,
  onChange,
  disabledCategories = [],
  isNameUsed = false,
  autoPick = false,
}) {
  useWhyDidYouUpdate('CP', {
    category,
    setCategory,
    className,
    buttonLabel,
    onClick,
    onChange,
    disabledCategories,
    isNameUsed,
    autoPick,
  })
  const [categories, setCategories] = useState([])
  const [name, setName] = useState()

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(
        `${process.env.REACT_APP_BFF_PROTOCOL}${process.env.REACT_APP_BFF_URL}/categories`,
      )
      const result = await response.json()
      setCategories(result)
      if (autoPick && result.length) {
        setCategory(category => category || result[0].id)
      }
    }
    fetchData()
  }, [autoPick, category, setCategory])

  useEffect(() => {})

  let buttonClasses =
    'bg-blue-500 text-white font-bold py-6 md:py-4 px-4 rounded whitespace-no-wrap'

  const disabled =
    disabledCategories.some(c => c === category) ||
    !category ||
    (isNameUsed && !name)

  if (disabled) {
    buttonClasses += ' opacity-50 cursor-not-allowed'
  } else {
    buttonClasses += ' hover:bg-blue-700'
  }
  return (
    <div className={`flex flex-col md:flex-row justify-center ${className}`}>
      {isNameUsed && (
        <Fragment>
          <input
            className="shadow appearance-none border rounded w-full py-6 px-3 text-gray-700 leading-tight focus:outline-none"
            placeholder="Enter your name"
            onChange={({ target: { value: name } }) => setName(name)}
          />
        </Fragment>
      )}
      <CategorySelect
        onChange={category => {
          if (onChange) {
            onChange(category)
          }
          setCategory(category)
        }}
        categories={categories}
        selected={category}
      />
      <button
        disabled={disabled}
        onClick={() => onClick(name)}
        className={buttonClasses}
      >
        {buttonLabel}
      </button>
    </div>
  )
}

export default CategoryPicker

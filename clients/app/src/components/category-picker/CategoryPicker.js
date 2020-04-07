import React, { Fragment, useState, useEffect } from 'react'
import CategorySelect from './category-select'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'

export const GET_CATEGORIES = gql`
  query {
    categories {
      id
      label
    }
  }
`

export function CategoryPicker({
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
  const { data } = useQuery(GET_CATEGORIES)

  const [name, setName] = useState()

  useEffect(() => {
    if (autoPick && data && data.categories.length) {
      setCategory(category => category || data.categories[0].id)
    }
  }, [autoPick, data, setCategory])

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
      {data && (
        <>
          <CategorySelect
            onChange={category => {
              if (onChange) {
                onChange(category)
              }
              setCategory(category)
            }}
            categories={data.categories}
            selected={category}
          />
          <button
            disabled={disabled}
            onClick={() => onClick(name)}
            className={buttonClasses}
          >
            {buttonLabel}
          </button>
        </>
      )}
    </div>
  )
}

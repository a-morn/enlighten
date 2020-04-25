import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import React, { Fragment, useEffect, useState } from 'react'
import CategorySelect from './category-select'

export const GET_CATEGORIES = gql`
  query Categories {
    categories {
      id
      label
    }
  }
`

export function CategoryPicker({
  categoryId,
  setCategoryId,
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
      setCategoryId(categoryId => categoryId || data.categories[0].id)
    }
  }, [autoPick, data, setCategoryId])

  let buttonClasses =
    'bg-cta-dark text-white font-bold py-6 md:py-4 px-4 rounded whitespace-no-wrap'

  const disabled =
    disabledCategories.some(c => c === categoryId) ||
    !categoryId ||
    (isNameUsed && !name)

  if (disabled) {
    buttonClasses += ' opacity-50 cursor-not-allowed'
  } else {
    buttonClasses += ' hover:bg-black'
  }
  return (
    <div className={`flex flex-col md:flex-row justify-center ${className}`}>
      {isNameUsed && (
        <Fragment>
          <input
            className="shadow appearance-none border rounded w-full py-6 px-3 text-gray-darker leading-tight focus:outline-none"
            placeholder="Enter your name"
            onChange={({ target: { value: name } }) => setName(name)}
          />
        </Fragment>
      )}
      {data && (
        <>
          <CategorySelect
            onChange={categoryId => {
              if (onChange) {
                onChange(categoryId)
              }
              setCategoryId(categoryId)
            }}
            categories={data.categories}
            selected={categoryId}
          />
          <button
            data-testid="start-game-button"
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

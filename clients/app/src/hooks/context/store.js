import React, { createContext, useReducer } from 'react'

const initialState = {}
const store = createContext(initialState)
const { Provider } = store

const StateProvider = ({ children }) => {
  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'category-background-updated': {
        const newState = {
          categoryBackground: action.url,
        } // do something with the action
        return newState
      }
      default:
        throw new Error()
    }
  }, initialState)

  return <Provider value={{ state, dispatch }}>{children}</Provider>
}

export { store, StateProvider }

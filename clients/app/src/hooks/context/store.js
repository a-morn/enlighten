import React, { createContext, useReducer } from 'react'

const initialState = {}
const store = createContext(initialState)
const { Provider } = store

const StateProvider = ({ children }) => {
  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'category-background-updated': {
        const newState = {
          ...state,
          background: action.background,
        }
        return newState
      }
      case 'player-id-updated': {
        const newState = {
          ...state,
          playerId: action.playerId,
        }
        return newState
      }
      case 'token-updated': {
        const newState = {
          ...state,
          token: action.token,
        }
        return newState
      }
      case 'has-client-updated': {
        const newState = {
          ...state,
          hasClient: action.hasClient,
        }
        return newState
      }
      default:
        throw new Error()
    }
  }, initialState)

  return <Provider value={{ state, dispatch }}>{children}</Provider>
}

export { store, StateProvider }

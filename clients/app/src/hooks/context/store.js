import React, { createContext, useReducer } from 'react'

const initialState = {}
const store = createContext(initialState)
const { Provider } = store

const StateProvider = ({ children }) => {
  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'category-background-updated': {
        const { background } = action
        const newState = {
          ...state,
          background,
        }
        return newState
      }
      case 'player-id-updated': {
        const { playerId } = action
        const newState = {
          ...state,
          playerId,
        }
        return newState
      }
      case 'token-updated': {
        const { token } = action
        const newState = {
          ...state,
          token,
        }
        return newState
      }
      case 'is-temp-user-updated': {
        const { isTempUser } = action
        const newState = {
          ...state,
          isTempUser,
        }
        return newState
      }
      case 'profile-picture-url-updated': {
        const { profilePictureUrl } = action
        const newState = {
          ...state,
          profilePictureUrl,
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

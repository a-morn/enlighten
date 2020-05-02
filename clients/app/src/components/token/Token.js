import React, { useContext, useEffect } from 'react'
import { store } from 'hooks/context/store.js'
import { getPayloadFromJwt } from 'utils'

function Token({ children }) {
  const {
    state: { token, isTempUser },
    dispatch,
  } = useContext(store)

  useEffect(() => {
    if (!token) {
      const storedToken = sessionStorage.getItem('token')
      if (storedToken) {
        const { playerId, isTempUser, email } = getPayloadFromJwt(storedToken)
        dispatch({ type: 'token-updated', token: storedToken })
        dispatch({
          type: 'player-id-updated',
          playerId,
        })
        dispatch({
          type: 'is-temp-user-updated',
          isTempUser,
        })
        dispatch({
          type: 'player-email',
          playerEmail: email,
        })
      } else {
        dispatch({ type: 'token-updated', token: null })
      }
    } else {
      async function fetchMe() {
        const response = await fetch(
          `${process.env.REACT_APP_BFF_PROTOCOL}${process.env.REACT_APP_BFF_URL}/me`,
          { headers: new Headers({ authorization: `Bearer ${token}` }) },
        )
        const { profilePictureUrl } = await response.json()
        dispatch({
          type: 'profile-picture-url-updated',
          profilePictureUrl,
        })
      }
      if (token && !isTempUser) {
        fetchMe()
      }
    }
  }, [token, isTempUser, dispatch])

  return <>{children}</>
}

export default Token

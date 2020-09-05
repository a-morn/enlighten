import { store } from 'hooks/context/store.js'
import React, { useEffect, useCallback, useContext } from 'react'
import { useParams, withRouter } from 'react-router-dom'
import { getPayloadFromJwt } from 'utils'

function Login({ history }) {
  const { dispatch } = useContext(store)
  const { platform } = useParams()
  const onCallbackComplete = useCallback(
    async response => {
      if (response.ok) {
        const { token } = await response.json()
        if (token) {
          sessionStorage.setItem('token', token)
          const { playerId, isTempUser, email } = getPayloadFromJwt(token)
          dispatch({
            type: 'player-id-updated',
            playerId,
          })
          dispatch({ type: 'token-updated', token })
          dispatch({
            type: 'is-temp-user-updated',
            isTempUser,
          })
          dispatch({
            type: 'player-email',
            playerEmail: email,
          })
        }
      }
      history.push('/')
    },
    [history, dispatch],
  )

  const googleCallback = useCallback(
    async tokenId => {
      const googleCallbackUrl = `${process.env.REACT_APP_BFF_PROTOCOL}${process.env.REACT_APP_BFF_URL}/callback-google`
      const response = await fetch(googleCallbackUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokenId }),
      })
      onCallbackComplete(response)
    },
    [onCallbackComplete],
  )

  const githubCallback = useCallback(
    async function(code) {
      const githubCallbackUrl = `${process.env.REACT_APP_BFF_PROTOCOL}${process.env.REACT_APP_BFF_URL}/callback-github`
      const response = await fetch(githubCallbackUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })
      onCallbackComplete(response)
    },
    [onCallbackComplete],
  )

  useEffect(() => {
    const handleCallback = async function() {
      switch (platform) {
        case 'github': {
          const code = new URLSearchParams(window.location.search).get('code')
          if (code) {
            await githubCallback(code)
          } else {
            // todo: log
            history.push('/')
          }
          break
        }
        case 'google': {
          const idToken = new URLSearchParams(window.location.hash).get(
            'id_token',
          )
          if (idToken) {
            await googleCallback(idToken)
          } else {
            // todo: log
            history.push('/')
          }
          break
        }
        default: {
          // todo: log
          history.push('/')
          break
        }
      }
    }
    handleCallback()
  }, [googleCallback, githubCallback, history, platform])

  return <span className="m-auto">Logging in...</span>
}

export default withRouter(Login)

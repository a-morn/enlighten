import React, { useEffect, useState, useCallback, useContext } from 'react'
import { withRouter } from 'react-router-dom'
import githubLogo from 'assets/GitHub-Mark-64px.png'
import FullscreenModal from 'components/fullscreen-modal'
import { store } from 'hooks/context/store.js'
import { getPayloadFromJwt } from 'utils'

function Login({ history, className }) {
  const { dispatch } = useContext(store)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isLogginIn, setIsLogginIn] = useState(false)
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code')
    async function loginFlow() {
      if (code && !isLogginIn) {
        setIsLogginIn(true)
        await callback()
        setIsLogginIn(false)
      }
      async function callback() {
        const response = await fetch(
          `${process.env.REACT_APP_BFF_PROTOCOL}${process.env.REACT_APP_BFF_URL}/callback-github`,
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          },
        )

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
        history.push('./')
      }
    }
    loginFlow()
  })

  const setIsLoginModalOpenCallback = useCallback(
    isOpen => setIsLoginModalOpen(isOpen),
    [],
  )

  return (
    <div className={className}>
      <button onClick={setIsLoginModalOpenCallback}>Login</button>
      {isLoginModalOpen && (
        <FullscreenModal
          className="text-black"
          data-testid="opponent-left-modal"
          title="Sign in"
          body="Sign in to track your progress, get a personalized experience, and climb the rankings"
          onDecline={() => setIsLoginModalOpenCallback(false)}
        >
          <a
            className="border-2 border-double py-4 px-6 rounded"
            type="button"
            href={`https://github.com/login/oauth/authorize?client_id=${process.env.REACT_APP_GITHUB_OAUTH_CLIENT_ID}&scope=user`}
          >
            <img alt="" className="m-auto" src={githubLogo} />
          </a>
        </FullscreenModal>
      )}
    </div>
  )
}

export default withRouter(Login)

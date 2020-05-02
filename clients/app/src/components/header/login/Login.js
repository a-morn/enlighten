import React, { useEffect, useState, useCallback, useContext } from 'react'
import { withRouter } from 'react-router-dom'
import githubLogo from 'assets/GitHub-Mark-64px.png'
import googleLogo from 'assets/google-icon-64px.png'
import FullscreenModal from 'components/fullscreen-modal'
import { store } from 'hooks/context/store.js'
import { getPayloadFromJwt } from 'utils'
import { GoogleLogin } from 'react-google-login'

function Login({ history, className }) {
  const { dispatch } = useContext(store)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
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
      history.push('./')
    },
    [history, dispatch],
  )

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code')
    const platform = new URLSearchParams(window.location.search).get('platform')

    async function githubLoginFlow() {
      if (code && platform === 'github' && !isLoggingIn) {
        setIsLoggingIn(true)
        await githubCallback()
        setIsLoggingIn(false)
      }
      async function githubCallback() {
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
      }
    }
    githubLoginFlow()
  })

  const sendIdTokenGoogle = useCallback(
    async ({ tokenId, profileObj: { email, imageUrl: profilePictureUrl } }) => {
      const googleCallbackUrl = `${process.env.REACT_APP_BFF_PROTOCOL}${process.env.REACT_APP_BFF_URL}/callback-google`
      const response = await fetch(googleCallbackUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokenId, email, profilePictureUrl }),
      })
      onCallbackComplete(response)
    },
    [onCallbackComplete],
  )

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
            className="border-2 border-double py-4 px-6 rounded border-b-0"
            type="button"
            href={`https://github.com/login/oauth/authorize?client_id=${process.env.REACT_APP_GITHUB_OAUTH_CLIENT_ID}&scope=user`}
          >
            <img alt="" className="m-auto" src={githubLogo} />
          </a>
          <GoogleLogin
            clientId={process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID}
            onSuccess={sendIdTokenGoogle}
            uxMode="redirect"
            onFailure={foo => {
              // todo: log
            }}
            cookiePolicy={'single_host_origin'}
            render={renderProps => (
              <button
                className="border-2 border-double py-4 px-6 rounded"
                onClick={renderProps.onClick}
                disabled={renderProps.disabled}
              >
                <img alt="" className="m-auto" src={googleLogo} />
              </button>
            )}
          />
          ,
        </FullscreenModal>
      )}
    </div>
  )
}

export default withRouter(Login)

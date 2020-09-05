import githubLogo from 'assets/GitHub-Mark-64px.png'
import googleLogo from 'assets/google-icon-64px.png'
import FullscreenModal from 'components/fullscreen-modal'
import React, { useState, useCallback } from 'react'
import { withRouter } from 'react-router-dom'

function Login({ className }) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  const setIsLoginModalOpenCallback = useCallback(
    isOpen => setIsLoginModalOpen(isOpen),
    [],
  )

  const githubUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.REACT_APP_GITHUB_OAUTH_CLIENT_ID}&scope=user`

  const googleUrl = encodeURI(
    `https://accounts.google.com/signin/oauth/oauthchooseaccount?redirect_uri=${process.env.REACT_APP_GOOGLE_OATH_REDIRECT_URI}&response_type=permission id_token&scope=email profile openid&openid.realm&client_id=${process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID}&prompt&fetch_basic_profile=true&gsiwebsdk=2&o2v=1&as=DfjCjE7bpUimEdp6QFqIKg&flowName=GeneralOAuthFlow`,
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
            href={githubUrl}
          >
            <img alt="" className="m-auto" src={githubLogo} />
          </a>
          <a
            className="border-2 border-double py-4 px-6 rounded"
            type="button"
            href={googleUrl}
          >
            <img alt="" className="m-auto" src={googleLogo} />
          </a>
        </FullscreenModal>
      )}
    </div>
  )
}

export default withRouter(Login)

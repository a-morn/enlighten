import React, { useCallback, useState, useContext } from 'react'
import { Link, withRouter } from 'react-router-dom'
import EnlightenLogo from 'assets/enlighten-logo.svg'
import styles from './Header.module.scss'
import Login from './login'
import { store } from 'hooks/context/store.js'

function Header({ history }) {
  const [open, setOpen] = useState()
  const {
    state: { token, isTempUser, profilePictureUrl },
    dispatch,
  } = useContext(store)
  history.listen(() => setOpen(false))
  const onClick = useCallback(() => setOpen(open => !open), [])
  const logout = useCallback(() => {
    sessionStorage.removeItem('token', undefined)
    dispatch({ type: 'token-updated', token: undefined })
    dispatch({
      type: 'player-id-updated',
      playerId: undefined,
    })
    dispatch({
      type: 'is-temp-user-updated',
      isTempUser: undefined,
    })
    dispatch({
      type: 'profile-picture-url-updated',
      profilePictureUrl: undefined,
    })
  }, [dispatch])

  return (
    <nav
      className={`${styles.header} block bg-brand-light items-center justify-between flex-wrap brand p-6`}
    >
      <div className="flex items-center justify-between flex-wrap ">
        <Link to="/">
          <div className="flex items-center flex-shrink-0 text-brand mr-6">
            <img className="h-8" src={EnlightenLogo} alt="Enlighten logo" />
          </div>
        </Link>
        <div className="block lg:hidden">
          <button
            data-testid="open-menu-button"
            onClick={onClick}
            className="flex items-center px-3 py-2 border rounded text-brand border-brand-light hover:text-brand-light hover:border-white"
          >
            <svg
              className="fill-current h-3 w-3"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Menu</title>
              <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
            </svg>
          </button>
        </div>
        <div
          className={`${
            open ? 'block' : 'hidden'
          } w-full block flex-grow lg:flex lg:items-center lg:w-auto`}
        >
          <div className="text-sm lg:flex-grow">
            <Link
              data-testid="singleplayer-menu-option"
              to="/singleplayer"
              className="block mt-4 lg:inline-block lg:mt-0 text-brand hover:text-brand-light mr-4"
            >
              Singleplayer
            </Link>
            <Link
              data-testid="multiplayer-menu-option"
              to="/lobby"
              className="block mt-4 lg:inline-block lg:mt-0 text-brand hover:text-brand-light mr-4"
            >
              Multiplayer
            </Link>
            {(!token || isTempUser) && (
              <Login className="block mt-4 lg:inline-block lg:mt-0 text-brand hover:text-brand-light mr-4" />
            )}
            {token && !isTempUser && (
              <button
                className="block mt-4 lg:inline-block lg:mt-0 text-brand hover:text-brand-light mr-4"
                onClick={logout}
              >
                Logout
              </button>
            )}
            <Link to="/profile">
              {profilePictureUrl && (
                <img
                  className="h-8 w-8 rounded-full block mt-4 lg:inline-block lg:mt-0 mr-4"
                  src={profilePictureUrl}
                  alt=""
                />
              )}
            </Link>
          </div>
          <div>
            <Link
              data-testid="about-menu-option"
              to="/about"
              href="#"
              className="block mt-4 lg:inline-block lg:mt-0 text-brand hover:text-brand-light mr-4"
            >
              About
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default withRouter(Header)

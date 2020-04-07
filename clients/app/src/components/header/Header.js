import React, { useCallback, useState } from 'react'
import { Link, withRouter } from 'react-router-dom'

function Header({ history }) {
  const [open, setOpen] = useState()
  history.listen(() => setOpen(false))
  const onClick = useCallback(() => setOpen(open => !open), [])
  return (
    <nav className="flex items-center justify-between flex-wrap bg-teal-500 p-6">
      <Link to="/">
        <div className="flex items-center flex-shrink-0 text-white mr-6 ">
          <span className="font-semibold text-xl tracking-tight">Quiz App</span>
        </div>
      </Link>
      <div className="block lg:hidden">
        <button
          onClick={onClick}
          className="flex items-center px-3 py-2 border rounded text-teal-300 border-teal-light hover:text-white hover:border-white"
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
            to="/"
            className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4"
          >
            Singleplayer
          </Link>
          <Link
            to="lobby"
            className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4"
          >
            Multiplayer
          </Link>
        </div>
        <div>
          <Link
            to="/about"
            href="#"
            className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0"
          >
            About
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default withRouter(Header)

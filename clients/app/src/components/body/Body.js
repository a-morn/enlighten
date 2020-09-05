import Bowser from 'bowser'
import { store } from 'hooks/context/store.js'
import * as R from 'ramda'
import React, { useContext } from 'react'

const browser = Bowser.getParser(window.navigator.userAgent)

function Body({ children }) {
  const { base64, url } = R.pathOr(
    {},
    ['state', 'background'],
    useContext(store),
  )

  return (
    <div
      className={`p-6 max-w-full flex-grow bg-brand relative justify-center ${
        browser.getBrowserName() !== 'Safari' ? 'flex' : ''
      }`}
    >
      <div className="absolute overflow-hidden top-0 right-0 left-0 bottom-0">
        {(base64 || url) && (
          <img
            alt=""
            src={base64}
            data-srcset={`${process.env.REACT_APP_ASSETS_URL}${url}`}
            className="lazyload absolute w-100"
            style={{
              top: '50%',
              left: '50%',
              width: 'auto',
              height: 'auto',
              maxHeight: 'none',
              maxWidth: 'none',
              minHeight: '100%',
              minWidth: '100%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}
      </div>
      <div className="relative m-auto">{children}</div>
    </div>
  )
}

export default Body

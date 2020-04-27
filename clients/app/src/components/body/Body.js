import React, { useContext } from 'react'
import { store } from '../../hooks/context/store.js'

function Body({ children }) {
  const {
    state: { categoryBackground },
  } = useContext(store)
  const backgroundStyle = categoryBackground
    ? { backgroundImage: `url(${categoryBackground})`, backgroundSize: 'cover' }
    : {}

  return (
    <div className="p-6 max-w-full flex-grow bg-brand" style={backgroundStyle}>
      {children}
    </div>
  )
}

export default Body

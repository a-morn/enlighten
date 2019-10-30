import React, { useState } from 'react'

const SessionContext = React.createContext([{}, () => {}])

const SessionProvider = ({ children }) => {
  const [state, setState] = useState({})

  return (
    <SessionContext.Provider value={[state, setState]}>
      {children}
    </SessionContext.Provider>
  )
}

export { SessionContext, SessionProvider }

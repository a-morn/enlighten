import React, { StrictMode, Fragment } from 'react'
import Singleplayer from '../singleplayer'
import LobbyLogin from '../lobby-login'
import Header from '../header'
import About from '../about'
import Multiplayer from '../multiplayer'
import { SessionProvider } from 'hooks/context/session'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

function App() {
  return (
    <StrictMode>
      <div className="h-screen flex flex-col bg-gray-100">
        <Router>
          <Header />
          <Switch>
            <div className="m:p-6 md:m-auto max-w-full">
              <section className="p-8">
                <SessionProvider>
                  <Route path="/(|singleplayer)/">
                    <Singleplayer />
                  </Route>
                  <Route path="/lobby/:category?">
                    <LobbyLogin />
                  </Route>
                  <Route path="/multiplayer/:gameId/:playerId">
                    <Multiplayer />
                  </Route>
                </SessionProvider>
                <Route path="/about">
                  <About />
                </Route>
              </section>
            </div>
          </Switch>
        </Router>
      </div>
    </StrictMode>
  )
}

export default App

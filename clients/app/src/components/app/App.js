import React, { StrictMode } from 'react'
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
          <div className="m:p-6 md:m-auto max-w-full">
            <section className="p-8">
              <SessionProvider>
                <Switch>
                  <Route path="/(|singleplayer)/">
                    <Singleplayer />
                  </Route>
                  <Route path="/lobby/:category?">
                    <LobbyLogin />
                  </Route>
                  <Route path="/multiplayer/:gameId/:playerId">
                    <Multiplayer />
                  </Route>
                  <Route path="/about">
                    <About />
                  </Route>
                </Switch>
              </SessionProvider>
            </section>
          </div>
        </Router>
      </div>
    </StrictMode>
  )
}

export default App

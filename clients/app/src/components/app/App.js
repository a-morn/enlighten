import React, { StrictMode, Fragment } from 'react'
import Singleplayer from '../singleplayer'
import Lobby from '../lobby'
import Header from '../header'
import About from '../about'
import Multiplayer from '../multiplayer'
import { SessionProvider } from 'hooks/context/session'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

function App() {
  return (
    <StrictMode>
      <div className="h-screen flex flex-col">
        <Router>
          <Header />
          <Switch>
            <Fragment>
              <section className="m-auto w-1/2">
                <SessionProvider>
                  <Route path="/(|singleplayer)/">
                    <Singleplayer />
                  </Route>
                  <Route path="/lobby/:category?">
                    <Lobby />
                  </Route>
                  <Route path="/multiplayer/:gameId/:playerId">
                    <Multiplayer />
                  </Route>
                </SessionProvider>
                <Route path="/about">
                  <About />
                </Route>
              </section>
            </Fragment>
          </Switch>
        </Router>
      </div>
    </StrictMode>
  )
}

export default App

import React, { StrictMode } from 'react'
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom'
import { SessionProvider } from '../../hooks/context/session'
import { StateProvider } from '../../hooks/context/store.js'
import About from '../about'
import Body from '../body'
import Header from '../header'
import LandingPage from '../landing-page'
import { LobbyLoginComponent } from '../lobby-login'
import Multiplayer from '../multiplayer'
import Page404 from '../page-404'
import Singleplayer from '../singleplayer'
import WSRoute from '../ws-route'

function App() {
  return (
    <StrictMode>
      <StateProvider>
        <div className="h-screen flex flex-col bg-gray-100">
          <Router>
            <SessionProvider>
              <Header />
              <Body>
                <section className="flex h-full justify-center items-center">
                  <Switch>
                    <Route exact path="/(|index.html|landingpage)/">
                      <LandingPage />
                    </Route>
                    <Route path="/about">
                      <About />
                    </Route>
                    <Route path="/singleplayer">
                      <WSRoute>
                        <Singleplayer />
                      </WSRoute>
                    </Route>
                    <Route path="/lobby/:categoryId?">
                      <WSRoute>
                        <LobbyLoginComponent />
                      </WSRoute>
                    </Route>
                    <Route path="/multiplayer/:gameId/:playerId">
                      <WSRoute>
                        <Multiplayer />
                      </WSRoute>
                    </Route>
                    <Route>
                      <Page404 />
                    </Route>
                  </Switch>
                </section>
              </Body>
              <footer className="text-center p-16 w-100 bg-gray-darkest text-gray-light">
                © 2020 Mörner Industries
              </footer>
            </SessionProvider>
          </Router>
        </div>
      </StateProvider>
    </StrictMode>
  )
}

export default App

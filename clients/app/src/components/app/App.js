import About from 'components/about'
import ApolloRoute from 'components/apollo-route'
import Body from 'components/body'
import Callback from 'components/callback'
import Header from 'components/header'
import LandingPage from 'components/landing-page'
import Lobby from 'components/lobby'
import Multiplayer from 'components/multiplayer'
import Page404 from 'components/page-404'
import Profile from 'components/profile'
import Singleplayer from 'components/singleplayer'
import Token from 'components/token'
import { SessionProvider } from 'hooks/context/session'
import { StateProvider } from 'hooks/context/store.js'
import React, { StrictMode } from 'react'
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom'

function App() {
  return (
    <StrictMode>
      <StateProvider>
        <div className="h-screen flex flex-col bg-gray-100">
          <Router>
            <SessionProvider>
              <Token>
                {' '}
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
                      <Route path="/singleplayer/:categoryId?">
                        <ApolloRoute>
                          <Singleplayer />
                        </ApolloRoute>
                      </Route>
                      <Route path="/lobby/:categoryId?">
                        <ApolloRoute>
                          <Lobby />
                        </ApolloRoute>
                      </Route>
                      <Route path="/multiplayer">
                        <ApolloRoute>
                          <Multiplayer />
                        </ApolloRoute>
                      </Route>
                      <Route path="/profile">
                        <ApolloRoute>
                          <Profile />
                        </ApolloRoute>
                      </Route>
                      <Route path="/callback/:platform">
                        <Callback />
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
              </Token>
            </SessionProvider>
          </Router>
        </div>
      </StateProvider>
    </StrictMode>
  )
}

export default App

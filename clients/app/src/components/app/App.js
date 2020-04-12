import { ApolloProvider } from '@apollo/react-common'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloClient } from 'apollo-client'
import { ApolloLink, split } from 'apollo-link'
import { onError } from 'apollo-link-error'
import { HttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import { SessionProvider } from '../../hooks/context/session'
import React, { StrictMode } from 'react'
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom'
import { StateProvider } from '../../hooks/context/store.js'
import About from '../about'
import Body from '../body'
import Header from '../header'
import LandingPage from '../landing-page'
import { LobbyLoginComponent } from '../lobby-login'
import Multiplayer from '../multiplayer'
import Page404 from '../page-404'
import Singleplayer from '../singleplayer'

let playerId = sessionStorage.getItem('playerId')
if (!playerId) sessionStorage.setItem('playerId', '' + Math.random())
playerId = sessionStorage.getItem('playerId')

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      ),
    )

  if (networkError)
    console.log(
      `[Network error]: ${networkError}. Maybe we should display some type of message to the user 🤔`,
    )
})

const httpLink = new HttpLink({
  uri: `${process.env.REACT_APP_BFF_PROTOCOL}${process.env.REACT_APP_BFF_URL}/graphql`,
  headers: {
    authorization: playerId,
  },
})

const wsLink = new WebSocketLink({
  uri: `${process.env.REACT_APP_BFF_WS_PROTOCOL}${process.env.REACT_APP_BFF_URL}/graphql`,
  options: {
    reconnect: true,
    connectionParams: { playerId },
  },
})

const terminatingLink = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink,
  httpLink,
)

const link = errorLink.concat(ApolloLink.from([terminatingLink]))

const cache = new InMemoryCache()

const client = new ApolloClient({
  link,
  cache,
})

function App() {
  return (
    <StrictMode>
      <ApolloProvider client={client}>
        <StateProvider>
          <div className="h-screen flex flex-col bg-gray-100">
            <Router>
              <SessionProvider>
                <Header />
                <Body>
                  <section className="flex h-full justify-center">
                    <Switch>
                      <Route exact path="/(|index.html|landingpage)/">
                        <LandingPage />
                      </Route>
                      <Route path="/singleplayer/">
                        <Singleplayer playerId={playerId} />
                      </Route>
                      <Route path="/lobby/:category?">
                        <LobbyLoginComponent playerId={playerId} />
                      </Route>
                      <Route path="/multiplayer/:gameId/:playerId">
                        <Multiplayer playerId={playerId} />
                      </Route>
                      <Route path="/about">
                        <About />
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
      </ApolloProvider>
    </StrictMode>
  )
}

export default App

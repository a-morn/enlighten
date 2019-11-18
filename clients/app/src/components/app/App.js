import React, { StrictMode } from 'react'
import Singleplayer from '../singleplayer'
import LobbyLogin from '../lobby-login'
import Header from '../header'
import About from '../about'
import Multiplayer from '../multiplayer'
import { SessionProvider } from 'hooks/context/session'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-client'
import { getMainDefinition } from 'apollo-utilities'
import { ApolloLink, split } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { InMemoryCache } from 'apollo-cache-inmemory'

let playerId = sessionStorage.getItem('playerId')
if (!playerId) sessionStorage.setItem('playerId', '' + Math.random())
playerId = sessionStorage.getItem('playerId')

const httpLink = new HttpLink({
  uri: 'http://localhost:3000/graphql',
  headers: {
    authorization: playerId,
  },
})

const wsLink = new WebSocketLink({
  uri: `ws://localhost:3000/graphql`,
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

const link = ApolloLink.from([terminatingLink])

const cache = new InMemoryCache()

const client = new ApolloClient({
  link,
  cache,
})

function App() {
  return (
    <StrictMode>
      <ApolloProvider client={client}>
        <div className="h-screen flex flex-col bg-gray-100">
          <Router>
            <Header />
            <div className="m:p-6 md:m-auto max-w-full">
              <section className="p-8">
                <SessionProvider>
                  <Switch>
                    <Route path="/(|singleplayer)/">
                      <Singleplayer playerId={playerId} />
                    </Route>
                    <Route path="/lobby/:category?">
                      <LobbyLogin playerId={playerId} />
                    </Route>
                    <Route path="/multiplayer/:gameId/:playerId">
                      <Multiplayer playerId={playerId} />
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
      </ApolloProvider>
    </StrictMode>
  )
}

export default App

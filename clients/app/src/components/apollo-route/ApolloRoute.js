import { ApolloProvider } from '@apollo/react-common'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloClient } from 'apollo-client'
import { ApolloLink, split } from 'apollo-link'
import { setContext } from 'apollo-link-context'
import { onError } from 'apollo-link-error'
import { HttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import { store } from 'hooks/context/store.js'
import React, { useEffect, useContext, useState } from 'react'
import { getPayloadFromJwt } from 'utils'

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations, path }) =>
      //eslint-disable-next-line no-console
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      ),
    )

  if (networkError)
    //eslint-disable-next-line no-console
    console.log(
      `[Network error]: ${networkError}. Maybe we should display some type of message to the user 🤔`,
    )
})

const httpLink = new HttpLink({
  uri: `${process.env.REACT_APP_BFF_PROTOCOL}${process.env.REACT_APP_BFF_URL}/graphql`,
})

function ApolloRoute({ children }) {
  const {
    state: { token, playerId },
    dispatch,
  } = useContext(store)

  const [client, setClient] = useState(null)
  useEffect(() => {
    // if we have a token then setup graphql client using the token
    if (token) {
      const wsLink = new WebSocketLink({
        uri: `${process.env.REACT_APP_BFF_WS_PROTOCOL}${process.env.REACT_APP_BFF_URL}/graphql`,
        options: {
          reconnect: true,
          lazy: true,
          connectionParams: () => {
            return {
              headers: {
                authorization: token ? `Bearer ${token}` : '',
              },
            }
          },
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

      const authLink = setContext(
        (_, { headers }) =>
          new Promise(resolve => {
            resolve({
              headers: {
                ...headers,
                authorization: token ? `Bearer ${token}` : '',
              },
            })
          }),
      )

      const link = authLink.concat(
        errorLink.concat(ApolloLink.from([terminatingLink])),
      )

      const cache = new InMemoryCache()

      const client = new ApolloClient({
        link,
        cache,
      })
      setClient(client)
    } else {
      setClient(null)
    }
  }, [dispatch, token])

  // if user is not logged in, then log in with temp user
  useEffect(() => {
    async function handleToken() {
      if (token === null) {
        const response = await fetch(
          `${process.env.REACT_APP_BFF_PROTOCOL}${process.env.REACT_APP_BFF_URL}/login-temp-user`,
        )
        const { token } = await response.json()
        const { isTempUser, playerId } = getPayloadFromJwt(token)
        sessionStorage.setItem('token', token)
        dispatch({ type: 'token-updated', token })
        dispatch({ type: 'player-id-updated', playerId })
        dispatch({
          type: 'is-temp-user-updated',
          isTempUser,
        })
      }
    }
    handleToken()
  }, [token, playerId, dispatch])
  return (
    <>
      {client && <ApolloProvider client={client}>{children}</ApolloProvider>}
      {!client && <span className="m-auto">Loading...</span>}
    </>
  )
}

export default ApolloRoute

import * as http from 'http'
import { makeExecutableSchema } from 'apollo-server'
import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express'
import { Express } from 'express'
import resolvers from './resolvers/'
import typeDefs from './typeDefs'
import { Context } from './types'

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  resolverValidationOptions: { requireResolversForResolveType: false },
})

export default (app: Express, httpServer: http.Server): void => {
  const apolloServer = new ApolloServer({
    schema,
    context: ({
      req,
      connection,
    }: {
      req: { headers: { authorization: string } }
      connection: { context: unknown }
    }) => {
      if (req) {
        const playerId = req.headers.authorization
        return { currentUser: { playerId } }
      } else if (connection) {
        return connection.context
      } else {
        throw Error('Unknown connection type')
      }
    },
    subscriptions: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onConnect: ({ playerId }: any): Context => {
        return { currentUser: { playerId } }
      },
    },
  } as ApolloServerExpressConfig)

  apolloServer.applyMiddleware({ app, path: '/graphql' })
  apolloServer.installSubscriptionHandlers(httpServer)
}

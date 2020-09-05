import * as http from 'http'
import { makeExecutableSchema } from 'apollo-server'
import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express'
import { Context } from 'enlighten-common-types'
import { Express } from 'express'
import resolvers from './resolvers/'
import typeDefs from './typeDefs'
import { getJWTPayloadFromAuthorizationHeader } from './utils'

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  resolverValidationOptions: { requireResolversForResolveType: false },
})

export default async (app: Express, httpServer: http.Server): Promise<void> => {
  const apolloServer = new ApolloServer({
    schema,
    context: async ({
      req,
      connection,
    }: {
      req?: { headers: { authorization: string } }
      connection: { context: unknown }
    }) => {
      if (req) {
        const { playerId, isTempUser } = getJWTPayloadFromAuthorizationHeader(
          req.headers.authorization,
        )

        return { currentUser: { playerId, isTempUser } }
      } else if (connection) {
        return connection.context
      } else {
        throw Error('Unknown connection type')
      }
    },
    subscriptions: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onConnect: (req: object): Context => {
        //authorization
        const authorization = (req as { headers: { authorization: string } })
          .headers.authorization
        const { playerId, isTempUser } = getJWTPayloadFromAuthorizationHeader(
          authorization,
        )
        return { currentUser: { playerId, isTempUser } }
      },
    },
  } as ApolloServerExpressConfig)

  apolloServer.applyMiddleware({ app, path: '/graphql' })
  apolloServer.installSubscriptionHandlers(httpServer)
}

import * as http from 'http'
import { makeExecutableSchema } from 'apollo-server'
import {
  ApolloServer,
  ApolloServerExpressConfig,
  AuthenticationError,
} from 'apollo-server-express'
import { Express } from 'express'
import jwt from 'jsonwebtoken'
import resolvers from './resolvers/'
import typeDefs from './typeDefs'
import { Context, isUserToken, UserToken } from './types'

const getJWTPayloadFromAuthorizationHeader = (
  authHeader: string,
): UserToken => {
  const token = authHeader.split('Bearer ')[1]

  const decoded = jwt.verify(token, process.env.SECRET || 's3cr37')

  if (typeof decoded === 'string' || !isUserToken(decoded)) {
    throw new AuthenticationError('Incorrect token')
  }
  return decoded
}

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

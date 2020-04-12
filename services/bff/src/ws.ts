import typeDefs from './schema'
import resolvers from './resolvers'
import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express'
import * as http from 'http'
import { Express } from 'express'

export default (app: Express, httpServer: http.Server) => {
	const apolloServer = new ApolloServer({
		typeDefs,
		resolvers,
		context: ({ req, connection }: { req: { headers: { authorization: string } }, connection: { context: unknown } }) => {
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
			onConnect: ({ playerId }: any) => {
				return { currentUser: { playerId } }
			}
		}
	} as ApolloServerExpressConfig)

	apolloServer.applyMiddleware({ app, path: '/graphql' });

	// I wonder what went wrong here 🤔
	(apolloServer as any).installSubscriptionHandlers(httpServer)
}
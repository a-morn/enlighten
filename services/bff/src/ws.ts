import typeDefs from './schema'
import resolvers from './resolvers'
import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express'
import * as http from 'http'

type SubscriptionInput = {
	playerId: string
}

export default (app: any) => {
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

	apolloServer.applyMiddleware({ app, path: '/graphql' })

	const httpServer = http.createServer(app);
	// I wonder what went wrong here 🤔
	(apolloServer as any).installSubscriptionHandlers(httpServer)

	httpServer
		.listen({ port: process.env.WS_PORT })
}
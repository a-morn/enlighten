const ws = require('ws');
const http = require('http');
const { parse } = require('url');
const { makeExecutableSchema } = require('graphql-tools')
const {
  connectPlayerToWsSingleplayer,
  handleIncomingMessagesSingleplayer
} = require('./models/singleplayer');
const {
  connectPlayerToWsLobby,
  handleIncomingMessageLobby,
  connectPlayerToWsGame,
  handleIncomingMessageGame
} = require('./models/multiplayer');
const { PlayerNotFoundError, GameNotFoundError } = require('./errors');
const { SubscriptionServer } = require('subscriptions-transport-ws')
const { execute, subscribe } = require('graphql')
const typeDefs = require('./schema')
    const resolvers = require('./resolvers')
const { ApolloServer, gql } = require( 'apollo-server-express')
const { createServer } = require( 'http')

module.exports = app => {
	const apolloServer = new ApolloServer({
		typeDefs,
		resolvers,
		context: ({ req, connection }) => {
			if (req) {
				const playerId = req.headers.authorization
				return { currentUser: {playerId}}
			} else if (connection) {
				return connection.context
			} else {
				throw Error('Unknown connection type')
			}
		},
		subscriptions: {
			onConnect: (connectionParams) => {
				const { playerId } = connectionParams
				return { currentUser: { playerId } }
			}
		}
	})

	apolloServer.applyMiddleware({ app, path: '/graphql' })

	const httpServer = createServer(app)
	apolloServer.installSubscriptionHandlers(httpServer)

	httpServer
	.listen({ port: process.env.WS_PORT }, err => {
		if (err) {
			throw new Error(err)
		}
	})
}
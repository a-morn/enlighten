const { gql } = require('apollo-server-express')

const typeDefs = gql`
		type Query {
			gameSingleplayer: GameSingleplayer
			lobby: Lobby
			gameRequest: GameRequest
			gameMultiplayer: GameMultiplayer
			categories: [Category]
		}

		type Category {
			id: ID!
			label: String!
		}

		type Lobby {
			players: [Player]
			hasJoined: Boolean!
		}

		type Mutation {
			createGameSingleplayer(playerId: ID!, category: String!): GameSingleplayer
			deleteGameSingleplayer(id: ID!): GameSingleplayer
			answerQuestionSingleplayer(answerId: ID!, questionId: ID!): GameSingleplayer
			addPlayer(id: ID!): Player
			joinLobby(player: PlayerInput!): Player
			requestGame(gameRequest: GameRequestInput!): GameRequest
			answerGameRequest(id: ID!, accepted: Boolean): GameRequest
			answerQuestionMultiplayer(questionId: ID!, answerId: ID!): GameMultiplayer
			removePlayerFromGameMultiplayer(id: ID!): GameMultiplayer
			deleteGameRequest(id: ID!): GameRequest
		}

		type Subscription {
			gameSingleplayerSubscription: GameSingleplayerSubscription
			playerJoined: Player
			gameRequestSubscription(mutation: String): GameRequestSubscription
			gameMultiplayerSubscription(mutation: String): GameMultiplayerSubscription
		}

		type GameSingleplayerSubscription {
			mutation: String
			gameSingleplayer: GameSingleplayer!
		}

		type GameMultiplayerSubscription {
			mutation: String
			gameMultiplayer: GameMultiplayer!
		}

		type GameRequestSubscription {
			mutation: String
			gameRequest: GameRequest!
		}

		input PlayerInput {
			id: ID!
			name: String
			category: String
		}

		type Player {
			id: ID!
			name: String
			category: String
		}

		type PlayerMultiplayer {
			id: ID!
			name: String
			score: Int
			won: Boolean
			hasLeft: Boolean
		}
		type GameRequest {
			id: ID!
			category: String!
			playerRequestId: ID!
			playerRequestName: String!
			playerOfferedName: String!
			playerOfferedId: ID!
			accepted: Boolean
		}

		type Question {
			id: ID!
			type: String!
			alternatives: [QuestionAlternative!]
			text: String!
			src: String	
			answerId: ID
		} 

		type QuestionAlternative {
			type: String!
			text: String
			src: String
			id: ID!
		}

		type QuestionAnswer {
			id: ID!
			questionId: ID
			playerIds: [ID]
		}

		type GameSingleplayer {
			id: ID!
			category: String!
			categoryBackground: String!
			playerId: ID!
			currentQuestion: Question!
			lastQuestion: Question
		}

		type GameMultiplayer {
			id: ID!
			category: String!
			categoryBackground: String!
			players: [PlayerMultiplayer]
			currentQuestion: Question
			lastQuestion: Question
		}

		input GameRequestInput {
			category: String!
			playerRequestId: ID!
			playerOfferedId: ID!
		}
	`

module.exports = typeDefs

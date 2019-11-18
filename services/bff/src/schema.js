const { gql } = require( 'apollo-server-express')

	const typeDefs = gql`
		type Query {
			gameSingleplayer: GameSingleplayer
			lastAnswerSingleplayer: QuestionAnswer
			lobby: Lobby
			gameRequest: GameRequest
			gameMultiplayer: GameMultiplayer
			currentQuestionMultiplayer: Question
			lastAnswerMultiplayer: QuestionAnswer
			score: [PlayerMultiplayer]
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
			answerQuestionSingleplayer(answerId: ID!, questionId: ID!): QuestionAnswer
			addPlayer(id: ID!): Player
			joinLobby(player: PlayerInput!): Player
			requestGame(gameRequest: GameRequestInput!): GameRequest
			answerGameRequest(id: ID!, accepted: Boolean): GameRequest
			answerQuestionMultiplayer(questionId: ID!, answerId: ID!): QuestionAnswer
			deleteGameMultiplayer(id: ID!): GameMultiplayer
		}

		type Subscription {
			newQuestionSingleplayer: Question
			playerJoined: Player
			gameRequested: GameRequest
			gameRequestAnswered: GameRequest
			gameMultiplayer(mutation: String): GameMultiplayerSubscription
			newQuestionMultiplayer: Question
			newAnswerMultiplayer: QuestionAnswer
			scoreUpdated: [PlayerMultiplayer]
		}

		type GameMultiplayerSubscription {
			mutation: String!
			game: GameMultiplayer!
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
			category: String
			score: Int
			won: Boolean
		}
		type GameRequest {
			id: ID!
			category: String!
			playerRequestId: ID!
			playerRequestName: String!
			playerOfferedId: ID!
			accepted: Boolean
		}

		type Question {
			id: ID!
			type: String!
			alternatives: [QuestionAlternative!]
			text: String!
			src: String	
			playerId: ID
			answerId: ID!
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
			playerId: ID!
			currentQuestion: Question!
			lastQuestion: Question
		}

		type GameMultiplayer {
			id: ID!
			category: String!
			players: [PlayerMultiplayer]
		}

		input GameRequestInput {
			category: String!
			playerRequestId: ID!
			playerOfferedId: ID!
		}
	`

module.exports = typeDefs

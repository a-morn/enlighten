export default `
    type GameSingleplayer {
        categoryId: String!
        categoryBackground: String!
        playerId: ID!
        currentQuestion: Question
        lastQuestion: Question
    }

    extend type Query {
        gameSingleplayer: GameSingleplayer
    }

    input CreateGameSingleplayerInput {
        "The player that started the game"
        playerId: ID!
        "The category id of the game"
        categoryId: String!
    }

    type CreateGameSingleplayerResponse implements MutationResponse {
        code: String!
        success: Boolean!
        message: String!
        gameSingleplayer: GameSingleplayer
    }

    type DeleteGameSingleplayerResponse implements MutationResponse {
        code: String!
        success: Boolean!
        message: String!
        id: ID
    }

    input AnswerQuestionSingleplayerInput {
        answerId: ID!
        questionId: ID!
    }

    type AnswerQuestionSingleplayerResponse implements MutationResponse {
        code: String!
        success: Boolean!
        message: String!
        gameSingleplayer: GameSingleplayer!
    }

    extend type Mutation {
        createGameSingleplayer(game: CreateGameSingleplayerInput!): CreateGameSingleplayerResponse!
        deleteGameSingleplayer: DeleteGameSingleplayerResponse!
        answerQuestionSingleplayer(answer: AnswerQuestionSingleplayerInput!): AnswerQuestionSingleplayerResponse!
    }

    type GameSingleplayerSubscription implements SubscriptionPayload {
        mutation: String!
        gameSingleplayer: GameSingleplayer!
    }

    extend type Subscription {
        gameSingleplayerSubscription: GameSingleplayerSubscription
    }
`

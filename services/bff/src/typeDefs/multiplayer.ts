export default `
    type PlayerMultiplayer {
        id: ID!
        name: String
        score: Int
        won: Boolean
        hasLeft: Boolean
        profilePictureUrl: String
    }

    type GameMultiplayer {
        id: ID!
        categoryId: String!
        categoryName: String!
        categoryBackground: String!
        categoryBackgroundBase64: String!
        players: [PlayerMultiplayer]
        currentQuestion: Question
        lastQuestion: Question
        levels: [Level]
    }

    extend type Query {
        gameMultiplayer: GameMultiplayer
    } 

    input AnswerQuestionMultiplayerInput {
        questionId: ID!
        answerId: ID!
    }

    type AnswerQuestionMultiplayerResponse implements MutationResponse {
        code: String!
        success: Boolean!
        message: String!
        question: Question
    }

    input RemovePlayerFromGameMultiplayerInput {
        id: ID!
    }

    type RemovePlayerFromGameMultiplayerResponse implements MutationResponse {
        code: String!
        success: Boolean!
        message: String!
        gameMultiplayer: GameMultiplayer
    }

    type PingMultiplayerResponse implements MutationResponse {
        code: String!
        success: Boolean!
        message: String!
        playerMultiplayer: PlayerMultiplayer!
    }

    extend type Mutation {
        answerQuestionMultiplayer(answer: AnswerQuestionMultiplayerInput!): AnswerQuestionMultiplayerResponse!
        removePlayerFromGameMultiplayer(player: RemovePlayerFromGameMultiplayerInput!): RemovePlayerFromGameMultiplayerResponse!
        pingMultiplayer: PingMultiplayerResponse!
    }

    type GameMultiplayerSubscription {
        mutation: String!
        gameMultiplayer: GameMultiplayer
    }

    extend type Subscription {
        gameMultiplayerSubscription: GameMultiplayerSubscription
    }
`

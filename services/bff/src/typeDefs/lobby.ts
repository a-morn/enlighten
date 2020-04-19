export default `
    type GameRequest {
        id: ID!
        categoryId: String!
        playerRequestId: ID!
        playerRequestName: String!
        playerOfferedName: String!
        playerOfferedId: ID!
        accepted: Boolean
    }

    type Lobby {
        players: [LobbyPlayer]!
    }

    type LobbyPlayer {
        id: ID!
        name: String!
        categoryId: String!
    }

    extend type Query {
        lobby: Lobby
        gameRequest: GameRequest	
    }

    input JoinLobbyInput {
        id: ID!
        name: String!
        categoryId: String!
    }

    type JoinLobbyResponse implements MutationResponse {
        code: String!
        success: Boolean!
        message: String!
        player: LobbyPlayer!
    }

    type PingLobbyResponse implements MutationResponse {
        code: String!
        success: Boolean!
        message: String!
        player: LobbyPlayer!
    }

    input RequestGameInput {
        categoryId: String!
        playerRequestId: ID!
        playerOfferedId: ID!
    }

    type RequestGameResponse implements MutationResponse {
        code: String!
        success: Boolean!
        message: String!
        gameRequest: GameRequest!
    }

    input AnswerGameRequestInput {
        gameRequestId: ID!
        accepted: Boolean!
    }

    type AnswerGameRequestResponse implements MutationResponse {
        code: String!
        success: Boolean!
        message: String!
        gameRequest: GameRequest!
    }

    input DeleteGameRequestInput {
        gameRequestId: ID!
    }

    type DeleteGameRequestResponse implements MutationResponse {
        code: String!
        success: Boolean!
        message: String!
        gameRequest: GameRequest!
    }

    extend type Mutation {
        joinLobby(player: JoinLobbyInput!): JoinLobbyResponse!
        pingLobby: PingLobbyResponse!
        requestGame(gameRequest: RequestGameInput!): RequestGameResponse!
        answerGameRequest(answer: AnswerGameRequestInput!): AnswerGameRequestResponse!
        deleteGameRequest(gameRequest: DeleteGameRequestInput!): DeleteGameRequestResponse!
    }

    type GameRequestSubscription implements SubscriptionPayload {
        mutation: String!
        gameRequest: GameRequest!
    }

    type LobbyPlayerSubscription implements SubscriptionPayload {
        mutation: String!
        lobbyPlayer: LobbyPlayer!
    }

    extend type Subscription {
        lobbyPlayerSubscription: LobbyPlayerSubscription!
        gameRequestSubscription: GameRequestSubscription
    }
`

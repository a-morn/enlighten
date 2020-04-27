import gql from 'graphql-tag'

const PING_LOBBY = gql`
  mutation {
    pingLobby {
      success
    }
  }
`

const GAME_REQUEST = gql`
  query {
    gameRequest {
      id
      categoryId
      playerRequestId
      playerOfferedId
      playerRequestName
      playerOfferedName
      accepted
    }
  }
`

const REQUEST_GAME = gql`
  mutation($gameRequest: RequestGameInput!) {
    requestGame(gameRequest: $gameRequest) {
      success
    }
  }
`
const ANSWER_GAME_REQUEST = gql`
  mutation($answer: AnswerGameRequestInput!) {
    answerGameRequest(answer: $answer) {
      success
    }
  }
`

const DELETE_GAME_REQUEST = gql`
  mutation($gameRequest: DeleteGameRequestInput!) {
    deleteGameRequest(gameRequest: $gameRequest) {
      success
    }
  }
`

const GAME_REQUEST_SUBSCRIPTION = gql`
  subscription {
    gameRequestSubscription {
      gameRequest {
        id
        playerRequestName
        playerOfferedName
        playerRequestId
        playerOfferedId
        categoryId
        accepted
      }
      mutation
    }
  }
`

const LOBBY = gql`
  query {
    lobby {
      players {
        name
        id
        categoryId
      }
    }
  }
`
const JOIN_LOBBY = gql`
  mutation($player: JoinLobbyInput!) {
    joinLobby(player: $player) {
      success
    }
  }
`

const GAME = gql`
  query {
    gameMultiplayer {
      id
    }
  }
`

const GAME_SUBSCRIPTION = gql`
  subscription {
    gameMultiplayerSubscription {
      mutation
      gameMultiplayer {
        id
      }
    }
  }
`

export {
  GAME_SUBSCRIPTION,
  GAME,
  JOIN_LOBBY,
  LOBBY,
  GAME_REQUEST_SUBSCRIPTION,
  DELETE_GAME_REQUEST,
  REQUEST_GAME,
  GAME_REQUEST,
  PING_LOBBY,
  ANSWER_GAME_REQUEST,
}

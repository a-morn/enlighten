import gql from 'graphql-tag'

const GAME = gql`
  query {
    gameMultiplayer {
      id
      categoryBackground
      players {
        id
        score
        name
        won
        hasLeft
      }
      currentQuestion {
        id
        type
        text
        src
        tones
        answerId
        answered
        alternatives {
          id
          type
          text
          src
        }
      }
      lastQuestion {
        id
        answerId
      }
    }
  }
`

const REMOVE_PLAYER_FROM_GAME = gql`
  mutation($player: RemovePlayerFromGameMultiplayerInput!) {
    removePlayerFromGameMultiplayer(player: $player) {
      success
    }
  }
`

const PING_MULTIPLAYER = gql`
  mutation {
    pingMultiplayer {
      success
    }
  }
`

const GAME_UPDATED = gql`
  subscription {
    gameMultiplayerSubscription {
      mutation
      gameMultiplayer {
        id
        categoryBackground
        players {
          id
          score
          name
          won
          hasLeft
        }
        currentQuestion {
          id
          type
          text
          src
          tones
          answerId
          answered
          alternatives {
            id
            type
            text
            src
          }
        }
        lastQuestion {
          id
          answerId
        }
      }
    }
  }
`

const ANSWER = gql`
  mutation($answer: AnswerQuestionMultiplayerInput!) {
    answerQuestionMultiplayer(answer: $answer) {
      success
    }
  }
`

export { ANSWER, GAME_UPDATED, PING_MULTIPLAYER, REMOVE_PLAYER_FROM_GAME, GAME }

import gql from 'graphql-tag'

const GAME = gql`
  query GetGame {
    gameSingleplayer {
      categoryBackground
      lastQuestion {
        id
        answerId
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
    }
  }
`

const ANSWER = gql`
  mutation AnswerQuestion($answer: AnswerQuestionSingleplayerInput!) {
    answerQuestionSingleplayer(answer: $answer) {
      success
    }
  }
`

const CREATE_GAME_SINGLEPLAYER = gql`
  mutation CreateGame($game: CreateGameSingleplayerInput!) {
    createGameSingleplayer(game: $game) {
      success
    }
  }
`

const DELETE_SINGLEPLAYER_GAME = gql`
  mutation DeleteGame {
    deleteGameSingleplayer {
      success
    }
  }
`

const GAME_UPDATED = gql`
  subscription GameUpdated {
    gameSingleplayerSubscription {
      mutation
      gameSingleplayer {
        categoryBackground
        lastQuestion {
          id
          answerId
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
      }
    }
  }
`

export {
  GAME,
  ANSWER,
  CREATE_GAME_SINGLEPLAYER,
  DELETE_SINGLEPLAYER_GAME,
  GAME_UPDATED,
}

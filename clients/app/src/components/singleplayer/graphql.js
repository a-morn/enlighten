import gql from 'graphql-tag'

const GAME = gql`
  query GetGame {
    gameSingleplayer {
      categoryBackground
      categoryBackgroundBase64
      categoryName
      progression
      levels {
        _id
        name
      }
      lastQuestion {
        _id
        answerId
      }
      currentQuestion {
        _id
        type
        text
        src
        lqip
        tones
        answerId
        answered
        levelId
        alternatives {
          _id
          type
          text
          src
          lqip
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
        categoryBackgroundBase64
        categoryName
        progression
        levels {
          _id
          name
        }
        lastQuestion {
          _id
          answerId
        }
        currentQuestion {
          _id
          type
          text
          src
          lqip
          tones
          answerId
          answered
          levelId
          alternatives {
            _id
            type
            text
            src
            lqip
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

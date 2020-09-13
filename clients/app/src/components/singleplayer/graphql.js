import gql from 'graphql-tag'

const GAME = gql`
  query GetGame {
    gameSingleplayer {
      categoryBackground
      categoryBackgroundBase64
      categoryName
      progression
      isWon
      levels {
        _id
        name
        completed
      }
      lastQuestion {
        _id
        answerIds
      }
      currentQuestion {
        _id
        type
        text
        src
        lqip
        tones
        answerIds
        hasMultipleCorrectAnswers
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

const CHANGE_LEVEL_SINGLEPLAYER = gql`
  mutation ChangeLevel($levelId: ID!) {
    changeLevelSingleplayer(levelId: $levelId) {
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
        isWon
        levels {
          _id
          name
          completed
        }
        lastQuestion {
          _id
          answerIds
        }
        currentQuestion {
          _id
          type
          text
          src
          lqip
          tones
          answerIds
          hasMultipleCorrectAnswers
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
  CHANGE_LEVEL_SINGLEPLAYER,
}

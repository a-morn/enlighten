import { useMutation, useQuery } from '@apollo/react-hooks'
import { CategoryPicker } from 'components/category-picker'
import { store } from 'hooks/context/store.js'
import { usePrevious } from 'hooks/use-previous'
import * as R from 'ramda'
import React, { useCallback, useEffect, useState, useContext } from 'react'
import { useParams, withRouter } from 'react-router-dom'
import {
  GAME,
  ANSWER,
  CREATE_GAME_SINGLEPLAYER,
  DELETE_SINGLEPLAYER_GAME,
  GAME_UPDATED,
  CHANGE_LEVEL_SINGLEPLAYER,
} from './graphql'
import SingleplayerGame from './singleplayer-game'
import { WinScreenSingleplayer } from './win-screen'

function Singleplayer({ history }) {
  const [isStartingGame, setIsStartingGame] = useState()
  const [categoryId, setCategoryId] = useState()
  const [selectedAnswerIds, setSelectedAnswerIds] = useState([])
  const [isLoading] = useState(false)

  const { categoryId: categoryFromParams } = useParams()

  const globalState = useContext(store)
  const { dispatch } = globalState
  const {
    state: { playerId },
  } = useContext(store)

  const { data: gameData, subscribeToMore: gameSubscribeToMore } = useQuery(
    GAME,
  )
  const [createGame] = useMutation(CREATE_GAME_SINGLEPLAYER, {
    refetchQueries: [
      {
        query: GAME,
      },
    ],
  })
  const [deleteGame] = useMutation(DELETE_SINGLEPLAYER_GAME, {
    refetchQueries: [
      {
        query: GAME,
      },
    ],
  })
  const [answer] = useMutation(ANSWER)
  const [changeLevel] = useMutation(CHANGE_LEVEL_SINGLEPLAYER)

  const previousGameData = usePrevious(gameData)

  useEffect(() => {
    const url = R.pathOr(
      null,
      ['gameSingleplayer', 'categoryBackground'],
      gameData,
    )
    const base64 = R.pathOr(
      null,
      ['gameSingleplayer', 'categoryBackgroundBase64'],
      gameData,
    )
    dispatch({
      type: 'category-background-updated',
      background: { url, base64 },
    })
    return () =>
      dispatch({
        type: 'category-background-updated',
        background: { url: null, base64: null },
      })
  }, [gameData, dispatch])

  useEffect(() => {
    gameSubscribeToMore({
      document: GAME_UPDATED,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        } else {
          switch (subscriptionData.data.gameSingleplayerSubscription.mutation) {
            case 'DELETE': {
              return {
                gameSingleplayer: null,
              }
            }
            default: {
              return {
                gameSingleplayer:
                  subscriptionData.data.gameSingleplayerSubscription
                    .gameSingleplayer,
              }
            }
          }
        }
      },
    })
  }, [gameSubscribeToMore])

  useEffect(() => {
    if (!categoryId && categoryFromParams) {
      setCategoryId(categoryFromParams)
    } else if (categoryId && categoryId !== categoryFromParams) {
      history.push(`/singleplayer/${categoryId}`)
    }
  }, [categoryFromParams, categoryId, history, setCategoryId])

  useEffect(() => {
    if (
      R.pathOr(
        undefined,
        ['gameSingleplayer', 'currentQuestion', '_id'],
        previousGameData,
      ) !==
        R.pathOr(
          undefined,
          ['gameSingleplayer', 'currentQuestion', '_id'],
          gameData,
        ) ||
      (R.pathOr(
        undefined,
        ['gameSingleplayer', 'currentQuestion', 'answerIds'],
        previousGameData,
      ) &&
        R.pathOr(
          null,
          ['gameSingleplayer', 'currentQuestion', 'answerIds'],
          gameData,
        ) === null)
    ) {
      setSelectedAnswerIds([])
    }
  }, [previousGameData, gameData])

  const startGameRequest = useCallback(async () => {
    if (!isStartingGame) {
      setIsStartingGame(true)
      createGame({
        variables: {
          game: {
            playerId,
            categoryId,
          },
        },
      })
    }
  }, [categoryId, createGame, isStartingGame, playerId])

  const deleteGameCallback = useCallback(() => {
    if (!gameData) {
      return
    }
    const {
      gameSingleplayer: { id },
    } = gameData
    setIsStartingGame(false)

    return deleteGame({
      variables: {
        id,
      },
    })
  }, [deleteGame, gameData])

  const answerCallback = useCallback(
    answerIds => {
      answer({
        variables: {
          answer: {
            answerIds,
            questionId: gameData.gameSingleplayer.currentQuestion._id,
          },
        },
      })
    },
    [answer, gameData],
  )

  const toggleSelectAlternativeIdsCallback = useCallback(
    answerId => {
      setSelectedAnswerIds((selected = []) => {
        if (selected.includes(answerId)) {
          return selected.filter(id => id !== answerId)
        } else {
          return [...selected, answerId]
        }
      })
    },
    [setSelectedAnswerIds],
  )

  const changeLevelCallback = useCallback(
    levelId => {
      changeLevel({
        variables: {
          levelId,
        },
      })
    },
    [changeLevel],
  )

  const level = R.pathOr([], ['gameSingleplayer', 'levels'], gameData).find(
    ({ _id }) => _id === gameData.gameSingleplayer.currentQuestion.levelId,
  )

  const correctAnswerIds = R.pathOr(
    null,
    ['gameSingleplayer', 'currentQuestion', 'answerIds'],
    gameData,
  )

  return (
    <div className="flex flex-col items-center justify-center">
      {!R.path(['gameSingleplayer', 'currentQuestion'], gameData) && (
        <CategoryPicker
          onClick={startGameRequest}
          setCategoryId={setCategoryId}
          categoryId={categoryId}
          buttonLabel="Start"
          className="p-10"
          disabled={isStartingGame}
        />
      )}
      {R.path(['gameSingleplayer', 'currentQuestion'], gameData) &&
        !R.path(['gameSingleplayer', 'isWon'], gameData) && (
          <SingleplayerGame
            currentQuestion={gameData.gameSingleplayer.currentQuestion}
            level={level}
            categoryName={gameData.gameSingleplayer.categoryName}
            progression={gameData.gameSingleplayer.progression}
            isLoading={isLoading}
            selectedAnswerIds={selectedAnswerIds}
            correctAnswerIds={correctAnswerIds}
            levels={gameData.gameSingleplayer.levels}
            endGame={deleteGameCallback}
            answer={answerCallback}
            toggleSelectAlternative={toggleSelectAlternativeIdsCallback}
            changeLevel={changeLevelCallback}
          />
        )}
      {R.path(['gameSingleplayer', 'isWon'], gameData) && (
        <WinScreenSingleplayer
          data-testid="win-screen"
          close={deleteGameCallback}
          category={gameData.gameSingleplayer.categoryName}
        />
      )}
    </div>
  )
}

export default withRouter(Singleplayer)

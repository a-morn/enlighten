import React, { useState, useEffect, useCallback } from 'react'
//import LimitBreak from './limit-break'
import Question from '../../question'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'
import * as R from 'ramda'

const GET_LAST_ANSWER = gql`
  query {
    gameSingleplayer {
      id
      lastQuestion {
        id
        answerId
      }
    }
  }
`

const GET_CURRENT_QUESTION = gql`
  query {
    gameSingleplayer {
      id
      currentQuestion {
        id
        type
        text
        src
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
  mutation($questionId: ID!, $id: ID!) {
    answerQuestionSingleplayer(questionId: $questionId, answerId: $id) {
      id
      questionId
    }
  }
`

const NEW_QUESTION = gql`
  subscription {
    newQuestionSingleplayer {
      id
      type
      text
      src
      alternatives {
        id
        type
        text
        src
      }
    }
  }
`

function SingleplayerGame({ playerId, gameId, deleteGame }) {
  const {
    data: questionData,
    subscribeToMore: questionSubscribeToMore,
  } = useQuery(GET_CURRENT_QUESTION)
  useEffect(() => {
    questionSubscribeToMore({
      document: NEW_QUESTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        } else {
          return R.mergeDeepLeft(
            {
              gameSingleplayer: {
                currentQuestion: subscriptionData.data.newQuestionSingleplayer,
              },
            },
            prev,
          )
        }
      },
    })
  }, [questionSubscribeToMore])
  const { data: answerData } = useQuery(GET_LAST_ANSWER)

  const [answer] = useMutation(ANSWER, {
    refetchQueries: [
      {
        query: GET_LAST_ANSWER,
      },
    ],
  })

  const [correctAnswerId, setCorrectAnswerId] = useState()

  useEffect(() => {
    const answerQuestionId = R.pathOr(
      null,
      ['gameSingleplayer', 'lastQuestion', 'id'],
      answerData,
    )
    const currentQuestionId = R.pathOr(
      null,
      ['gameSingleplayer', 'currentQuestion', 'id'],
      questionData,
    )
    const answerId = R.pathOr(
      null,
      ['gameSingleplayer', 'lastQuestion', 'answerId'],
      answerData,
    )
    if (answerQuestionId === currentQuestionId) {
      setCorrectAnswerId(answerId)
    } else {
      setCorrectAnswerId(null)
    }
  }, [answerData, questionData])

  const [selectedAnswerId, setSelectedAlternativeId] = useState()
  const [isLoading] = useState(false)
  /*
  const [limitBreakLevel, setLimitBreakLevel] = useState(0)
  const [limitBreakTimerActive, setLimitBreakTimerActive] = useState(false)
  const [limitBreakStatus, setLimitBreakStatus] = useState('inactive')
  const [limitBreakCharge, setLimitBreakCharge] = useState(0)
  const [
    limitBreakHasAchievedGodlike,
    setLimitBreakHasAchievedGodlike,
  ] = useState(false)
  const [
    limitBreakHasAchievedDominating,
    setLimitBreakHasAchievedDominating,
  ] = useState(false)
  const [
    limitBreakHasAchievedRampage,
    setLimitBreakHasAchievedRampage,
  ] = useState(false)

  useEffect(() => {
    if (limitBreakStatus === 'charged') {
      if (limitBreakLevel > 50 && !limitBreakHasAchievedGodlike) {
        setLimitBreakHasAchievedGodlike(true)
        const audio = new Audio('godlike.mp3')
        audio.volume = 0.005
        audio.play()
      } else if (limitBreakLevel > 75 && !limitBreakHasAchievedDominating) {
        setLimitBreakHasAchievedDominating(true)
        const audio = new Audio('dominating.mp3')
        audio.volume = 0.0075
        audio.play()
      } else if (limitBreakLevel >= 100 && !limitBreakHasAchievedRampage) {
        setLimitBreakHasAchievedRampage(true)
        const audio = new Audio('rampage.mp3')
        audio.volume = 0.01
        audio.play()
      }
    }
  }, [
    limitBreakLevel,
    limitBreakHasAchievedGodlike,
    limitBreakHasAchievedDominating,
    limitBreakHasAchievedRampage,
    limitBreakStatus,
  ])
*/
  const alternativeSelected = useCallback(
    id => {
      answer({
        variables: {
          id,
          questionId: questionData.gameSingleplayer.currentQuestion.id,
        },
      })
      setSelectedAlternativeId(id)
      // mutate
    },
    [answer, questionData],
  )

  const endGame = useCallback(() => {
    deleteGame()
  }, [deleteGame])
  return (
    <div>
      {/* <LimitBreak
        level={limitBreakLevel}
        charge={limitBreakCharge}
        status={limitBreakStatus}
        max={100}
      /> */}
      {questionData && (
        <Question
          className="pt-4"
          disabled={isLoading /*|| limitBreakStatus === 'decharge' */}
          question={questionData.gameSingleplayer.currentQuestion}
          selectedAnswerId={selectedAnswerId}
          correctAnswerId={correctAnswerId}
          onAlternativeSelected={alternativeSelected}
        />
      )}
      <button
        className="bg-red-500 text-white rounded px-4 mt-10 shadow-lg p-4"
        onClick={endGame}
      >
        End game
      </button>
    </div>
  )
}

export default SingleplayerGame

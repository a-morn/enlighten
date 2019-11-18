import React, { useState, useEffect } from 'react'
import Question from '../../question'
import gql from 'graphql-tag'
import * as R from 'ramda'
import { useQuery, useMutation } from '@apollo/react-hooks'

const GET_CURRENT_QUESTION = gql`
  query {
    currentQuestionMultiplayer {
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

const GET_LAST_ANSWER = gql`
  query {
    lastAnswerMultiplayer {
      id
      questionId
    }
  }
`

const GET_SCORE = gql`
  query {
    score {
      id
      score
      name
      won
    }
  }
`

const ANSWER = gql`
  mutation($questionId: ID!, $id: ID!) {
    answerQuestionMultiplayer(questionId: $questionId, answerId: $id) {
      id
      questionId
    }
  }
`

const NEW_QUESTION = gql`
  subscription {
    newQuestionMultiplayer {
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

const NEW_ANSWER = gql`
  subscription {
    newAnswerMultiplayer {
      id
      questionId
    }
  }
`

const SCORE_UPDATED = gql`
  subscription {
    scoreUpdated {
      id
      score
      name
      won
    }
  }
`

function MultiplayerGame({ playerId, gameId, gameDeleted }) {
  const [selectedAnswerId, setSelectedAnswerId] = useState()
  const [isLoading] = useState(false)

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
          return {
            currentQuestionMultiplayer:
              subscriptionData.data.newQuestionMultiplayer,
          }
        }
      },
    })
  }, [questionSubscribeToMore])

  const { data: answerData, subscribeToMore: answerSubscribeToMore } = useQuery(
    GET_LAST_ANSWER,
  )
  useEffect(() => {
    answerSubscribeToMore({
      document: NEW_ANSWER,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        } else {
          return {
            lastAnswerMultiplayer: subscriptionData.data.newAnswerMultiplayer,
          }
        }
      },
    })
  }, [answerSubscribeToMore])

  const { data: scoreData, subscribeToMore: scoreSubscribeToMore } = useQuery(
    GET_SCORE,
  )
  useEffect(() => {
    scoreSubscribeToMore({
      document: SCORE_UPDATED,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        } else {
          return {
            score: subscriptionData.data.scoreUpdated,
          }
        }
      },
    })
  }, [scoreSubscribeToMore])

  const [answer] = useMutation(ANSWER)

  const [correctAnswerId, setCorrectAnswerId] = useState()

  useEffect(() => {
    const answerQuestionId = R.pathOr(
      null,
      ['lastAnswerMultiplayer', 'questionId'],
      answerData,
    )
    const currentQuestionId = R.pathOr(
      null,
      ['currentQuestionMultiplayer', 'id'],
      questionData,
    )
    const answerId = R.pathOr(null, ['lastAnswerMultiplayer', 'id'], answerData)
    if (answerQuestionId === currentQuestionId) {
      setCorrectAnswerId(answerId)
    } else {
      setCorrectAnswerId(null)
    }
  }, [answerData, questionData])

  const alternativeSelected = id => {
    answer({
      variables: {
        id,
        questionId: questionData.currentQuestionMultiplayer.id,
      },
    })
    setSelectedAnswerId(id)
  }

  const endGame = () => {
    gameDeleted()
  }

  const winner = scoreData ? scoreData.score.find(({ won }) => won) : null

  return (
    <div className="flex flex-col">
      {winner && <span>{winner.name} won!</span>}
      {scoreData && (
        <div className="flex justify-between text-lg">
          {scoreData.score.map(({ name, score, id }) => (
            <span key={id}>{`${name}: ${score || 0}`}</span>
          ))}
        </div>
      )}
      {questionData && (
        <Question
          className="pt-4"
          disabled={isLoading || winner}
          question={questionData.currentQuestionMultiplayer}
          selectedAnswerId={selectedAnswerId}
          correctAnswerId={correctAnswerId}
          onAlternativeSelected={alternativeSelected}
        />
      )}
      <button
        className="bg-red-500 text-white rounded px-4 mt-10 shadow-lg py-6 md:py-4"
        onClick={endGame}
      >
        {winner ? 'Leave game' : 'End game'}
      </button>
    </div>
  )
}

export default MultiplayerGame

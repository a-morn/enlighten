import React, { useState, useEffect } from 'react'
import Question from '../../question'

let socket

function MultiplayerGame({ playerId, gameId, deleteGame }) {
  const [question, setQuestion] = useState()
  const [selectedAlternativeId, setSelectedAlternativeId] = useState()
  const [correctAlternativeId, setCorrectAlternativeId] = useState()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    socket = new WebSocket(
      `ws://${process.env.REACT_APP_BFF_URL}/ws?type=multiplayer&playerId=${playerId}&gameId=${gameId}`,
    )
    socket.onopen = () =>
      socket.send(
        JSON.stringify({
          method: 'PATCH',
          resource: 'players',
          payload: { status: 'READY' },
        }),
      )
    socket.onmessage = event => {
      const { resource, method, payload } = JSON.parse(event.data)
      switch (resource) {
        case 'answers': {
          switch (method) {
            case 'POST': {
              const { correctAnswerId } = payload
              setCorrectAlternativeId(correctAnswerId)
              break
            }
            default: {
              throw Error(`Unsupported method ${method}`)
            }
          }
          break
        }
        case 'questions': {
          switch (method) {
            case 'POST':
              setCorrectAlternativeId(null)
              setSelectedAlternativeId(null)
              setQuestion(payload)
              setIsLoading(false)
              break
            default: {
              throw Error(`Unsupported method ${method}`)
            }
          }
          break
        }
        default:
          throw Error(`Unsuported resource: ${resource}`)
      }
    }

    return () => {
      socket.close()
    }
  }, [gameId, playerId])

  useEffect(() => {
    function postAlternative(alt) {
      setIsLoading(true)
      socket.send(
        JSON.stringify({
          method: 'POST',
          resource: 'answers',
          payload: { answerId: selectedAlternativeId },
        }),
      )
    }
    if (typeof selectedAlternativeId === 'number') {
      postAlternative(selectedAlternativeId)
    }
  }, [selectedAlternativeId, question])

  const alternativeSelected = altId => {
    setSelectedAlternativeId(altId)
  }

  const endGame = async () => {
    await fetch(
      `${process.env.REACT_APP_BFF_PROTOCOL}${process.env.REACT_APP_BFF_URL}/singleplayer/games/${gameId}`,
      {
        method: 'DELETE',
      },
    )
    deleteGame()
  }

  return (
    <div>
      {question && (
        <Question
          className="pt-4"
          disabled={isLoading}
          question={question}
          selectedAlternativeId={selectedAlternativeId}
          correctAlternativeId={correctAlternativeId}
          onAlternativeSelected={alternativeSelected}
        />
      )}
      <button
        className="bg-red-500 text-white rounded px-4 mt-10"
        onClick={endGame}
      >
        End game
      </button>
    </div>
  )
}

export default MultiplayerGame

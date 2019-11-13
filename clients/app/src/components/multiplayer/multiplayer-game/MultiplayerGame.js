import React, { useState, useEffect, useMemo } from 'react'
import Question from '../../question'
import useWebSocket from 'react-use-websocket'

function MultiplayerGame({ playerId, gameId, gameDeleted }) {
	const [winner, setWinner] = useState()
	const [socketUrl, setSocketUrl] = useState(`ws://${process.env.REACT_APP_BFF_URL}/ws`);
	const [score, setScore] = useState(0)
	const [opponentScore, setOpponentScore] = useState(0)
  const [question, setQuestion] = useState()
  const [selectedAlternativeId, setSelectedAlternativeId] = useState()
  const [correctAlternativeId, setCorrectAlternativeId] = useState()
  const [isLoading, setIsLoading] = useState(false)
	const options = useMemo(() => ({
		share: true,
		onClose: e => console.log('onClose', e),
		onError: e => console.log('onError', e),
		onOpen: e => {
			console.log('onOpen', e)
      sendMessage(
        JSON.stringify({
          method: 'PATCH',
          resource: 'players',
          payload: { status: 'READY' },
        }),
      )
      sendMessage(
        JSON.stringify({
          method: 'GET',
          resource: 'questions',
        }),
      )
      sendMessage(
        JSON.stringify({
          method: 'GET',
          resource: 'players',
        }),
      )
		},
		queryParams: { type: 'multiplayer', playerId, gameId }
	}), [playerId])
  const [sendMessage, lastMessage, readyState] = useWebSocket(socketUrl, options);

  useEffect(() => {
		if (!lastMessage) {
			return
		}
		const { resource, method, payload } = JSON.parse(lastMessage.data)
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
			case 'games': {
				switch(method) {
					case 'DELETE': {
						gameDeleted()	
						break
					}
				}
				break
			}
			case 'players': {
				switch(method) {
					case 'POST':
					case 'PATCH': {
						const { players } = payload
						setScore(players.find(p => p.playerId == playerId).score)
						setOpponentScore(players.find(p => p.playerId != playerId).score)
						const winner = players
							.find(({ winner }) => winner)
						if (winner) {
							setWinner(winner)
						}
						break
					}
				}
				break
			}
			default:
				throw Error(`Unsuported resource: ${resource}`)
		}
	}
 	, [gameId, playerId, lastMessage])

  useEffect(() => {
    function postAlternative(alt) {
      setIsLoading(true)
      sendMessage(
        JSON.stringify({
          method: 'POST',
          resource: 'answers',
          payload: { answerId: selectedAlternativeId, questionId: question.id },
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
    gameDeleted()
  }

  return (
    <div>
			{ winner && (<span>{winner.name} won!</span>)}
			<div className="flex justify-between text-lg">
			<span>You: {score}</span>
			<span>Opponent: {opponentScore}</span>
			</div>
      {question && (
        <Question
          className="pt-4"
          disabled={isLoading || winner}
          question={question}
          selectedAlternativeId={selectedAlternativeId}
          correctAlternativeId={correctAlternativeId}
          onAlternativeSelected={alternativeSelected}
        />
      )}
      <button
        className="bg-red-500 text-white rounded px-4 mt-10 shadow-lg py-6 md:py-4"
        onClick={endGame}
      >
        { winner ? 'Leave game' : 'End game' }
      </button>
    </div>
  )
}

export default MultiplayerGame

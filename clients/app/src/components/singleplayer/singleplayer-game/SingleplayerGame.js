import React, { useState, useEffect } from 'react'
import LimitBreak from './limit-break'
import Question from '../../question'
import useWebSocket from 'react-use-websocket';

const CONNECTION_STATUS_CONNECTING = 0;
const CONNECTION_STATUS_OPEN = 1;
const CONNECTION_STATUS_CLOSING = 2;
const CONNECTION_STATUS_CLOSED = 3;

function Game({ playerId, gameId, deleteGame }) {
	const [socketUrl, setSocketUrl] = useState(`ws://${process.env.REACT_APP_BFF_URL}/ws?type=singleplayer&playerId=${playerId}&gameId=${gameId}`)
	const [sendMessage, lastMessage, readyState] = useWebSocket(socketUrl)
  const [question, setQuestion] = useState()
  const [selectedAlternativeId, setSelectedAlternativeId] = useState()
  const [correctAlternativeId, setCorrectAlternativeId] = useState()
  const [isLoading, setIsLoading] = useState(false)
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
    setSocketUrl(`ws://${process.env.REACT_APP_BFF_URL}/ws?type=singleplayer&playerId=${playerId}&gameId=${gameId}`,
    )
  }, [gameId, playerId])

  useEffect(() => {
		if(readyState === CONNECTION_STATUS_OPEN) {
			sendMessage(
				JSON.stringify({
					method: 'GET',
					resource: 'questions',
				}),
			)
		}
	}, [readyState])

  useEffect(() => {
		if (!lastMessage) {
			return
		}
		console.log(lastMessage)
		const { resource, method, payload } = JSON.parse(lastMessage.data)
		switch (resource) {
			case 'limit-break':
				switch (method) {
					case 'PUT': {
						const { level, status, charge } = payload
						setLimitBreakLevel(level)
						setLimitBreakStatus(status)
						setLimitBreakCharge(charge)
						if (status !== 'charged') {
							setLimitBreakHasAchievedGodlike(false)
							setLimitBreakHasAchievedDominating(false)
							setLimitBreakHasAchievedRampage(false)
						}
						break
					}
					default: {
						throw Error(`Unsupported method ${method}`)
					}
				}
				break
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
					case 'POST': {
						setCorrectAlternativeId(null)
						setSelectedAlternativeId(null)
						setQuestion(payload)
						setIsLoading(false)
						setLimitBreakTimerActive(true)
						break
					}
					default: {
						throw Error(`Unsupported method ${method}`)
					}
				}
				break
			}
			default:
				throw Error(`Unsuported resource: ${resource}`)
		}
	}, [lastMessage])

  useEffect(() => {
    function postAlternative(alt) {
      setLimitBreakTimerActive(false)
      setIsLoading(true)
      sendMessage(
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

  useEffect(() => {
    let interval = null
    if (limitBreakTimerActive && false) {
      interval = setInterval(() => {
        setLimitBreakLevel(Math.max(limitBreakLevel - 1, 0))
      }, 250)
    }
    return () => clearInterval(interval)
  }, [limitBreakTimerActive, limitBreakLevel])

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
      <LimitBreak
        level={limitBreakLevel}
        charge={limitBreakCharge}
        status={limitBreakStatus}
        max={100}
      />
      {question && (
        <Question
          className="pt-4"
          disabled={isLoading || limitBreakStatus === 'decharge'}
          question={question}
          selectedAlternativeId={selectedAlternativeId}
          correctAlternativeId={correctAlternativeId}
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

export default Game

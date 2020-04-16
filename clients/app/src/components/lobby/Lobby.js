import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as R from 'ramda'
import React, { useCallback, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import GameRequestModal from './game-request-modal'
import PlayerList from './player-list'

const GAME_REQUEST = gql`
  query {
    gameRequest {
      id
      categoryId
      playerRequestId
      playerOfferedId
      playerRequestName
      playerOfferedName
      accepted
    }
  }
`

const REQUEST_GAME = gql`
  mutation($gameRequest: RequestGameInput!) {
    requestGame(gameRequest: $gameRequest) {
      success
    }
  }
`
const ANSWER_GAME_REQUEST = gql`
  mutation($answer: AnswerGameRequestInput!) {
    answerGameRequest(answer: $answer) {
      success
    }
  }
`

const DELETE_GAME_REQUEST = gql`
  mutation($gameRequest: DeleteGameRequestInput!) {
    deleteGameRequest(gameRequest: $gameRequest) {
      success
    }
  }
`

const PING_LOBBY = gql`
  mutation {
    pingLobby {
      success
    }
  }
`

export const GAME_REQUEST_SUBSCRIPTION = gql`
  subscription {
    gameRequestSubscription {
      gameRequest {
        id
        playerRequestName
        playerOfferedName
        playerRequestId
        playerOfferedId
        categoryId
        accepted
      }
      mutation
    }
  }
`

export function Lobby({ playerId, categoryId, players }) {
  const [requestGame] = useMutation(REQUEST_GAME, {
    refetchQueries: [
      {
        query: GAME_REQUEST,
      },
    ],
  })

  const [answerGameRequest] = useMutation(ANSWER_GAME_REQUEST, {
    refetchQueries: [
      {
        query: GAME_REQUEST,
      },
    ],
  })
  const [deleteGameRequest] = useMutation(DELETE_GAME_REQUEST)
  const [pingLobby] = useMutation(PING_LOBBY)

  useEffect(() => {
    const interval = setInterval(() => {
      pingLobby()
    }, 1000)

    return () => clearInterval(interval)
  }, [pingLobby])

  const {
    data: gameRequestData,
    subscribeToMore: gameRequestSubscribeToMore,
  } = useQuery(GAME_REQUEST)

  useEffect(() => {
    gameRequestSubscribeToMore({
      document: GAME_REQUEST_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        const {
          data: {
            gameRequestSubscription: { gameRequest, mutation },
          },
        } = subscriptionData
        const updatedGameRequest = {
          gameRequest: mutation === 'DELETE' ? null : gameRequest,
        }
        return updatedGameRequest
      },
    })
  }, [gameRequestSubscribeToMore])

  const requestGameCallback = playerOfferedId => {
    requestGame({
      variables: {
        gameRequest: {
          categoryId,
          playerRequestId: playerId,
          playerOfferedId,
        },
      },
    })
  }

  const acceptGameRequest = useCallback(() => {
    answerGameRequest({
      variables: {
        answer: {
          gameRequestId: gameRequestData.gameRequest.id,
          accepted: true,
        },
      },
    })
  }, [answerGameRequest, gameRequestData])

  const declineGameRequest = useCallback(() => {
    answerGameRequest({
      variables: {
        answer: {
          gameRequestId: gameRequestData.gameRequest.id,
          accepted: false,
        },
      },
    })
  }, [answerGameRequest, gameRequestData])

  const deleteGameRequestCallback = useCallback(
    _ => {
      deleteGameRequest({
        variables: {
          gameRequest: {
            gameRequestId: gameRequestData.gameRequest.id,
          },
        },
      })
    },
    [deleteGameRequest, gameRequestData],
  )
  return (
    <div className="flex flex-col my-auto">
      <div className="flex flex-col">
        {R.pathEq(['gameRequest', 'playerOfferedId'], playerId)(
          gameRequestData,
        ) &&
          R.pathEq(['gameRequest', 'accepted'], null)(gameRequestData) && (
            <GameRequestModal
              data-testid="game-request-challenged-modal"
              title="Challenge!"
              body={`${gameRequestData.gameRequest.playerRequestName} is challenging you`}
              acceptText="Let's go!"
              declineText="Rather not"
              onDecline={declineGameRequest}
              onAccept={acceptGameRequest}
            />
          )}
        {R.pathEq(['gameRequest', 'playerRequestId'], playerId)(
          gameRequestData,
        ) &&
          R.pathEq(['gameRequest', 'accepted'], null)(gameRequestData) && (
            <GameRequestModal
              data-testid="game-request-pending-modal"
              title="Challenge pending..."
              body={`Waiting for ${gameRequestData.gameRequest.playerOfferedName} to accept challenge`}
              declineText="Cancel challenge"
              onDecline={deleteGameRequestCallback}
            />
          )}
      </div>
      <div className="mt-4">
        <PlayerList
          players={players}
          onClick={requestGameCallback}
          currentPlayerId={playerId}
        />
      </div>
    </div>
  )
}

export const LobbyComponent = withRouter(Lobby)

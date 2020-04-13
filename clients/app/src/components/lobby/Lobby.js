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
      category
      playerRequestId
      playerOfferedId
      playerRequestName
      playerOfferedName
      accepted
    }
  }
`

const REQUEST_GAME = gql`
  mutation($gameRequest: GameRequestInput!) {
    requestGame(gameRequest: $gameRequest) {
      playerOfferedId
      playerRequestId
      category
      playerRequestName
      id
      accepted
    }
  }
`
const ANSWER_GAME_REQUEST = gql`
  mutation($gameRequestId: ID!, $accepted: Boolean!) {
    answerGameRequest(id: $gameRequestId, accepted: $accepted) {
      id
      accepted
    }
  }
`

const DELETE_GAME_REQUEST = gql`
  mutation($gameRequestId: ID!) {
    deleteGameRequest(id: $gameRequestId) {
      id
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
        category
        accepted
      }
      mutation
    }
  }
`

export function Lobby({ playerId, category, players }) {
  const [requestGame] = useMutation(REQUEST_GAME, {
    refetchQueries: [
      {
        query: GAME_REQUEST,
      },
    ],
  })
  const [answerGameRequest] = useMutation(ANSWER_GAME_REQUEST)
  const [deleteGameRequest] = useMutation(DELETE_GAME_REQUEST)

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
          category,
          playerRequestId: playerId,
          playerOfferedId,
        },
      },
    })
  }

  const acceptGameRequest = useCallback(() => {
    answerGameRequest({
      variables: {
        gameRequestId: gameRequestData.gameRequest.id,
        accepted: true,
      },
    })
  }, [answerGameRequest, gameRequestData])

  const declineGameRequest = useCallback(() => {
    answerGameRequest({
      variables: {
        gameRequestId: gameRequestData.gameRequest.id,
        accepted: false,
      },
    })
  }, [answerGameRequest, gameRequestData])

  const deleteGameRequestCallback = useCallback(
    _ => {
      deleteGameRequest({
        variables: {
          gameRequestId: gameRequestData.gameRequest.id,
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

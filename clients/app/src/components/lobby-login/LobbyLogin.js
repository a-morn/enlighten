import React, { useEffect } from 'react'
import { LobbyComponent } from '../lobby'
import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'

const ADD_PLAYER = gql`
  mutation($playerId: ID!) {
    addPlayer(id: $playerId) {
      id
    }
  }
`

const LOBBY = gql`
  query {
    lobby {
      players {
        id
      }
    }
  }
`

function LobbyLogin({ playerId }) {
  const [addPlayer] = useMutation(ADD_PLAYER)
  const { data: lobbyData } = useQuery(LOBBY)

  useEffect(() => {
    if (lobbyData && !lobbyData.hasJoined) {
      addPlayer({ variables: { playerId } })
    }
  }, [addPlayer, lobbyData, playerId])

  const removePlayerId = () => {}

  return <LobbyComponent playerId={playerId} removePlayerId={removePlayerId} />
}

export default LobbyLogin

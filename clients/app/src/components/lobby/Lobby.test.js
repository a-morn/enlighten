import { MockedProvider } from '@apollo/react-testing'
import { act, findByTestId, render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import wait from 'waait'
import { GET_CATEGORIES } from '../category-picker'
import {
  GAME,
  GAME_REQUEST_SUBSCRIPTION,
  GAME_SUBSCRIPTION,
  LOBBY,
  Lobby,
  LobbyComponent,
  PLAYER_JOINED,
} from './Lobby'

const mocks = ({ sentChallange = false }) => [
  {
    request: {
      query: GAME_REQUEST_SUBSCRIPTION,
    },
    result: {
      data: {
        gameRequestSubscription: {
          gameRequest: {
            id: 'game-request-id',
            playerOfferedId: sentChallange ? 'opponent-id' : 'id',
            playerOfferedName: 'name',
            playerRequestId: sentChallange ? 'id' : 'opponent-id',
            playerRequestName: sentChallange ? 'name' : 'opponent-name',
            category: 'category-1',
            accepted: null,
          },
          mutation: 'CREATED',
        },
      },
    },
  },
  {
    request: {
      query: LOBBY,
    },
    result: {
      data: {
        lobby: {
          players: [
            { category: 'category-1', id: 'id-1', name: 'player-name-1' },
            { category: 'category-1', id: 'id-2', name: 'player-name-2' },
            { category: 'category-2', id: 'id-3', name: 'player-name-3' },
          ],
        },
      },
    },
  },
  {
    request: {
      query: PLAYER_JOINED,
    },
    result: {
      data: {
        playerJoined: {
          name: 'new-player',
          id: 'new-player-id',
          category: 'category-1',
        },
      },
    },
  },
  {
    request: {
      query: GET_CATEGORIES,
    },
    result: {
      data: {
        categories: [
          { id: 'id-1', label: 'category-1' },
          { id: 'id-2', label: 'category-2' },
        ],
      },
    },
  },
  {
    request: {
      query: GAME_SUBSCRIPTION,
      variables: { mutation: 'CREATE' },
    },
    result: {
      data: {
        gameMultiplayer: {
          game: {
            id: 'new-game',
          },
        },
      },
    },
  },
  {
    request: {
      query: GAME,
    },
    result: {
      data: {
        gameMultiplayer: {
          id: 'new-game',
        },
      },
    },
  },
]

it('show game-request-challanged-modal when someone sent a game request', async () => {
  const { container } = render(
    <MemoryRouter keyLength={0}>
      <MockedProvider
        mocks={mocks({ sentChallange: false })}
        addTypename={false}
      >
        <LobbyComponent playerId={'id'} />
      </MockedProvider>
    </MemoryRouter>,
  )
  const gameRequestChallengedModal = await findByTestId(
    container,
    'game-request-challenged-modal',
  )

  expect(gameRequestChallengedModal).toBeTruthy()
})

it('show game-request-pending-modal when player sends another player a game request', async () => {
  const { container } = render(
    <MemoryRouter keyLength={0}>
      <MockedProvider
        mocks={mocks({ sentChallange: true })}
        addTypename={false}
      >
        <LobbyComponent playerId={'id'} />
      </MockedProvider>
    </MemoryRouter>,
  )
  const gameRequestChallengedModal = await findByTestId(
    container,
    'game-request-pending-modal',
  )

  expect(gameRequestChallengedModal).toBeTruthy()
})

it('it redirects to game when game created', async () => {
  await act(async () => {
    const mockedHistory = { push: jest.fn() }
    render(
      <MemoryRouter keyLength={0}>
        <MockedProvider
          mocks={mocks({ sentChallange: true })}
          addTypename={false}
        >
          <Lobby playerId={'id'} history={mockedHistory} />
        </MockedProvider>
      </MemoryRouter>,
    )

    await wait(() =>
      expect(mockedHistory.push).toHaveBeenCalledWith(
        `/multiplayer/new-game/id`,
      ),
    )
  })
})

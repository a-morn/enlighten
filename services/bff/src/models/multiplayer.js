const NotFoundError = require('../exceptions/not-found');
const shuffle = require('shuffle-array');
const { getQuestion } = require('./questions');
const periodicTable = require('../data/questions/periodic-table');
const got = require('../data/questions/game-of-thrones');
const allQuestions = {
  'game-of-thrones': got,
  'periodic-table': periodicTable
};

let players = [];
const games = [];
const gameRequests = [];

const addPlayer = (category, name) => {
  const playerId = Math.random();
  players.push({ playerId, category, name, status: 'IN_LOBBY' });
  return playerId;
};

const sendTo = (
  resource,
  method,
  payload,
  { onlyToCategory = null, exclude = [], include = null } = {}
) => {
  players
    .filter(
      ({ category }) => onlyToCategory === null || category === onlyToCategory
    )
    .filter(p => !exclude.includes(p.playerId))
    .filter(p => !include || include.includes(p.playerId))
    .forEach(({ wsClient }) =>
      wsClient.send(
        JSON.stringify({
          resource,
          method,
          payload
        })
      )
    );
};

const sendToPlayerId = (resource, method, payload, playerId) => {
  const player = players.find(p => p.playerId === playerId);

  if (!player) {
    throw NotFoundError(`No player with id ${playerId}`);
  }

  player.wsClient.send(
    JSON.stringify({
      resource,
      method,
      payload
    })
  );
};

const getNextQuestionId = gameId => {
  const game = getGameById(gameId);
  if (!game) {
    throw NotFoundError(`No game with id ${gameId}`);
  }
  const { lastQuestionId, levels } = game;
  const questionId = shuffle(
    levels[1].questions.filter(
      ({ id /*, record*/ }) => id !== lastQuestionId /*&& record < 2*/
    )
  )[0].id;

  game.lastQuestionId = questionId;
  return questionId;
};

const connectPlayerToWsLobby = (playerId, wsClient) => {
  const player = players.find(p => p.playerId === playerId);
  player.wsClient = wsClient;
};

const connectPlayerToWsGame = (playerId, gameId, wsClient) => {
  const game = getGameById(gameId);
  if (!game) {
    throw NotFoundError(`No such game: ${gameId}`);
  }
  const player = game.players.find(p => p.playerId === playerId);
  if (!player) {
    throw NotFoundError(`No such player in game: ${playerId}`);
  }
  player.wsClient = wsClient;
};

const allPlayersConnected = gameId => {
  const playersInGame = getPlayersInGame(gameId);
  return playersInGame.every(({ status }) => status === 'READY');
};

const listPlayers = category => {
  return players.filter(p => p.category === category);
};

const deletePlayer = playerIdToDelete => {
  const index = players.findIndex(
    ({ playerId }) => playerId === playerIdToDelete
  );

  if (index === -1) {
    throw NotFoundError('No such player');
  }

  const { category: onlyToCategory } = players[index];

  players.splice(index, 1);
  sendTo('players', 'DELETE', [{ playerId: playerIdToDelete }], {
    onlyToCategory
  });
};

const getPlayerById = playerId => {
  return players.find(p => p.playerId === playerId);
};

const getGameById = gameId => {
  return games.find(g => g.gameId === gameId);
};

const getPlayersInGame = gameId => {
  const game = getGameById(gameId);
  return game.players;
};

const getPlayerInGameById = (gameId, playerId) => {
  const game = getGameById(gameId);
  return game.players.find(p => p.playerId === playerId);
};

const sendNextQuestion = gameId => {
  const questionId = getNextQuestionId(gameId);
  const { answer, record, ...question } = getQuestion(questionId);
  const playerIdsInGame = getPlayersInGame(gameId).map(
    ({ playerId }) => playerId
  );
  sendTo('questions', 'POST', question, { include: playerIdsInGame });
};

const handleIncomingMessageGame = (
  playerId,
  gameId,
  ws,
  { resource, method, payload }
) => {
  switch (resource) {
    case 'answers': {
      switch (method) {
        case 'POST': {
          const { answerId } = payload;
          const correctAnswerId = answerId;
          ws.send(
            JSON.stringify({
              resource: 'answers',
              method: 'POST',
              payload: { correctAnswerId }
            })
          );
          setTimeout(() => {
            sendNextQuestion(gameId);
          }, 300);
          break;
        }
      }
      break;
    }
    case 'players': {
      switch (method) {
        case 'PATCH': {
          const { status } = payload;
          const player = getPlayerInGameById(gameId, playerId);
          player.status = status;
          if (allPlayersConnected(gameId)) {
            sendNextQuestion(gameId);
          }
        }
      }
    }
  }
};

const handleIncomingMessageLobby = (ws, { resource, method, payload }) => {
  switch (resource) {
    case 'players': {
      switch (method) {
        case 'GET': {
          ws.send(
            JSON.stringify({
              resource: 'players',
              method: 'POST',
              payload: players
            })
          );
          break;
        }
        case 'DELETE': {
          const { playerId } = payload;
          deletePlayer(playerId);
          ws.send(
            JSON.stringify({
              resource: 'players',
              method: 'DELETE',
              payload: [{ playerId }]
            })
          );
          break;
        }
        case 'PUT': {
          const { playerId, category, name } = payload;
          const player = getPlayerById(playerId);
          player.category = category;
          player.name = name;
          sendTo('players', 'DELETE', [player]);
          sendTo('players', 'POST', [player]);
        }
      }
      break;
    }
    case 'game-requests': {
      switch (method) {
        case 'POST': {
          const { playerRequestId, playerOfferedId, category } = payload;
          const gameRequestId = Math.random();
          gameRequests.push({
            playerRequestId,
            playerOfferedId,
            category,
            gameRequestId
          });
          const { name: playerRequestName } = getPlayerById(playerRequestId);
          sendToPlayerId(
            'game-requests',
            'POST',
            { playerRequestId, playerRequestName, gameRequestId },
            playerOfferedId
          );
          break;
        }
        case 'PUT': {
          const { accepted, gameRequestId } = payload;
          const {
            playerRequestId,
            playerOfferedId,
            category
          } = gameRequests.find(gr => gr.gameRequestId === gameRequestId);
          if (accepted) {
            const gameId = Math.random();
            const playerIdsInGame = [playerRequestId, playerOfferedId];
            console.log(allQuestions[category]);
            games.push({
              gameId,
              players: playerIdsInGame.map(playerId => ({ playerId })),
              category,
              levels: allQuestions[category]
            });
            const playersInGame = players.filter(p =>
              playerIdsInGame.includes(p.playerId)
            );

            playersInGame.forEach(p => (p.status = 'IN_GAME'));

            sendTo('games', 'POST', { gameId }, { include: playerIdsInGame });
            sendTo('players', 'PUT', [playersInGame], {
              onlyToCategory: category
            });
          } else {
            const index = gameRequests.findIndex(
              gr => gr.gameRequestId === gameRequestId
            );

            if (index === -1) {
              throw NotFoundError('No such game request');
            }

            const { playerRequestId } = gameRequests[index];

            players.splice(index, 1);
            sendToPlayerId(
              'game-requests',
              'DELETE',
              [{ gameRequestId }],
              playerRequestId
            );
          }
          break;
        }
        case 'DELETE': {
          const { gameRequestId } = payload;
          const index = gameRequests.findIndex(
            gr => gr.gameRequestId === gameRequestId
          );

          if (index === -1) {
            throw NotFoundError('No such game request');
          }

          const { playerRequestId } = gameRequests[index];

          sendToPlayerId(
            'game-requests',
            'DELETE',
            [{ gameRequestId }],
            playerRequestId
          );

          delete gameRequests[index];
          break;
        }
      }
      break;
    }
    case 'games': {
      switch (method) {
        case 'POST': {
          break;
        }
        case 'PUT': {
          break;
        }
        case 'DELETE':
          break;
      }
      break;
    }
    default:
      console.log(`Unsupported resource ${resource}`);
  }
};

const cleanUpLoop = () => {
  setInterval(() => {
    const playersToRemove = players
      .filter(({ wsClient }) => wsClient)
      .filter(({ wsClient: { readyState, OPEN } }) => readyState !== OPEN);

    players = players.filter(p => !playersToRemove.includes(p));

    playersToRemove.forEach(({ playerId, name, category }) =>
      sendTo('players', 'DELETE', [{ playerId, name }], { category })
    );
  }, 1000);
};

module.exports = {
  addPlayer,
  listPlayers,
  deletePlayer,
  connectPlayerToWsLobby,
  connectPlayerToWsGame,
  handleIncomingMessageLobby,
  handleIncomingMessageGame,
  cleanUpLoop
};

const {
  PlayerNotFoundError,
  GameNotFoundError,
  GameRequestNotFoundError
} = require('../errors');
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

const answerQuestion = (gameId, playerId, answerId, questionId) => {
  // Need a lock?
  let gameEnded = false;
  const game = getGameById(gameId);
  if (questionId === game.lastQuestionId) {
    const question = getQuestion(game.lastQuestionId);
    const player = getPlayerInGameById(gameId, playerId);
    const correct = answerId === question.answer;
    player.score += correct ? 1 : -1;
    if (player.score >= 1) {
      player.winner = true;
      gameEnded = true;
    }

    sendToGame(gameId, 'answers', 'POST', { correctAnswerId: question.answer });
    sendToGame(gameId, 'players', 'PATCH', { players: game.players });
  } else {
    console.log(`Tried to answer invalid question`);
  }
  return gameEnded;
};

const sendToLobby = (
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
    .filter(({ wsClient }) => wsClient)
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

const sendToGame = (gameId, resource, method, payload, playerId = null) => {
  const game = getGameById(gameId);
  game.players
    .filter(p => !playerId || p.playerId === playerId)
    .forEach(({ wsClient, playerId }) => {
      console.log(`sending to ${playerId}`);
      wsClient.send(
        JSON.stringify({
          resource,
          method,
          payload
        })
      );
    });
};
const sendToLobbyPlayerId = (resource, method, payload, playerId) => {
  const player = getPlayerById(playerId);

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
    throw new GameNotFoundError(`No game with id ${gameId}`);
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
  const player = getPlayerById(playerId);
  player.wsClient = wsClient;
};

const connectPlayerToWsGame = (playerId, gameId, wsClient) => {
  const player = getPlayerInGameById(gameId, playerId);
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
    throw new PlayerNotFoundError('No such player');
  }

  const { category: onlyToCategory } = players[index];

  players.splice(index, 1);
  sendToLobby('players', 'DELETE', [{ playerId: playerIdToDelete }], {
    onlyToCategory
  });
};

const getPlayerById = playerId => {
  const player = players.find(p => p.playerId === playerId);
  if (!player) {
    throw new PlayerNotFoundError(`No such player in game: ${playerId}`);
  }

  return player;
};

const getGameById = gameId => {
  const game = games.find(g => g.gameId === gameId);
  if (!game) {
    throw new GameNotFoundError(`No game with id ${gameId}`);
  }
  return game;
};

const getPlayersInGame = gameId => {
  const game = getGameById(gameId);
  return game.players;
};

const getPlayerInGameById = (gameId, playerId) => {
  const game = getGameById(gameId);
  const player = game.players.find(p => p.playerId === playerId);
  if (!player) {
    throw new PlayerNotFoundError(`No such player in game: ${playerId}`);
  }

  return player;
};

const sendNextQuestion = gameId => {
  const questionId = getNextQuestionId(gameId);
  const game = getGameById(gameId);
  game.lastQuestionId = questionId;
  const { answer, record, ...question } = getQuestion(questionId);
  sendToGame(gameId, 'questions', 'POST', question);
};

const sendCurrentQuestion = (gameId, playerId) => {
  const { lastQuestionId } = getGameById(gameId);
  if (lastQuestionId) {
    const { answer, record, ...question } = getQuestion(lastQuestionId);
    sendToGame(gameId, 'questions', 'POST', question, playerId);
  }
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
          const { answerId, questionId } = payload;
          const gameEnded = answerQuestion(
            gameId,
            playerId,
            answerId,
            questionId
          );
          if (!gameEnded) {
            setTimeout(() => {
              sendNextQuestion(gameId);
            }, 300);
          }
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
          break;
        }
        case 'GET': {
          const game = getGameById(gameId);
          sendToGame(gameId, 'players', 'POST', { players: game.players });
        }
      }
      break;
    }
    case 'questions': {
      switch (method) {
        case 'GET': {
          sendCurrentQuestion(gameId, playerId);
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
          break;
        }
        case 'PUT': {
          const { playerId, category, name } = payload;
          const player = getPlayerById(playerId);
          player.category = category;
          player.name = name;
          sendToLobby('players', 'DELETE', [player]);
          sendToLobby('players', 'POST', [player]);
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
          sendToLobbyPlayerId(
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
            games.push({
              gameId,
              players: playerIdsInGame.map(playerId => ({
                playerId,
                score: 0,
                winner: false,
                name: getPlayerById(playerId).name
              })),
              category,
              levels: allQuestions[category],
              started: false
            });
            const playersInGame = players.filter(p =>
              playerIdsInGame.includes(p.playerId)
            );

            playersInGame.forEach(p => (p.status = 'IN_GAME'));

            sendToLobby(
              'games',
              'POST',
              { gameId },
              { include: playerIdsInGame }
            );
            sendToLobby('players', 'PUT', [playersInGame], {
              onlyToCategory: category
            });
          } else {
            const index = gameRequests.findIndex(
              gr => gr.gameRequestId === gameRequestId
            );

            if (index === -1) {
              throw new GameRequestNotFoundError('No such game request');
            }

            const { playerRequestId } = gameRequests[index];

            players.splice(index, 1);
            sendToLobbyPlayerId(
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
            throw new GameNotFoundError('No such game request');
          }

          const { playerRequestId } = gameRequests[index];

          sendToLobbyPlayerId(
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
      console.error(`Unsupported resource ${resource}`);
  }
};

const cleanUpLoop = () => {
  setInterval(() => {
    const playersToRemove = players.filter(
      ({ wsClient }) => !wsClient || wsClient.readyState === wsClient.CLOSED
    );

    players = players.filter(p => !playersToRemove.includes(p));

    if (playersToRemove.length) {
      console.log(
        `Removing players ${playersToRemove.map(({ playerId }) => playerId)}`
      );
    }
    playersToRemove.forEach(({ playerId, name, category }) =>
      sendToLobby('players', 'DELETE', [{ playerId, name }], { category })
    );
  }, 1000);
};

const startGameLoop = () => {
  setInterval(() => {
    games
      .filter(({ started }) => !started)
      .forEach(g => {
        if (allPlayersConnected(g.gameId)) {
          sendNextQuestion(g.gameId);
          g.started = true;
          console.log(`Started game ${g.gameId}`);
        }
      });
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
  cleanUpLoop,
  startGameLoop
};

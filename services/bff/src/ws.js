const ws = require('ws');
const http = require('http');
const { parse } = require('url');
const {
  connectPlayerToWsSingleplayer,
  handleIncomingMessagesSingleplayer
} = require('./models/singleplayer');
const {
  connectPlayerToWsLobby,
  handleIncomingMessageLobby,
  connectPlayerToWsGame,
  handleIncomingMessageGame
} = require('./models/multiplayer');

let wss;

module.exports = app => {
  if (!wss) {
    const server = http.createServer(app);
    wss = new ws.Server({ server });
    server.listen(3000, () => {
      console.log(`Server started on port ${server.address().port} :)`);
    });
    wss.on('connection', (ws, { url }) => {
      const { playerId, gameId, type } = parse(url, {
        parseQueryString: true
      }).query;
      switch (type) {
        case 'singleplayer': {
          connectPlayerToWsSingleplayer(gameId, ws);
          ws.on('message', data => {
            if (data) {
              console.log(`Singleplayer - gameId: ${gameId} - data ${data}`);
              handleIncomingMessagesSingleplayer(
                ws,
                gameId,
                playerId,
                JSON.parse(data)
              );
            }
          });
          break;
        }
        case 'multiplayer': {
          connectPlayerToWsGame(parseFloat(playerId), parseFloat(gameId), ws);
          ws.on('message', data => {
            if (data) {
              console.log(
                `Multiplayer - gameId: ${gameId} - playerId ${playerId} - data ${data}`
              );
              handleIncomingMessageGame(
                parseFloat(playerId),
                parseFloat(gameId),
                ws,
                JSON.parse(data)
              );
            }
          });
          break;
        }
        case 'lobby': {
          connectPlayerToWsLobby(parseFloat(playerId), ws);
          ws.on('message', data => {
            if (data) {
              console.log(`Lobby - playerId ${playerId} - data ${data}`);
              handleIncomingMessageLobby(ws, JSON.parse(data));
            }
          });
          break;
        }
        default: {
          console.log(`Unsupported type $type}`);
        }
      }
    });
  }
  return wss;
};

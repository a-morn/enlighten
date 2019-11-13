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
const { PlayerNotFoundError, GameNotFoundError } = require('./errors');

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
          try {
            connectPlayerToWsGame(parseFloat(playerId), parseFloat(gameId), ws);
          } catch (e) {
            console.error(e);
            console.log(e);
            if (e instanceof PlayerNotFoundError) {
              ws.send(
                JSON.stringify({
                  resource: 'players',
                  method: 'DELETE',
                  playerId: parseFloat(playerId)
                })
              );
            } else if (e instanceof GameNotFoundError) {
              ws.send(
                JSON.stringify({
                  resource: 'games',
                  method: 'DELETE',
                  playerId: parseFloat(gameId)
                })
              );
            }
          }
          ws.on('message', data => {
            if (data) {
              console.log(
                `Multiplayer - gameId: ${gameId} - playerId ${playerId} - data ${data}`
              );
              try {
                handleIncomingMessageGame(
                  parseFloat(playerId),
                  parseFloat(gameId),
                  ws,
                  JSON.parse(data)
                );
              } catch (e) {
                if (e instanceof PlayerNotFoundError) {
                  console.error(e);
                  console.log(e);
                  ws.send(
                    JSON.stringify({
                      resource: 'players',
                      method: 'DELETE',
                      playerId: parseFloat(playerId)
                    })
                  );
                } else if (e instanceof GameNotFoundError) {
                  console.error(e);
                  console.log(e);
                  ws.send(
                    JSON.stringify({
                      resource: 'games',
                      method: 'DELETE',
                      playerId: parseFloat(gameId)
                    })
                  );
                } else {
                  throw e;
                }
              }
            }
          });
          break;
        }
        case 'lobby': {
          try {
            connectPlayerToWsLobby(parseFloat(playerId), ws);
          } catch (e) {
            if (e instanceof PlayerNotFoundError) {
              ws.send(
                JSON.stringify({
                  resource: 'players',
                  method: 'DELETE',
                  playerId: parseFloat(playerId)
                })
              );
            } else {
              throw e;
            }
          }
          ws.on('message', data => {
            if (data) {
              try {
                handleIncomingMessageLobby(ws, JSON.parse(data));
              } catch (e) {
                if (e instanceof PlayerNotFoundError) {
                  ws.send(
                    JSON.stringify({
                      resource: 'players',
                      method: 'DELETE',
                      playerId: parseFloat(playerId)
                    })
                  );
                } else {
                  throw e;
                }
              }
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

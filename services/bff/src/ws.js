const ws = require('ws');
const http = require('http');
const { parse } = require('url');

let wss;

module.exports = app => {
  if (!wss) {
    const server = http.createServer(app);
    wss = new ws.Server({ server });
    server.listen(3000, () => {
      console.log(`Server started on port ${server.address().port} :)`);
    });
    wss.on(
      'connection',
      (ws, { url }) =>
        (ws.playerId = parse(url, { parseQueryString: true }).query.playerId)
    );
  }
  return wss;
};

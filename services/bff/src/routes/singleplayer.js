const express = require('express');
const router = express.Router();
const { errorHandledAction } = require('../error-handled-action');

const { createGame, deleteGame } = require('../models/singleplayer');

router.post('/games', ({ body: { category } }, res) => {
  const gameId = createGame(category);
  res.send({ gameId });
});

router.delete('/games/:gameId', ({ params: { gameId } }, res) => {
  errorHandledAction(res, () => {
    deleteGame(gameId);
    res.status(204).send();
  });
});

module.exports = router;

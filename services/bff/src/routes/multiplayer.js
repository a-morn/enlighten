const express = require('express');
const router = express.Router();
const { addPlayer, listPlayers } = require('../models/multiplayer');
//const { errorHandledAction } = require('../error-handled-action');

router.post('/players', ({ body: { category, name } }, res) => {
  const playerId = addPlayer(category, name);
  res.status(200).send({ playerId });
});

router.get('/players', ({ query: { category } }, res) => {
  const players = listPlayers(category);
  res.send(players);
});
/*
router.get('/:gameId/questions/next', ({ params: { gameId } }, res) => {
  const questionId = getNextQuestionId(gameId);
  res.redirect(303, `/questions/${questionId}`);
});

router.post(
  '/:gameId/questions/:questionId/answer',
  (
    { query: { playerId }, params: { questionId, gameId }, body: { answer } },
    res
  ) => {
    const correctAnswer = answerQuestion(gameId, questionId, answer);
    updateLimitBreakOnAnswer(gameId, answer === correctAnswer, new Date());

    res.send({ correctAnswer });
  }
);

router.delete('/:gameId', ({ params: { gameId } }, res) => {
  errorHandledAction(res, () => {
    deleteGame(gameId);
    res.status(204).send();
  });
});
*/

module.exports = router;

const express = require('express');
const router = express.Router();
const { updateLimitBreakOnAnswer } = require('../models/limit-break');
const { errorHandledAction } = require('../error-handled-action');

const {
  getNextQuestionId,
  answerQuestion,
  createGame,
  deleteGame
} = require('../models/games');

router.post('/', ({ body: { category } }, res) => {
  const gameId = createGame(category);
  res.send({ gameId });
});

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
    updateLimitBreakOnAnswer(playerId, answer === correctAnswer, new Date());

    res.send({ correctAnswer });
  }
);

router.delete('/:gameId', ({ params: { gameId } }, res) => {
  errorHandledAction(res, () => {
    deleteGame(gameId);
    res.status(204).send();
  });
});

module.exports = router;

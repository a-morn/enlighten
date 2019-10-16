const express = require('express');
const router = express.Router();
const { getQuestion } = require('../models/questions');

router.get('/:questionId', ({ params: { questionId } }, res) => {
  const { answer, record, ...question } = getQuestion(questionId);
  res.send(question);
});

module.exports = router;

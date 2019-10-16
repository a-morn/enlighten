require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const ws = require('./src/ws');
const { startLoop } = require('./src/models/limit-break');

const app = express();
ws(app);

const gamesRouter = require('./src/routes/games');
const questionsRouter = require('./src/routes/questions');
const categoriesRouter = require('./src/routes/categories');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.use('/games', gamesRouter);
app.use('/questions', questionsRouter);
app.use('/categories', categoriesRouter);

startLoop();

module.exports = app;

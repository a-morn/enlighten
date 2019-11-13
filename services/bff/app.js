require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const ws = require('./src/ws');
const { limitBreakLoop } = require('./src/models/singleplayer');
const { cleanUpLoop, startGameLoop } = require('./src/models/multiplayer');

const app = express();
ws(app);

const singleplayerRouter = require('./src/routes/singleplayer');
const multiplayerRouter = require('./src/routes/multiplayer');
const questionsRouter = require('./src/routes/questions');
const categoriesRouter = require('./src/routes/categories');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.use('/singleplayer', singleplayerRouter);
app.use('/multiplayer', multiplayerRouter);
app.use('/questions', questionsRouter);
app.use('/categories', categoriesRouter);

limitBreakLoop();
cleanUpLoop();
startGameLoop();

module.exports = app;

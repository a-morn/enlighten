const {resolve} = require('path')

require('dotenv').config({ path: resolve(__dirname, './.env')});

const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const ws = require('./src/ws');
//const { limitBreakLoop } = require('./src/models/limit-break');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

//limitBreakLoop();
//cleanUpLoop();
//startGameLoop();

module.exports = app;

ws(app);

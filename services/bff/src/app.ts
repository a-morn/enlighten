import { resolve } from 'path'

require('dotenv').config({ path: resolve(__dirname, '../.env') });

import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan'
import cors from 'cors';
import ws from './ws';
//const { limitBreakLoop } = require('./src/models/limit-break');

const app = express();

app.use(logger('dev') as any);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser() as any);
app.use(cors() as any);

//limitBreakLoop();
//cleanUpLoop();
//startGameLoop();

ws(app);

export default app;

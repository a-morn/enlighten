import { resolve } from 'path'

import express from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import cors from 'cors'
//const { limitBreakLoop } = require('./src/models/limit-break');

const app = express()

app.use(logger('dev') as any)
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser() as any)
app.use(cors() as any)

//limitBreakLoop();
//cleanUpLoop();
//startGameLoop();

export default app

import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import logger from 'morgan'
//const { limitBreakLoop } = require('./src/models/limit-break');

const app = express()

app.use(logger('dev') as any) // eslint-disable-line @typescript-eslint/no-explicit-any
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser() as any) // eslint-disable-line @typescript-eslint/no-explicit-any
app.use(cors() as any) // eslint-disable-line @typescript-eslint/no-explicit-any

//limitBreakLoop();
//cleanUpLoop();
//startGameLoop();

export default app
